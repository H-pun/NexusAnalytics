"use client";
import useAskProcessState from '@/hooks/useAskProcessState';
import PreparationSteps from './Steps';

export default function Preparation() {
  const { currentState } = useAskProcessState();
  return (
    <div className="rounded border p-3 space-y-2">
      <div className="text-sm text-muted-foreground">Preparation</div>
      <PreparationSteps state={currentState} />
    </div>
  );
}



