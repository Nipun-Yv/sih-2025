// app/api/creator/init/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import Creator from '@/models/Creator';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    let creator = await Creator.findOne({ clerkUserId: user.id });
    
    if (!creator) {
      creator = await Creator.create({
        clerkUserId: user.id,
        status: 'unverified',
      });
    }
    
    return NextResponse.json({ creator });
  } catch (error) {
    console.error('Creator init error:', error);
    
    // If it's a duplicate key error, try to find the existing creator
    if ((error as any).code === 11000) {
      try {
        const creator = await Creator.findOne({ clerkUserId: (await currentUser())?.id });
        if (creator) {
          return NextResponse.json({ creator });
        }
      } catch (findError) {
        console.error('Failed to find existing creator:', findError);
      }
    }
    
    return NextResponse.json({ error: 'Failed to initialize creator' }, { status: 500 });
  }
}