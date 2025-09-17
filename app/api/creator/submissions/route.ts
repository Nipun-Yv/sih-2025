import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import Creator from '@/models/Creator';
import Contract from '@/models/Contract';
import ContentSubmission from '@/models/ContentSubmission';

// GET submissions
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const submissions = await ContentSubmission.find({ 
      creatorId: user.id 
    }).sort({ submittedAt: -1 });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST new submission
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await dbConnect();

    // Get contract
    const contract = await Contract.findOne({ 
      creatorId: user.id,
      status: 'signed' 
    });

    if (!contract) {
      return NextResponse.json({ error: 'No signed contract found' }, { status: 400 });
    }

    // Create submission
    const submission = await ContentSubmission.create({
      creatorId: user.id,
      contractId: contract._id.toString(),
      ...data,
      submittedAt: new Date(),
    });

    // Check if all requirements are met
    const totalSubmissions = await ContentSubmission.countDocuments({
      creatorId: user.id,
      reviewStatus: { $ne: 'needs_revision' }
    });

    const requiredCount = contract.terms.contentRequirements.length;
    const allRequirementsMet = totalSubmissions >= requiredCount;

    return NextResponse.json({ 
      submission,
      allRequirementsMet 
    });
  } catch (error) {
    console.error('Failed to create submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}