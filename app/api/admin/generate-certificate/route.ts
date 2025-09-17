import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import Certificate from '@/models/Certificate'; 
import { TourismRegistryContract, ServiceType } from '@/utils/contract-utils';

function getServiceTypeName(serviceType: number): string {
  switch (serviceType) {
    case ServiceType.GUIDE: return 'Tourist Guide';
    case ServiceType.ACCOMMODATION: return 'Accommodation Provider';
    case ServiceType.FOOD_RESTAURANT: return 'Food & Restaurant';
    case ServiceType.TRANSPORTATION: return 'Transportation';
    case ServiceType.ACTIVITY: return 'Activity Provider';
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

    const contract = new TourismRegistryContract();
    const result = await contract.generateCertificate(providerId);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to generate certificate',
      }, { status: 500 });
    }

    const providerDetails = await contract.getProviderDetails(providerId);
    const application = await Application.findOne({ providerId });

    if (!providerDetails || !application) {
      return NextResponse.json({
        success: false,
        message: 'Provider details not found',
      }, { status: 404 });
    }

    const certificate = await Certificate.create({
      providerId,
      certificateHash: result.certificateHash,
      qrCodeData: `${process.env.NEXT_PUBLIC_VERIFY_URL}/verify/${result.certificateHash}`,
      fullName: application.fullName,
      serviceType: getServiceTypeName(providerDetails.provider.serviceType),
      issuedDate: new Date(),
      expiryDate: new Date(providerDetails.provider.expiryDate * 1000),
      city: application.city,
      verificationScore: application.verificationScore || 80,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      certificate,
      message: 'Certificate generated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to generate certificate',
      error: err.message,
    }, { status: 500 });
  }
}
