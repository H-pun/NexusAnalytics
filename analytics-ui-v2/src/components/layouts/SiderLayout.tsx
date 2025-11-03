"use client";

import { ReactNode } from 'react';

interface Props {
  sider: ReactNode;
  children: ReactNode;
  className?: string;
  siderWidth?: number;
}

export default function SiderLayout(props: Props) {
  const { sider, children, className, siderWidth = 260 } = props;
  return (
    <div className={className}>
      <div className="flex">
        <aside className="border-r bg-card" style={{ width: siderWidth }}>{sider}</aside>
        <main className="flex-1 min-h-[calc(100vh-48px)] p-4">{children}</main>
      </div>
    </div>
  );
}











