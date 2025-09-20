import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import Certificate from '@/models/Certificate';
import User from '@/models/User';
import { TourismRegistryContract, ServiceType } from '@/utils/contract-utils';
import { PDFGenerationService } from '@/utils/certificate-generator';
import { PinataIPFSService } from '@/utils/ipfs-service';

function getServiceTypeName(serviceType: number): string {
  switch (serviceType) {
    case 0: return 'Tourist Guide';
    case 1: return 'Accommodation Provider';
    case 2: return 'Food & Restaurant';
    case 3: return 'Transportation';
    case 4: return 'Activity Provider';
    default: return 'Tourism Provider';
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { providerId } = await req.json();

    if (!providerId) {
      return NextResponse.json({
        success: false,
        message: 'Provider ID is required',
      }, { status: 400 });
    }

    const existingCertificate = await Certificate.findOne({ providerId });
    if (existingCertificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificate already exists for this provider',
        certificate: existingCertificate,
      }, { status: 409 });
    }

    const contract = new TourismRegistryContract();
    
    const contractResult = await contract.generateCertificate(providerId);
    if (!contractResult.success) {
      return NextResponse.json({
        success: false,
        message: contractResult.error || 'Failed to generate certificate on blockchain',
      }, { status: 500 });
    }
    console.log("COntract result is ",contractResult);
    const providerDetails = await contract.getProviderDetails(providerId);
    if (!providerDetails) {
      return NextResponse.json({
        success: false,
        message: 'Provider details not found on blockchain',
      }, { status: 404 });
    }

    const application = await Application.findOne({ providerId });
    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Application not found in database',
      }, { status: 404 });
    }

    const user = await User.findById(application.user);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User details not found',
      }, { status: 404 });
    }
    console.log("Reached till line no 80", user);
    
    const serviceTypeName = getServiceTypeName(Number(providerDetails.provider.serviceType));
    const qrVerificationUrl = `${process.env.NEXT_PUBLIC_VERIFY_URL}/${contractResult.certificateHash}`;
    
    const blockchainTxUrl = `https://amoy.polygonscan.com/tx/${contractResult.transactionHash}`;
    const blockchainVerifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify/blockchain/${contractResult.certificateHash}`;
    
    const certificateData = {
      fullName: application.fullName || user.fullName || `${user.firstName} ${user.lastName}`.trim(),
      serviceType: serviceTypeName,
      certificateNumber: '',
      issuedDate: new Date(),
      expiryDate: new Date(Number(providerDetails.provider.expiryDate) * 1000),
      city: application.city || 'Jharkhand',
      verificationScore: Number(application.verificationScore) || 80,
      certificateHash: contractResult.certificateHash || '',
      qrCodeData: qrVerificationUrl,
      providerId: providerId,
      verifiedBy: 'Jharkhand Tourism Authority',
      applicationId: application.applicationId,
      phone: user.phone || undefined,
      email: user.email || undefined,
      
      vendorType: application.vendorType,
      photo: application.photo || undefined,
      gstNumber: application.gstNumber || undefined,
      
      transactionHash: contractResult.transactionHash,
      blockchainTxUrl: blockchainTxUrl,
      blockchainVerifyUrl: blockchainVerifyUrl,
    };

    const val = await Certificate.findOne({ applicationId: application.applicationId });
    if (val) {
      certificateData.certificateNumber = val.certificateNumber;
    }

    const pdfService = new PDFGenerationService();
    const pdfBuffer = await pdfService.generateCertificatePDF(certificateData);

    const pinataService = new PinataIPFSService();
    
    const pdfFile = new File([new Uint8Array(pdfBuffer)], `certificate-${providerId}.pdf`, { 
      type: 'application/pdf' 
    });
    
    const ipfsUploadResult = await pinataService.uploadFile(pdfFile);
    
    if (!ipfsUploadResult.hash) {
      return NextResponse.json({
        success: false,
        message: 'Failed to upload certificate to IPFS',
      }, { status: 500 });
    }

    const certificate = await Certificate.create({
      providerId,
      certificateHash: contractResult.certificateHash,
      ipfsHash: ipfsUploadResult.hash,
      qrCodeData: qrVerificationUrl,
      fullName: certificateData.fullName,
      serviceType: serviceTypeName,
      issuedDate: certificateData.issuedDate,
      expiryDate: certificateData.expiryDate,
      city: certificateData.city,
      verificationScore: certificateData.verificationScore,
      isActive: true,
      application: application._id,
      
      transactionHash: contractResult.transactionHash,
      blockchainTxUrl: blockchainTxUrl,
      blockchainVerifyUrl: blockchainVerifyUrl,
    });

    await Application.findByIdAndUpdate(application._id, {
      status: 'approved'
    });

    await User.findByIdAndUpdate(user._id, {
      registrationStatus: 'complete',
      isVerified: true,
      providerId: providerId,
      expiryDate: certificateData.expiryDate
    });

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate._id,
        certificateNumber: certificate.certificateNumber,
        certificateHash: certificate.certificateHash,
        ipfsHash: certificate.ipfsHash,
        qrCodeData: certificate.qrCodeData,
        fullName: certificate.fullName,
        serviceType: certificate.serviceType,
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate,
        city: certificate.city,
        verificationScore: certificate.verificationScore,
        downloadUrl: `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`,
        verificationUrl: qrVerificationUrl,
        
        transactionHash: certificate.transactionHash,
        blockchainTxUrl: certificate.blockchainTxUrl,
      },
      message: 'Certificate generated and uploaded successfully',
    });

  } catch (err: any) {
    console.error('Certificate generation error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate certificate',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    const certificateHash = searchParams.get('hash');
    const certificateNumber = searchParams.get('number');

    let certificate;

    if (providerId) {
      certificate = await Certificate.findOne({ providerId })
        .populate('application', 'fullName city verificationScore')
        .exec();
    } else if (certificateHash) {
      certificate = await Certificate.findOne({ certificateHash })
        .populate('application', 'fullName city verificationScore')
        .exec();
    } else if (certificateNumber) {
      certificate = await Certificate.findOne({ certificateNumber })
        .populate('application', 'fullName city verificationScore')
        .exec();
    } else {
      return NextResponse.json({
        success: false,
        message: 'Please provide providerId, hash, or certificate number',
      }, { status: 400 });
    }

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificate not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate._id,
        certificateNumber: certificate.certificateNumber,
        certificateHash: certificate.certificateHash,
        ipfsHash: certificate.ipfsHash,
        qrCodeData: certificate.qrCodeData,
        fullName: certificate.fullName,
        serviceType: certificate.serviceType,
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate,
        city: certificate.city,
        verificationScore: certificate.verificationScore,
        isActive: certificate.isActive,
        downloadUrl: `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`,
        verificationUrl: certificate.qrCodeData,
        createdAt: certificate.createdAt,
        updatedAt: certificate.updatedAt,
      },
    });

  } catch (err: any) {
    console.error('Certificate retrieval error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve certificate',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    }, { status: 500 });
  }
}