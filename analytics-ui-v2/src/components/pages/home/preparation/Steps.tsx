"use client";

import { Steps } from 'antd';
import { PROCESS_STATE } from '@/utils/enum';

export default function PreparationSteps({ state }: { state: PROCESS_STATE }) {
  const items = [
    { title: 'Understanding' },
    { title: 'Searching' },
    { title: 'Planning' },
    { title: 'Generating' },
    { title: 'Finished' },
  ];
  const current = {
    [PROCESS_STATE.UNDERSTANDING]: 0,
    [PROCESS_STATE.SEARCHING]: 1,
    [PROCESS_STATE.PLANNING]: 2,
    [PROCESS_STATE.GENERATING]: 3,
    [PROCESS_STATE.FINISHED]: 4,
    [PROCESS_STATE.FAILED]: 4,
    [PROCESS_STATE.INIT]: 0,
  }[state] as number;
  return <Steps size="small" current={current} items={items} />;
}










