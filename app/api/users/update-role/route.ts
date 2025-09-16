import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { UserRole, VendorType } from "@/types/User";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

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

    // Security check: Ensure the authenticated user can only update their own role
    if (authUserId !== clerkId) {
      return NextResponse.json(
        { error: "Forbidden: Can only update your own role" }, 
        { status: 403 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" }, 
        { status: 400 }
      );
    }



    // Prepare update data
    const updateData: any = {
      role,
      updatedAt: updatedAt || new Date().toISOString(),
    };

    // Add vendor-specific fields if role is VENDOR
    if (role === UserRole.VENDOR) {
      updateData.vendorType = vendorType;
      updateData.isVerified = isVerified || false;
      updateData.registrationStatus = registrationStatus || 'pending';
    } else {
      // For non-vendor roles, set appropriate defaults
      updateData.isVerified = isVerified !== undefined ? isVerified : true;
      updateData.registrationStatus = registrationStatus || 'complete';
      updateData.vendorType = null; // Clear vendor type for non-vendors
    }

    const updatedUser=await User.findOneAndUpdate(
        {clerkId},{$set:updateData},{
            new:true,upsert:true
        }
    )

    // REPLACE THIS SECTION WITH YOUR ACTUAL DATABASE UPDATE LOGIC
    console.log('Updating user in database:', {
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
    // Fetch user from database
    const user = await User.findOne({ where: { clerkId: userId } });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}