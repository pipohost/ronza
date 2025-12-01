import { NextResponse } from 'next/server';
import { leaveRoom } from '@/app/actions/user-leave';

export async function POST(request: Request) {
  try {
    // navigator.sendBeacon sends data as text/plain, so we need to parse it manually
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    const { roomId, userId } = body;

    if (!roomId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing roomId or userId' }, { status: 400 });
    }

    // We can't await this because sendBeacon doesn't wait for a response.
    // The action itself is fire-and-forget.
    leaveRoom(roomId, userId);

    // Immediately respond to the beacon request.
    // Note: The client will not see this response as the page is unloading.
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    // This will likely not be seen by the client, but is good for server-side logging.
    console.error('Beacon logout error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
