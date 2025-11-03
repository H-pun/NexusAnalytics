"use client";

import { useState } from 'react';
import { Collapse } from 'antd';
import { ChevronRight } from 'lucide-react';

interface Props {
  message: string;
  className?: string;
  defaultActive?: boolean;
}

export default function ErrorCollapse(props: Props) {
  const { message, className, defaultActive } = props;
  const [activeKey, setActiveKey] = useState<string[]>(defaultActive ? ['1'] : []);

  return (
    <Collapse
      className={className}
      ghost
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key as string[])}
      expandIcon={({ isActive }) => <ChevronRight className={isActive ? 'rotate-90 transition-transform' : ''} size={16} />}
    >
      <Collapse.Panel key="1" header="Show error messages">
        <pre className="text-sm mb-0 pl-5 whitespace-pre-wrap text-muted-foreground">{message}</pre>
      </Collapse.Panel>
    </Collapse>
  );
}











