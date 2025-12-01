
'use server';

import { getRooms, getResellers, getColoredNames, getUsers, getPosts, getVisitorLogs } from '@/lib/server-data';
import AdminPageClient from "@/components/admin/admin-page-client";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

async function verifyAdminSession() {
    const sessionCookie = cookies().get('__session')?.value;
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

export default async function AdminPage() {
    const isSessionValid = await verifyAdminSession();

    if (!isSessionValid) {
        redirect('/admin/login');
    }
    
    // Fetch all initial data in parallel
    const [
        rooms,
        resellers,
        coloredNames,
        users,
        posts,
        visitorLogs,
    ] = await Promise.all([
        getRooms(),
        getResellers(),
        getColoredNames(),
        getUsers(),
        getPosts(),
        getVisitorLogs(),
    ]);

    return (
        <AdminPageClient
            initialRooms={rooms}
            initialResellers={resellers}
            initialColoredNames={coloredNames}
            initialUsers={users}
            initialPosts={posts}
            initialVisitorLogs={visitorLogs}
        />
    );
}
