import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Link from '@/lib/models/link';

export async function GET() {
  await dbConnect();
  try {
    const links = await Link.find({});
    console.log(links);
    return NextResponse.json({ success: true, data: links }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const { name, link } = await req.json();
    const newLink = await Link.create({ name, link });
    return NextResponse.json({ success: true, data: newLink }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}