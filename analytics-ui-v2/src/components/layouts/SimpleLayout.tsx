"use client";

import { ReactNode } from 'react';

export default function SimpleLayout({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ?? 'p-4'}>{children}</div>;
}











