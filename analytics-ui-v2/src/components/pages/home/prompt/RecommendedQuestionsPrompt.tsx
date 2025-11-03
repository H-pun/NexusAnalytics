"use client";

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import EllipsisWrapper from '@/components/EllipsisWrapper';
import { Button } from '@/components/ui/button';
import { Minus, Rows3, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

type GroupedQuestion = { category: string; sql: string; question: string };

const MAX_EXPANDED_QUESTIONS = 9;

interface Props {
  onSelect: (payload: { sql: string; question: string }) => void;
  recommendedQuestions: GroupedQuestion[];
  loading: boolean;
}

export default function RecommendedQuestionsPrompt(props: Props) {
  const { onSelect, recommendedQuestions, loading } = props;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');

  const questionList = useMemo(() => {
    return recommendedQuestions.slice(0, isExpanded ? undefined : MAX_EXPANDED_QUESTIONS);
  }, [recommendedQuestions, isExpanded]);

  const showExpandButton = recommendedQuestions.length > MAX_EXPANDED_QUESTIONS;

  const onSelectQuestion = (payload: { sql: string; question: string }) => {
    onSelect(payload);
    setSelectedQuestion(payload.question);
  };

  return (
    <div className="bg-muted/40 px-10 py-6">
      <div className="flex items-center mb-3 rounded-lg">
        <Logo size={24} />
        <div className="text-base text-foreground mx-3">Discover insights from your data.</div>
        <div className="text-foreground/70">Explore these suggested queries</div>
      </div>
      <div className="space-y-4" style={{ width: 680 }}>
        <div className="bg-card border rounded-xl p-4">
          <div className="grid grid-cols-12 gap-4 mt-1">
            {questionList.map((q, idx) => {
              const isSelected = selectedQuestion === q.question;
              const isDisabled = loading && !isSelected;
              return (
                <div key={idx} className="col-span-12 sm:col-span-6 md:col-span-4">
                  <div
                    className={clsx(
                      'bg-card select-none h-[150px] border rounded px-3 pt-3 pb-4',
                      isDisabled ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer',
                      isSelected && 'border-orange-500',
                      !isSelected && 'hover:border-orange-500 transition-colors'
                    )}
                    onClick={() => !isDisabled && onSelectQuestion({ sql: q.sql, question: q.question })}
                  >
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="border px-2 rounded-full truncate" title={q.category}>
                        {q.category}
                      </div>
                      {isSelected && loading && <Loader2 className="ml-1 text-muted-foreground animate-spin" />}
                    </div>
                    <EllipsisWrapper multipleLine={4} text={q.question} />
                  </div>
                </div>
              );
            })}
          </div>
          {showExpandButton && (
            <div className="text-right mt-3">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded((p) => !p)}>
                {isExpanded ? (
                  <><Minus className="mr-2 h-4 w-4" /> Show less</>
                ) : (
                  <><Rows3 className="mr-2 h-4 w-4" /> Show more</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}











