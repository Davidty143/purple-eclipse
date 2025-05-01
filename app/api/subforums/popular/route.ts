import { NextResponse } from 'next/server';
import { getPopularSubforums } from '../../../../services/subforum-service';

export async function GET() {
  try {
    const subforumsWithThreads = await getPopularSubforums();
    return NextResponse.json(subforumsWithThreads);
  } catch (error) {
    console.error('Error processing popular subforums request:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
