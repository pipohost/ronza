
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Edit, Briefcase } from "lucide-react";

type AdminData = {
    users: any[];
    rooms: any[];
    resellers: any[];
    reservedNames: any[];
} | null;

interface StatsCardsProps {
    data: AdminData;
    isLoading: boolean;
}

export default function StatsCards({ data, isLoading }: StatsCardsProps) {
    const totalUsers = data?.users.length ?? 0;
    const totalRooms = data?.rooms.length ?? 0;
    const totalResellers = data?.resellers.length ?? 0;
    const totalReservedNames = data?.reservedNames.length ?? 0;

    const stats = [
        { title: "Total Users Online", value: totalUsers, icon: <Users className="h-4 w-4 text-muted-foreground" /> },
        { title: "Active Rooms", value: totalRooms, icon: <Home className="h-4 w-4 text-muted-foreground" /> },
        { title: "Reserved Names", value: totalReservedNames, icon: <Edit className="h-4 w-4 text-muted-foreground" /> },
        { title: "Resellers", value: totalResellers, icon: <Briefcase className="h-4 w-4 text-muted-foreground" /> },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        {stat.icon}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="text-2xl font-bold">...</div>
                        ) : (
                             <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                        )}
                    </CardContent>
                </Card>
            ))}
      </div>
    );
}
