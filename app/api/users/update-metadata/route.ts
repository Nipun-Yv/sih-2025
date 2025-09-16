import { createClerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, metadata } = body;
    
    if (!userId || !metadata) {
      return NextResponse.json(
        { error: 'userId and metadata are required' },
        { status: 400 }
      );
    }

    console.log("Userid:", userId, "metadata:", metadata);
    
    await clerkClient.users.updateUser(userId, {
      publicMetadata: metadata
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.error('Error updating user metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update user metadata' },
      { status: 500 }
    );
  }
}