import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const userData = await request.json();
    const { clerkId, email, firstName, lastName, role, registrationStatus, isVerified } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        user: existingUser,
        message: 'User already exists' 
      });
    }

    // Create new user in MongoDB
    const newUser = await User.create({
      clerkId,
      email,
      firstName,
      lastName,
      role: role || 'TOURIST',
      registrationStatus: registrationStatus || 'incomplete',
      isVerified: isVerified || false,
    });

    return NextResponse.json({ 
      success: true, 
      user: newUser,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email or Clerk ID already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user in database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}