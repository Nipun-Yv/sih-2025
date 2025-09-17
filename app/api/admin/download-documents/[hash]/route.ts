import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Document from '@/models/Document';
import JSZip from 'jszip';

export async function GET(
  _req: Request,
  { params }: { params: { hash: string } }
) {
  try {
    await dbConnect();
    const { hash } = params;

    const document = await Document.findOne({ documentsHash: hash });
    if (!document) {
      return NextResponse.json({
        success: false,
        message: 'Document not found',
      }, { status: 404 });
    }

    const zip = new JSZip();
    if (Array.isArray(document.files)) {
      document.files.forEach((file: any) => {
        if (file.data && file.filename) {
          zip.file(file.filename, Buffer.from(file.data, 'base64'));
        }
      });
    }



// Generate Node.js Buffer
const zipBuffer: Buffer = await zip.generateAsync({ type: 'nodebuffer' });

// Convert Buffer safely to ArrayBuffer
const arrayBuffer: ArrayBuffer = Uint8Array.from(zipBuffer).buffer;

return new NextResponse(arrayBuffer, {
  headers: {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="documents-${hash.slice(0, 8)}.zip"`,
  },
});

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to download documents',
      error: err.message,
    }, { status: 500 });
  }
}
