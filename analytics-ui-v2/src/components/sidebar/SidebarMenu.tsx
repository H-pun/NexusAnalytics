"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SidebarMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (p: string) => pathname?.startsWith(p);
  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      <Button variant={isActive('/home') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/home')}>Home</Button>
      <Button variant={isActive('/modeling') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/modeling')}>Modeling</Button>
      <Button variant={isActive('/knowledge') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/knowledge/question-sql-pairs')}>Knowledge</Button>
      <Button variant={isActive('/api-management') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/api-management/history')}>API Management</Button>
    </div>
  );
}











