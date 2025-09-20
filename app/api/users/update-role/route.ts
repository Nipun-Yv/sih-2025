import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { UserRole, VendorType } from "@/types/User";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId: authUserId } = await auth();
    
    if (!authUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const { 
      clerkId,
      role,
      vendorType,
      isVerified,
      registrationStatus,
      updatedAt
    } = body;

    const user = await clerkClient.users.getUser(clerkId);
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
    
    console.log("Data in the update request is ", role, vendorType, isVerified);

    if (authUserId !== clerkId) {
      return NextResponse.json(
        { error: "Forbidden: Can only update your own role" },
        { status: 403 }
      );
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const updateData: any = {
      role,
      updatedAt: updatedAt || new Date().toISOString(),
    };

    if (role === UserRole.VENDOR) {
      updateData.vendorType = vendorType;
      updateData.isVerified = isVerified || false;
      updateData.registrationStatus = registrationStatus || 'incomplete';
    } else {
      updateData.isVerified = isVerified !== undefined ? isVerified : true;
      updateData.registrationStatus = registrationStatus || 'complete';
      updateData.vendorType = null;
    }

    let updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      if (!primaryEmail?.emailAddress) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 400 }
        );
      }

      const newUserData = {
        clerkId,
        email: primaryEmail.emailAddress, 
        firstName: user.firstName || '', 
        lastName: user.lastName || '', 
        ...updateData,
        createdAt: new Date().toISOString()
      };
      
      updatedUser = await User.create(newUserData);
    }

    console.log('Updated user in database:', {
      clerkId,
      updateData
    });

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: updatedUser
    });
    
  } catch (error) {
    console.error("Error updating user role:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    // Fixed: Use findOne with clerkId instead of where clause
    const user = await User.findOne({ clerkId: userId });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}