"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HeaderBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <div className="h-12 border-b bg-gray-900 text-gray-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="w-[125px] h-[30px] overflow-hidden">
          <Image
            src="/images/brand-horizontal-logo-orange.png?v=9"
            alt="NQRust - Analytics"
            width={180}
            height={45}
            priority
            className="w-[180px] h-[45px] object-contain block"
          />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button variant={isActive('/home') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/home')}>Home</Button>
          <Button variant={isActive('/modeling') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/modeling')}>Data Modeling</Button>
          <Button variant={isActive('/knowledge') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/knowledge/question-sql-pairs')}>Knowledge</Button>
          <Button variant={isActive('/api-management') ? 'secondary' : 'ghost'} size="sm" onClick={() => router.push('/api-management/history')}>API Management</Button>
        </div>
      </div>
    </div>
  );
}


