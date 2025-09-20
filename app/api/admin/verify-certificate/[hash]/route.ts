import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Certificate from '@/models/Certificate';
import { TourismRegistryContract } from '@/utils/contract-utils';

function normalizeBigInt(obj: any) {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function GET(req: Request, { params }: { params: { hash: string } }) {
  try {
    await dbConnect();

    const hash = params.hash;
    console.log("Hash param is:", hash);

    if (!hash) {
      return NextResponse.json({
        success: false,
        message: 'Please provide certificate hash for verification',
      }, { status: 400 });
    }

    const certificate = await Certificate.findOne({ certificateHash: hash })
      .populate("application", "fullName city verificationScore panHash vendorType photo gstNumber ")
      .exec();

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificate not found',
        verified: false,
      }, { status: 404 });
    }

    const certificateNumber = certificate.certificateNumber;
    const panHash = certificate.application?.panHash;
    const vendorType = certificate.application?.vendorType;
    const photo = certificate.application?.photo;
    const gstNumber = certificate.application?.gstNumber;
    const transactionHash =certificate.transactionHash
    const blockchainTxUrl=certificate.blockchainTxUrl
    console.log("Certificate Number:", certificateNumber);
    console.log("PAN Hash:", panHash);
    console.log("Vendor Type:", vendorType);
    console.log("Photo Hash:", photo);
    console.log("GST/License Number:", gstNumber);
    console.log("Tx hash ", transactionHash);
    console.log("URl is",blockchainTxUrl);
    let blockchainVerification = null;
    if (panHash) {
      try {
        const contract = new TourismRegistryContract();
        blockchainVerification = await contract.verifyCertificate(panHash);
      } catch (err) {
        console.error("Blockchain verification error:", err);
      }
    }
    console.log("Blockchain verification is", blockchainVerification);
    const certificateData = {
      certificateNumber,
      certificateHash: certificate.certificateHash,
      fullName: certificate.fullName,
      serviceType: certificate.serviceType,
      issuedDate: certificate.issuedDate,
      expiryDate: certificate.expiryDate,
      city: certificate.city,
      verificationScore: certificate.verificationScore,
      providerId: certificate.providerId,  
      downloadUrl: `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`,
      verificationUrl: certificate.qrCodeData,
      transactionHash:transactionHash,
      blockchainTxUrl:blockchainTxUrl,
      vendorType,
      photo,
      gstNumber,
    };

    return NextResponse.json(
      normalizeBigInt({
        success: true,
        verified: true,
        certificate: certificateData,
        panHash,
        blockchainVerification,
      })
    );

  } catch (err: any) {
    console.error("Certificate verification error:", err);
    return NextResponse.json({
      success: false,
      message: "Failed to verify certificate",
      verified: false,
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { action, certificateId, reason } = await req.json();

    if (!['revoke', 'reactivate'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid action. Use "revoke" or "reactivate"',
      }, { status: 400 });
    }

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificate not found',
      }, { status: 404 });
    }

    certificate.isActive = action === 'reactivate';
    await certificate.save();

    console.log(`Certificate ${action}d:`, {
      certificateId,
      certificateNumber: certificate.certificateNumber,
      providerId: certificate.providerId,
      reason,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Certificate ${action}d successfully`,
      certificate: {
        id: certificate._id,
        certificateNumber: certificate.certificateNumber,
        isActive: certificate.isActive,
        updatedAt: certificate.updatedAt,
      },
    });

  } catch (err: any) {
    console.error('Certificate action error:', err);
    return NextResponse.json({
      success: false,
      message: `Failed to load certificate`,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    }, { status: 500 });
  }
}