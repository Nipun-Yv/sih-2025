import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import Creator from '@/models/Creator';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Mock score calculation
    const score = Math.floor(Math.random() * 30) + 70; // 70-100 range
    
    const breakdown = {
      viewsScore: Math.min(score + Math.random() * 10, 100),
      engagementRate: Math.min(score - 5 + Math.random() * 10, 100),
      consistency: Math.min(score - 3 + Math.random() * 10, 100),
      audienceRetention: Math.min(score + 2 + Math.random() * 10, 100),
    };

    // Determine tier based on score
    let tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    if (score >= 95) tier = 'platinum';
    else if (score >= 85) tier = 'gold';
    else if (score >= 70) tier = 'silver';
    else tier = 'bronze';

    const creator = await Creator.findOneAndUpdate(
      { clerkUserId: user.id },
      {
        'analytics.engagementScore': score,
        'analytics.calculatedAt': new Date(),
        tier,
        status: 'tier_assigned',
      },
      { new: true }
    );

    return NextResponse.json({ 
      creator,
      score,
      breakdown,
      tier,
    });
  } catch (error) {
    console.error('Score calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate score' }, { status: 500 });
  }
}