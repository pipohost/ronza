
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, ShieldBan, Activity } from "lucide-react";
import type { Room, WithId } from "@/lib/types";

interface OwnerDashboardProps {
    room: WithId<Room>;
}

export default function OwnerDashboard({ room }: OwnerDashboardProps) {
    const roomStats = [
        { title: "Users Online", value: room.userCount, icon: <Users className="h-4 w-4 text-muted-foreground" /> },
        { title: "Today's Messages", value: "N/A", icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
        { title: "Banned Users", value: room.bannedUsers?.length || 0, icon: <ShieldBan className="h-4 w-4 text-muted-foreground" /> },
        { title: "Total Members", value: room.registeredMembers?.length || 0, icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            {roomStats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        {stat.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
      </div>
    );
}
