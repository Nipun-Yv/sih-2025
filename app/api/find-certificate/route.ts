// app/api/find-certificate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Certificate from '@/models/Certificate'; // Your certificate model
import Application from '@/models/Application'; // Your application model
import User from '@/models/User'; // Your user model

// Database connection
const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed');
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { userId } = await request.json(); // This is clerkId

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID (clerkId) is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Step 1: Find the User by clerkId
    const user = await User.findOne({ clerkId: userId }); // assuming userId field contains clerkId

    if (!user) {
      return NextResponse.json(
        { 
          message: 'User not found',
          certificate: null 
        },
        { status: 200 }
      );
    }
    console.log("Recevied till line 48",user);
    // Step 2: Find the latest approved application for this user's _id
    const latestApprovedApplication = await Application.findOne({
      user: user._id, // Reference to User's ObjectId
      status: 'approved' // Only approved applications should have certificates
    })
    .sort({ processedDate: -1 }) // Sort by most recently processed
    .exec();

    if (!latestApprovedApplication) {
      return NextResponse.json(
        { 
          message: 'No approved application found for this user',
          certificate: null 
        },
        { status: 200 }
      );
    }

    // Step 3: Find the certificate for this approved application
    const certificate = await Certificate.findOne({
      application: latestApprovedApplication._id, // Reference to the approved application
      isActive: true,
      expiryDate: { $gt: new Date() } // Not expired
    })
    .sort({ issuedDate: -1 }) // Get the latest certificate if multiple exist
    .exec();

    if (!certificate) {
      return NextResponse.json(
        { 
          message: 'No valid certificate found for the approved application',
          certificate: null 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Certificate found successfully',
        certificate: certificate,
        application: {
          _id: latestApprovedApplication._id,
          applicationStatus: latestApprovedApplication.applicationStatus,
          processedDate: latestApprovedApplication.processedDate
        },
        user: {
          _id: user._id,
          userId: user.userId // clerkId
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching certificate:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: GET method to fetch by query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Step 1: Find the latest approved application for the user
    const latestApprovedApplication = await Application.findOne({
      userId: userId, // Clerk user ID is in Application model
      applicationStatus: 'approved' // Only approved applications should have certificates
    })
    .sort({ processedDate: -1 }) // Sort by most recently processed
    .exec();

    if (!latestApprovedApplication) {
      return NextResponse.json(
        { 
          message: 'No approved application found for this user',
          certificate: null 
        },
        { status: 200 }
      );
    }

    // Step 2: Find the certificate for this approved application
    const certificate = await Certificate.findOne({
      application: latestApprovedApplication._id, // Reference to the approved application
      isActive: true,
      expiryDate: { $gt: new Date() } // Not expired
    })
    .sort({ issuedDate: -1 }) // Get the latest certificate if multiple exist
    .exec();

    if (!certificate) {
      return NextResponse.json(
        { 
          message: 'No valid certificate found for the approved application',
          certificate: null 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Certificate found successfully',
        certificate: certificate,
        application: {
          _id: latestApprovedApplication._id,
          applicationStatus: latestApprovedApplication.applicationStatus,
          processedDate: latestApprovedApplication.processedDate
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching certificate:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: Get all certificates for a user (not just the latest)
export async function PUT(request: NextRequest) {
  try {
    const { userId, includeExpired = false, includeInactive = false } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Build match conditions
    const matchConditions: any = {
      'applicationData.userId': userId
    };

    if (!includeExpired) {
      matchConditions.expiryDate = { $gt: new Date() };
    }

    if (!includeInactive) {
      matchConditions.isActive = true;
    }

    const certificates = await Certificate.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: 'application',
          foreignField: '_id',
          as: 'applicationData'
        }
      },
      {
        $unwind: '$applicationData'
      },
      {
        $match: matchConditions
      },
      {
        $sort: { issuedDate: -1 }
      },
      {
        $project: {
          providerId: 1,
          certificateHash: 1,
          ipfsHash: 1,
          qrCodeData: 1,
          fullName: 1,
          serviceType: 1,
          issuedDate: 1,
          expiryDate: 1,
          city: 1,
          verificationScore: 1,
          isActive: 1,
          certificateNumber: 1,
          transactionHash: 1,
          blockchainTxUrl: 1,
          blockchainVerifyUrl: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    return NextResponse.json(
      { 
        message: `Found ${certificates.length} certificates`,
        certificates: certificates,
        count: certificates.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching certificates:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}