"use client";

import { cn } from '@/utils';

export interface TreeNode {
  id: string | number;
  title: string;
  children?: TreeNode[];
}

export default function SidebarTree({ data = [], activeId, onSelect }: { data?: TreeNode[]; activeId?: string | number; onSelect?: (id: string | number) => void }) {
  const render = (nodes: TreeNode[], depth = 0) => (
    <div className={cn(depth > 0 && 'pl-3')}>
      {nodes.map((n) => (
        <div key={n.id}>
          <div
            className={cn('px-3 py-1.5 rounded cursor-pointer hover:bg-muted', activeId === n.id && 'bg-muted')}
            onClick={() => onSelect?.(n.id)}
          >
            {n.title}
          </div>
          {n.children?.length ? render(n.children, depth + 1) : null}
        </div>
      ))}
    </div>
  );
  return <div className="text-sm">{render(data)}</div>;
}











