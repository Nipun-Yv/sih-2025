import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Certificate from '@/models/Certificate';

export async function GET(
  _req: Request,
  { params }: { params: { hash: string } }
) {
  try {
    await dbConnect();
    const { hash } = params;

    const certificate = await Certificate.findOne({
      certificateHash: hash,
      isActive: true,
    });

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificate not found or invalid',
      }, { status: 404 });
    }

    const isExpired = new Date() > new Date(certificate.expiryDate);

    return NextResponse.json({
      success: true,
      certificate: {
        ...certificate.toObject(),
        isValid: !isExpired,
        isExpired,
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to verify certificate',
      error: err.message,
    }, { status: 500 });
  }
}
