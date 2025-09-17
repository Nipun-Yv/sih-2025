import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import Creator from '@/models/Creator';
import Contract from '@/models/Contract';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const creator = await Creator.findOne({ clerkUserId: user.id });
    if (!creator || !creator.tier) {
      return NextResponse.json({ error: 'No tier assigned' }, { status: 400 });
    }

    // Check if contract exists
    let contract = await Contract.findOne({ creatorId: user.id });
    
    if (!contract) {
      // Generate contract based on tier
      const tierTerms = {
        bronze: {
          tripDuration: 3,
          compensation: 0,
          contentRequirements: [
            'Minimum 1 YouTube video (10+ minutes)',
            '5 Instagram posts with stories',
            'Honest review of experiences',
          ],
        },
        silver: {
          tripDuration: 5,
          compensation: 0,
          contentRequirements: [
            'Minimum 2 YouTube videos (10+ minutes each)',
            '10 Instagram posts with stories',
            'Twitter thread about the journey',
            'Honest review of experiences',
          ],
        },
        gold: {
          tripDuration: 7,
          compensation: 25000,
          contentRequirements: [
            'Minimum 3 YouTube videos (10+ minutes each)',
            '15 Instagram posts with stories',
            'Twitter thread about the journey',
            'Blog post (if applicable)',
            'Honest review of experiences',
          ],
        },
        platinum: {
          tripDuration: 10,
          compensation: 50000,
          contentRequirements: [
            'Minimum 4 YouTube videos (10+ minutes each)',
            '20 Instagram posts with stories',
            'Daily Twitter updates during trip',
            'Blog post series (if applicable)',
            'Honest review of experiences',
            'Collaboration in tourism campaign',
          ],
        },
      };

      const terms = tierTerms[creator.tier as keyof typeof tierTerms];
      
      contract = await Contract.create({
        creatorId: user.id,
        tier: creator.tier,
        terms,
        status: 'pending',
        documentUrl: `/contracts/${user.id}-${Date.now()}.pdf`,
      });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Contract generation error:', error);
    return NextResponse.json({ error: 'Failed to generate contract' }, { status: 500 });
  }
}