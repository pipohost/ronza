'use server';

import { notFound, redirect } from 'next/navigation';
import { Metadata } from "next"
import { getRoomById, getRoomMembers, getBannedUsers } from "@/lib/server-data"
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { signOutOwner } from '@/app/actions/owner-panel';
import type { WithId, RegisteredMember, BannedUser } from '@/lib/types';
import OwnerPanelClient from '@/components/owner-panel/owner-panel-client';


export async function generateMetadata({ params }: { params: { roomId:string } }): Promise<Metadata> {
  const room = await getRoomById(params.roomId);
  const roomName = room?.name || 'Unknown Room';
  
  return {
    title: `لوحة تحكم مالك الغرفة: ${roomName}`,
    description: `إدارة الإعدادات والأعضاء في غرفة ${roomName} على شات رونزا.`,
    robots: {
      index: false,
      follow: false,
    }
  };
}

async function verifyOwnerSession(roomId: string) {
    const sessionCookie = cookies().get(`__session_owner_${roomId}`)?.value;
    if (!sessionCookie) {
        return false;
    }
    try {
        await adminAuth.verifySessionCookie(sessionCookie, true);
        return true;
    } catch (error) {
        return false;
    }
}

export default async function OwnerPanelPage({ params }: { params: { roomId: string } }) {
    
    const isSessionValid = await verifyOwnerSession(params.roomId);
    if (!isSessionValid) {
        return redirect("/owner-panel/login");
    }

    const roomData = await getRoomById(params.roomId);

    if (!roomData) {
      notFound();
    }
    
    // Verify this is a real owner panel and not a reseller's room
    if (roomData.ownerId !== 'root' && !roomData.ownerPanelPassword) {
        notFound();
    }

    const members: WithId<RegisteredMember>[] = await getRoomMembers(params.roomId);
    const bannedUsers: WithId<BannedUser>[] = await getBannedUsers(params.roomId);
    const activityLog: string[] = roomData.activityLog || [];

    const signOutAction = async () => {
        'use server';
        await signOutOwner(params.roomId);
        redirect('/owner-panel/login');
    };
  
    return (
        <OwnerPanelClient 
            roomData={roomData}
            members={members}
            bannedUsers={bannedUsers}
            activityLog={activityLog}
            signOutAction={signOutAction}
        />
    )
}
