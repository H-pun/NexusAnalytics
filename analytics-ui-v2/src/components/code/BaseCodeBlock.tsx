"use client";

import { cn } from '@/utils';

interface Props {
  code: string;
  language?: string;
  className?: string;
}

export default function BaseCodeBlock({ code, language = 'text', className }: Props) {
  return (
    <pre className={cn('rounded-md bg-muted p-3 overflow-auto text-sm', className)}>
      <code className={cn('whitespace-pre', language && `language-${language}`)}>{code}</code>
    </pre>
  );
}

