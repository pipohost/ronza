'use client';

import ReservedNames from './reserved-names';
import WordFilter from './word-filter';
import Announcements from './announcements';
import type { WithId, Room } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';

interface OwnerModerationProps {
    room: WithId<Room>;
}

export default function OwnerModeration({ room }: OwnerModerationProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6 mt-4">
      <Announcements roomId={room.id} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ReservedNames 
            roomId={room.id} 
            initialReservedNames={room.reservedNames || []} 
            texts={t.ownerPanel.reservedNames}
        />
        <WordFilter 
            roomId={room.id} 
            initialWordFilter={room.wordFilter || []} 
            texts={t.ownerPanel.wordFilter}
        />
      </div>
    </div>
  );
}
