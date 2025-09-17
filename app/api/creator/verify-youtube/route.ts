import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import Creator from '@/models/Creator';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // For prototype, we'll use mock data
    // In production, this would handle OAuth callback
    const mockChannelData = {
      name: `${user.firstName || 'Creator'}'s Channel`,
      subscriberCount: Math.floor(Math.random() * 100000) + 10000,
      videoCount: Math.floor(Math.random() * 500) + 50,
      thumbnailUrl: user.imageUrl || '',
    };

    const creator = await Creator.findOneAndUpdate(
      { clerkUserId: user.id },
      {
        youtubeChannelId: `UC${Math.random().toString(36).substring(2, 15)}`,
        channelData: mockChannelData,
        verificationDate: new Date(),
        status: 'verified',
      },
      { new: true }
    );

    return NextResponse.json({ creator });
  } catch (error) {
    console.error('YouTube verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}