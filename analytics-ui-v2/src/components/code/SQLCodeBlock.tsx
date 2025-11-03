"use client";

import BaseCodeBlock from './BaseCodeBlock';

interface Props {
  sql: string;
  className?: string;
}

export default function SQLCodeBlock({ sql, className }: Props) {
  return <BaseCodeBlock code={sql} language="sql" className={className} />;
}











