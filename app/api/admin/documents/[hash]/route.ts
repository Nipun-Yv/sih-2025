import { NextResponse } from 'next/server';
import Document from '@/models/Document';
import dbConnect from '@/lib/mongoose';
export async function GET(
  _req: Request,
  { params }: { params: { hash: string } }
) {
  try {
    await dbConnect();
    const { hash } = params;

    const document = await Document.findOne({ documentsHash: hash });
    if (!document) {
      return NextResponse.json({
        success: false,
        message: 'Document not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch document',
      error: err.message,
    }, { status: 500 });
  }
}
