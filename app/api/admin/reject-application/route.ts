import { NextResponse } from 'next/server';
import Application from '@/models/Application';
import dbConnect from '@/lib/mongoose';
import { TourismRegistryContract } from '@/utils/contract-utils';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { applicationId, reason } = await req.json();

    if (!applicationId || !reason) {
      return NextResponse.json({
        success: false,
        message: 'Application ID and rejection reason are required',
      }, { status: 400 });
    }

    const contract = new TourismRegistryContract();
    const result = await contract.rejectApplication(applicationId, reason);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to reject application',
      }, { status: 500 });
    }

    await Application.updateOne(
      { applicationId },
      { 
        $set: { 
          status: 'rejected',
          rejectedAt: new Date(),
          rejectionReason: reason,
        }
      }
    );

    return NextResponse.json({ success: true, message: 'Application rejected successfully' });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to reject application',
      error: err.message,
    }, { status: 500 });
  }
}
