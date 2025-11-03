"use client";

import { useState } from 'react';
import { Input } from 'antd';

export default function TreeTitleInput({ placeholder = 'Search', onChange }: { placeholder?: string; onChange?: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="px-3 pb-2">
      <Input
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
      />
    </div>
  );
}











