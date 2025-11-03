"use client";

 import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  text?: string;
  children?: ReactNode;
  multipleLine?: number;
  minHeight?: number;
  showMoreCount?: boolean;
}

export default function EllipsisWrapper(props: Props) {
  const { text, multipleLine, minHeight, children, showMoreCount } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | 'auto' | undefined>(undefined);
  const [stage, setStage] = useState<ReactNode[]>([]);
  const isStageEnd = useRef(false);

  const hasWidth = width !== undefined;

  const calculateStageShow = useCallback(() => {
    if (isStageEnd.current) return;
    const remainSpace = 60;
    const stageWidth = stageRef.current?.clientWidth ?? 0;
    const canPrintNext = typeof width === 'number' ? stageWidth < width - remainSpace : false;

    if (canPrintNext) {
      const childrenArr = (children as ReactNode[]) || [];
      const hasMoreChildren = childrenArr.length > stage.length;
      if (hasMoreChildren) setStage([...stage, childrenArr[stage.length]]);
    } else {
      setStage(stage.slice(0, Math.max(0, stage.length - 1)));
      isStageEnd.current = true;
    }
  }, [width, stage, children]);

  useEffect(() => {
    if (ref.current && !hasWidth) {
      const cellWidth = ref.current.clientWidth;
      setWidth(cellWidth === 0 ? 'auto' : cellWidth);
    }
    return () => {
      isStageEnd.current = false;
      // Avoid setting state in cleanup to prevent update loops
    };
  }, []);

  useEffect(() => {
    if (!showMoreCount) return;
    if (stage.length === 0) {
      const childrenArr = (children as ReactNode[]) || [];
      if (childrenArr.length > 0) setStage([childrenArr[0]]);
      return;
    }
    calculateStageShow();
  }, [showMoreCount, stage, calculateStageShow, children]);

  const renderContent = () => {
    if (!children) return text || '-';
    if (showMoreCount) {
      const childrenArr = (children as ReactNode[]) || [];
      const moreCount = childrenArr.length - stage.length;
      return (
        <span className="inline-block" ref={stageRef as any}>
          {stage}
          {moreCount > 0 && <span className="text-muted-foreground">...{moreCount} more</span>}
        </span>
      );
    }
    return children;
  };

  const title = Array.isArray(text) ? text.join('') : text;
  const multilineStyle = multipleLine
    ? { display: '-webkit-box', WebkitLineClamp: multipleLine, WebkitBoxOrient: 'vertical' as const }
    : { whiteSpace: 'nowrap' as const };

  return (
    <div
      ref={ref}
      title={title}
      className="overflow-hidden text-ellipsis"
      style={{ width, minHeight, ...multilineStyle }}
    >
      {hasWidth ? renderContent() : null}
    </div>
  );
}


