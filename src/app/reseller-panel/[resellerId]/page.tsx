'use server';

import { notFound, redirect } from 'next/navigation';
import { getResellerById, getRoomsByOwner, getColoredNamesByOwner, getVisitorLogs, getBannedUsersByOwner } from '@/lib/server-data';
import ResellerPanelClient from './reseller-panel-client';
import { Metadata } from "next";
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { signOutReseller } from '@/app/actions/reseller-panel';

export async function generateMetadata({ params }: { params: { resellerId: string } }): Promise<Metadata> {
  const reseller = await getResellerById(params.resellerId);
  const resellerName = reseller?.name || 'Unknown Reseller';
  
  return {
    title: `Reseller Panel: ${resellerName}`,
    description: `Manage rooms and users for reseller ${resellerName}.`,
    robots: {
      index: false,
      follow: false,
    }
  };
}

async function verifyResellerSession(resellerId: string) {
    const sessionCookie = cookies().get(`__session_reseller_${resellerId}`)?.value;
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


export default async function ResellerPanelPage({ params }: { params: { resellerId: string } }) {

  const isSessionValid = await verifyResellerSession(params.resellerId);

  if (!isSessionValid) {
       return redirect("/reseller-panel/login");
  }
  
  const reseller = await getResellerById(params.resellerId);

  if (!reseller) {
    notFound();
  }

  const [initialRooms, initialColoredNames, initialVisitorLogs, initialBannedUsers] = await Promise.all([
    getRoomsByOwner(reseller.id),
    getColoredNamesByOwner(reseller.id),
    getVisitorLogs(reseller.id),
    getBannedUsersByOwner(reseller.id)
  ]);

  return (
    <ResellerPanelClient 
        reseller={reseller}
        initialRooms={initialRooms}
        initialColoredNames={initialColoredNames}
        initialVisitorLogs={initialVisitorLogs}
        initialBannedUsers={initialBannedUsers}
        signOutAction={async () => {
            'use server';
            await signOutReseller(params.resellerId);
        }}
    />
  );
}
