"use client";

import { MouseEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { PlusSquare, MoreHorizontal } from 'lucide-react';

interface Props {
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  className?: string;
  marginLeft?: number;
  marginRight?: number;
}

const makeActionButton = (name: string, icon: ReactNode) => {
  const Comp = (props: Props) => {
    const { onClick, onMouseEnter, onMouseLeave, className, marginLeft, marginRight, ...restProps } = props;

    const handle = (fn?: (e: MouseEvent) => void) => (e: MouseEvent) => {
      fn?.(e);
      e.stopPropagation();
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        className={className}
        style={{ marginLeft, marginRight }}
        onClick={handle(onClick)}
        onMouseEnter={handle(onMouseEnter)}
        onMouseLeave={handle(onMouseLeave)}
        {...restProps}
      >
        {icon}
      </Button>
    );
  };
  Comp.displayName = name;
  return Comp;
};

export const AddButton = makeActionButton('AddButton', <PlusSquare size={16} />);
export const MoreButton = makeActionButton('MoreButton', <MoreHorizontal size={16} />);


