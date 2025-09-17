import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import Contract from '@/models/Contract';
import Creator from '@/models/Creator';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const contract = await Contract.findOneAndUpdate(
      { creatorId: user.id, status: 'pending' },
      { 
        status: 'signed',
        signedAt: new Date(),
      },
      { new: true }
    );

    if (!contract) {
      return NextResponse.json({ error: 'No pending contract found' }, { status: 404 });
    }

    // Update creator status
    await Creator.findOneAndUpdate(
      { clerkUserId: user.id },
      { status: 'contract_signed' }
    );

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Contract signing error:', error);
    return NextResponse.json({ error: 'Failed to sign contract' }, { status: 500 });
  }
}