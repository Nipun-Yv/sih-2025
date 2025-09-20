import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { TourismRegistryContract } from '@/utils/contract-utils';
import Application from '@/models/Application'; 
import User from '@/models/User';
export async function GET() {
  try {
    await dbConnect();
    const contract = new TourismRegistryContract();
    
    const pendingApplicationIds = await contract.getPendingApplications();
    console.log("Pending applications in the frontend is", pendingApplicationIds);
    

    const applications = await Promise.all(
      pendingApplicationIds.map(async (applicationId: number) => {
        const app = await Application.findOne({ applicationId }).populate('user');
        console.log("Applications in the frontend is", app);
        if (!app) return null;
        
        const transformedApp = {
          id: app._id,
          applicationId: app.applicationId,
          fullName: app.user.fullName || `${app.user.firstName} ${app.user.lastName}`,
          email: app.user.email,
          phone: app.user.phone || 'N/A',
          city: app.user.city || 'N/A', 
          vendorType: app.vendorType,
          submittedAt: app.submittedAt,
          status: app.status,
          razorpayPaymentId: app.razorpayPaymentId,
          documentsHash: app.documentsHash,
          applicationDataHash: app.applicationDataHash,
          panHash: app.panHash,
        };
        
        return transformedApp;
      })
    );
    const validApplications = applications.filter(Boolean);
    
    return NextResponse.json({
      success: true,
      applications: validApplications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
