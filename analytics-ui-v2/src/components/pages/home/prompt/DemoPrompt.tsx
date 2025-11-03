"use client";

import EllipsisWrapper from '@/components/EllipsisWrapper';

interface Props {
  demo: { label: string; question: string }[];
  onSelect: (data: { label: string; question: string }) => void;
}

export default function DemoPrompt({ demo, onSelect }: Props) {
  return (
    <div className="text-foreground" style={{ width: 580 }}>
      <div className="text-center mt-3 mb-2">Try asking...</div>
      <div className="grid grid-cols-12 gap-4">
        {demo.map((d, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 md:col-span-4">
            <div
              className="select-none h-[150px] border border-gray-300 rounded px-3 pt-3 pb-4 cursor-pointer hover:border-orange-500 transition-colors"
              onClick={() => onSelect({ label: d.label, question: d.question })}
            >
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="border border-gray-300 px-2 rounded-full truncate">
                  {d.label}
                </div>
              </div>
              <EllipsisWrapper multipleLine={4} text={d.question} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}











