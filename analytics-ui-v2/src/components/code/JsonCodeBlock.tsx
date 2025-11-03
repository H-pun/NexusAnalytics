"use client";

import BaseCodeBlock from './BaseCodeBlock';

interface Props {
  data: unknown;
  className?: string;
}

export default function JsonCodeBlock({ data, className }: Props) {
  const code = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return <BaseCodeBlock code={code} language="json" className={className} />;
}











