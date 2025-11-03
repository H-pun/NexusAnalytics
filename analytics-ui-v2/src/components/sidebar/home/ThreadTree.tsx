"use client";

import { useRouter } from 'next/navigation';
import { cn } from '@/utils';

interface ThreadItem {
  id: number;
  title: string;
}

export default function ThreadTree({ items = [], activeId }: { items?: ThreadItem[]; activeId?: number }) {
  const router = useRouter();
  return (
    <div className="text-sm">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'px-3 py-2 cursor-pointer rounded hover:bg-muted',
            activeId === t.id && 'bg-muted text-foreground'
          )}
          onClick={() => router.push(`/home/${t.id}`)}
        >
          {t.title}
        </div>
      ))}
    </div>
  );
}











