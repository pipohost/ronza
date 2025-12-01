
import { NextResponse } from 'next/server';
import { leaveRoom } from '@/app/actions/user-leave';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    const { roomId, userId } = body;

    if (!roomId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing roomId or userId' }, { status: 400 });
    }

    leaveRoom(roomId, userId);

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Beacon leave error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
