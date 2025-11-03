"use client";

import { memo, ReactNode, useEffect, useRef, useState } from 'react';
import { Button as AntButton } from 'antd';
import { PROCESS_STATE } from '@/utils/enum';
import { attachLoading } from '@/utils/helper';
import { BrainSVG } from '@/utils/svgs';
import ErrorCollapse from '@/components/ErrorCollapse';
import RecommendedQuestions from '@/components/pages/home/RecommendedQuestions';
import MarkdownBlock from '@/components/editor/MarkdownBlock';
import { Button } from '@/components/ui/button';
import { X, StopCircle, AlertTriangle, Info } from 'lucide-react';
import { AskingTaskType } from '@/apollo/client/graphql/__types__';

interface Props {
  processState: PROCESS_STATE;
  data: {
    type: any;
    originalQuestion: string;
    askingStreamTask: string;
    recommendedQuestions: any;
    intentReasoning: string;
  };
  error?: any;
  onIntentSQLAnswer: () => void;
  onSelectRecommendedQuestion: ({ question, sql }: { question: string; sql: string }) => void;
  onClose: () => void;
  onStop: () => Promise<void>;
  loading?: boolean;
}

const Card = ({ children }: { children: ReactNode }) => (
  <div className="absolute bottom-[calc(100%+12px)] left-0 w-full bg-white border rounded p-4 shadow-md" data-testid="prompt__result">
    {children}
  </div>
);

const Understanding = (props: Props) => {
  const { onStop } = props;
  const [loading, setLoading] = useState(false);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-orange-600 flex items-center"><span className="mr-2">⏳</span>Understanding question</span>
        <AntButton className="bg-gray-100 text-sm px-2" type="text" size="small" onClick={attachLoading(onStop, setLoading)} disabled={loading}>
          <StopCircle className="-mr-1 inline h-4 w-4" /> Stop
        </AntButton>
      </div>
    </Card>
  );
};

const Failed = (props: Props) => {
  const { onClose, data, error } = props;
  const { message, shortMessage, stacktrace } = error || {};
  const hasStacktrace = !!stacktrace;
  return (
    <Card>
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center"><AlertTriangle className="mr-2 h-4 w-4 text-red-500" />{shortMessage || 'Error'}</div>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="-mr-1 h-4 w-4" /> Close</Button>
      </div>
      <div className="text-muted-foreground">{data.intentReasoning || message}</div>
      {hasStacktrace && <ErrorCollapse className="mt-2" message={stacktrace.join('\n')} />}
    </Card>
  );
};

const IntentionFinished = (props: Props) => {
  const { data, onIntentSQLAnswer } = props;
  const { type } = data;

  useEffect(() => {
    // create an empty response first if this is a text to sql task
    if (type === AskingTaskType.TEXT_TO_SQL) {
      onIntentSQLAnswer && onIntentSQLAnswer();
    }
  }, [type, onIntentSQLAnswer]);

  // To keep the UI result keep showing as understanding
  return <Understanding {...props} />;
};

const GeneralAnswer = (props: Props) => {
  const { onClose, data, loading } = props;
  const $wrapper = useRef<HTMLDivElement>(null);
  const { originalQuestion, askingStreamTask } = data;
  const isDone = askingStreamTask && !loading;

  const scrollBottom = () => {
    if ($wrapper.current) {
      $wrapper.current.scrollTo({ top: $wrapper.current.scrollHeight });
    }
  };
  useEffect(() => { scrollBottom(); }, [askingStreamTask]);
  useEffect(() => { if (isDone) scrollBottom(); }, [isDone]);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex items-start"><span className="mr-2 mt-1 text-orange-600">💬</span><b className="font-semibold">{originalQuestion}</b></div>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="-mr-1 h-4 w-4" /> Close</Button>
      </div>
      <div className="py-3">
        <div className="bg-muted/40 text-muted-foreground py-2 px-3">
          <div className="flex items-center"><span className="mr-2 inline-flex"><BrainSVG /></span><span className="font-medium">User Intent Recognized</span></div>
          <div className="pl-5">{data.intentReasoning}</div>
        </div>
        <div ref={$wrapper} className="py-2 px-3" style={{ maxHeight: 'calc(100vh - 480px)', overflowY: 'auto' }}>
          <MarkdownBlock content={askingStreamTask} />
          {isDone && (
            <div className="text-muted-foreground flex items-center"><Info className="mr-2 h-4 w-4" />For the most accurate semantics, please visit the modeling page.</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default memo(function PromptResult(props: Props) {
  const { processState, data } = props;
  
  // Handle failed state
  if (processState === PROCESS_STATE.FAILED) return <Failed {...props} />;
  
  // Handle processing states (understanding, searching, planning, generating)
  if (
    processState === PROCESS_STATE.UNDERSTANDING ||
    processState === PROCESS_STATE.SEARCHING ||
    processState === PROCESS_STATE.PLANNING ||
    processState === PROCESS_STATE.GENERATING
  ) {
    return <Understanding {...props} />;
  }
  
  // Handle finished state
  if (processState === PROCESS_STATE.FINISHED) {
    // For TEXT_TO_SQL type, use IntentionFinished to auto-create thread response
    if (data?.type === AskingTaskType.TEXT_TO_SQL) {
      return <IntentionFinished {...props} />;
    }
    // For GENERAL type, show GeneralAnswer
    return <GeneralAnswer {...props} />;
  }
  
  return null;
});







