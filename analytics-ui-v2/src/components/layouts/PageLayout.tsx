"use client";

import { ReactNode } from 'react';

interface Props {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function PageLayout(props: Props) {
  const { header, footer, children, className } = props;
  return (
    <div className={className}>
      {header}
      <div className="min-h-[calc(100vh-48px)]">
        {children}
      </div>
      {footer}
    </div>
  );
}











