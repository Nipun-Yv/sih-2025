import { NextResponse } from 'next/server';
import { TourismRegistryContract } from '@/utils/contract-utils';


export async function GET() {
  try {
    const contract = new TourismRegistryContract();
    const statistics = await contract.getStatistics();

    if (!statistics) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch statistics',
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, statistics });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch statistics',
      error: err.message,
    }, { status: 500 });
  }
}
