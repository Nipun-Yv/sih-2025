import { NextResponse } from 'next/server';
import Application from '@/models/Application';
import dbConnect from '@/lib/mongoose';
import { TourismRegistryContract } from '@/utils/contract-utils';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { applicationId, verifierNotes, verificationScore } = await req.json();

    if (!applicationId || verificationScore < 0 || verificationScore > 100) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input parameters',
      }, { status: 400 });
    }

    const contract = new TourismRegistryContract();
    const result = await contract.approveApplication(applicationId, verifierNotes || '', verificationScore);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to approve application',
      }, { status: 500 });
    }
    try {
      const responseFromCreateApp = await Application.findOneAndUpdate(
        { applicationId },
        {
          $set: {
            status: 'approved',
            providerId: result.providerId,
            approvedAt: new Date(),
            verifierNotes,
            verificationScore,
          }
        }
      );
      
      console.log("Database update response:", responseFromCreateApp);
      console.log("Matched count:", responseFromCreateApp.matchedCount);
      console.log("Modified count:", responseFromCreateApp.modifiedCount);
      
      if (responseFromCreateApp.matchedCount === 0) {
        console.log("No application found with applicationId:", applicationId);
        return NextResponse.json({
          success: false,
          message: 'Application not found',
        }, { status: 404 });
      }
      
    } catch (dbError) {
      console.error("Database update error:", dbError);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      providerId: result.providerId,
      message: 'Application approved successfully',
    });
    
  } catch (err: any) {
    console.error("Full error details:", err);
    return NextResponse.json({
      success: false,
      message: 'Failed to approve application',
      error: err.message,
    }, { status: 500 });
  }
}
