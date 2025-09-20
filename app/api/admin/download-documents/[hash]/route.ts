import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function GET(
  _req: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;
    console.log("IPFS hash is", hash);

    const ipfsGateways = [
      `https://ipfs.io/ipfs/${hash}`,
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];

    let ipfsData;
    let gatewayUsed;

    for (const gateway of ipfsGateways) {
      try {
        console.log(`Trying gateway: ${gateway}`);
        const response = await fetch(gateway, {
          headers: {
            'Accept': '*/*',
          },
          signal: AbortSignal.timeout(10000) 
        });

        if (response.ok) {
          ipfsData = await response.arrayBuffer();
          gatewayUsed = gateway;
          console.log(`Successfully fetched from: ${gateway}`);
          break;
        } else {
          console.log(`Gateway ${gateway} returned status: ${response.status}`);
        }
      } catch (gatewayError) {
        console.log(`Gateway ${gateway} failed:`, gatewayError);
        continue;
      }
    }

    if (!ipfsData) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch data from IPFS. All gateways failed.',
      }, { status: 404 });
    }

    const uint8Array = new Uint8Array(ipfsData);
    const isZip = uint8Array[0] === 0x50 && uint8Array[1] === 0x4b; 

    if (isZip) {
      return new NextResponse(ipfsData, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="ipfs-${hash.slice(0, 8)}.zip"`,
        },
      });
    }

    try {
      const textData = new TextDecoder().decode(ipfsData);
      const jsonData = JSON.parse(textData);

      if (jsonData.files && Array.isArray(jsonData.files)) {
        const zip = new JSZip();
        
        jsonData.files.forEach((file: any) => {
          if (file.data && file.filename) {
            if (typeof file.data === 'string' && file.data.includes('base64')) {
              const base64Data = file.data.split(',')[1] || file.data;
              zip.file(file.filename, base64Data, { base64: true });
            } else {
              zip.file(file.filename, file.data);
            }
          }
        });

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const arrayBuffer = Uint8Array.from(zipBuffer).buffer;

        return new NextResponse(arrayBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="ipfs-${hash.slice(0, 8)}.zip"`,
          },
        });
      }
    } catch (jsonError) {
      console.log("Not JSON data, treating as single file");
    }

    const zip = new JSZip();
    
    let filename = `file-${hash.slice(0, 8)}`;
    let extension = '';
    
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      extension = '.jpg';
    } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) {
      extension = '.png';
    } else if (uint8Array[0] === 0x25 && uint8Array[1] === 0x50) {
      extension = '.pdf';
    } else {
      try {
        const textContent = new TextDecoder().decode(ipfsData);
        if (textContent.trim().startsWith('{') || textContent.trim().startsWith('[')) {
          extension = '.json';
        } else if (textContent.includes('<!DOCTYPE html') || textContent.includes('<html')) {
          extension = '.html';
        } else {
          extension = '.txt';
        }
      } catch {
        extension = '.bin';
      }
    }

    zip.file(filename + extension, ipfsData);
    
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const arrayBuffer = Uint8Array.from(zipBuffer).buffer;

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="ipfs-${hash.slice(0, 8)}.zip"`,
        'X-IPFS-Gateway': gatewayUsed || 'unknown',
      },
    });

  } catch (err: any) {
    console.error('Error fetching IPFS data:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch and process IPFS data',
      error: err.message,
    }, { status: 500 });
  }
}