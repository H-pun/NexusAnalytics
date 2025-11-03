'use client';

import {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { PROCESS_STATE } from '@/utils/enum';
import PromptInput from '@/components/pages/home/prompt/Input';
import PromptResult from '@/components/pages/home/prompt/Result';
import useAskProcessState from '@/hooks/useAskProcessState';
import { getIsProcessing } from '@/hooks/useAskProcessState';
import { AskPromptData } from '@/hooks/useAskPrompt';
import {
  CreateThreadInput,
  CreateThreadResponseInput,
} from '@/apollo/client/graphql/__types__';

interface Props {
  onCreateResponse: (
    payload: CreateThreadInput | CreateThreadResponseInput,
  ) => Promise<void>;
  onStop: () => void;
  onSubmit: (value: string) => Promise<void>;
  onStopPolling: () => void;
  onStopStreaming: () => void;
  onStopRecommend: () => void;
  data: AskPromptData;
  loading: boolean;
  inputProps: {
    placeholder: string;
  };
}

export interface Attributes {
  submit: (value: string) => void;
  close: () => void;
}

export default forwardRef<Attributes, Props>(function Prompt(props, ref) {
  const {
    data,
    loading,
    onSubmit,
    onStop,
    onCreateResponse,
    onStopStreaming,
    onStopRecommend,
    inputProps,
  } = props;
  const askProcessState = useAskProcessState();

  const {
    originalQuestion,
    askingTask,
    askingStreamTask,
    recommendedQuestions,
  } = data;

  const result = useMemo(
    () => ({
      type: askingTask?.type, // question's type
      originalQuestion, // original question
      askingStreamTask: askingStreamTask || '', // for general answer
      recommendedQuestions, // guiding user to ask
      intentReasoning: askingTask?.intentReasoning || '',
    }),
    [
      askingTask?.type,
      originalQuestion,
      askingStreamTask,
      recommendedQuestions,
      askingTask?.intentReasoning,
    ],
  );
  const error = useMemo(() => askingTask?.error || null, [askingTask?.error]);
  const [showResult, setShowResult] = useState(false);
  const [question, setQuestion] = useState('');
  const currentProcessState = useMemo(
    () => askProcessState.currentState,
    [askProcessState.currentState],
  );
  const isProcessing = useMemo(
    () => getIsProcessing(currentProcessState),
    [currentProcessState],
  );

  useEffect(() => {
    if (askingTask) {
      const processState = askProcessState.matchedState(askingTask);
      askProcessState.transitionTo(processState);
    }
  }, [askingTask, askProcessState]);

  useEffect(() => {
    if (error) {
      !askProcessState.isFailed() &&
        askProcessState.transitionTo(PROCESS_STATE.FAILED);
    }
  }, [error, askProcessState]);

  // create thread response for recommended question
  const selectRecommendedQuestion = async (payload: {
    question: string;
    sql: string;
  }) => {
    onCreateResponse && (await onCreateResponse(payload));
    closeResult();
  };

  // create thread response for text to sql
  const intentSQLAnswer = async () => {
    onCreateResponse &&
      (await onCreateResponse({ question, taskId: askingTask?.queryId }));
    setShowResult(false);
  };

  const closeResult = useCallback(() => {
    askProcessState.resetState();
    setQuestion('');
    onStopStreaming && onStopStreaming();
    onStopRecommend && onStopRecommend();
  }, [askProcessState, onStopStreaming, onStopRecommend]);

  const stopProcess = async () => {
    onStop && (await onStop());
    setShowResult(false);
    askProcessState.resetState();
  };

  const submitAsk = useCallback(
    async (value: string) => {
      setQuestion(value);
      if (isProcessing || !value) return;
      // start the state as understanding when user submit question
      askProcessState.transitionTo(PROCESS_STATE.UNDERSTANDING);
      setShowResult(true);
      onSubmit && (await onSubmit(value));
    },
    [isProcessing, askProcessState, onSubmit],
  );

  useImperativeHandle(
    ref,
    () => ({
      submit: submitAsk,
      close: closeResult,
    }),
    [submitAsk, closeResult],
  );

  return (
    <div
      className="fixed w-[680px] left-1/2 bottom-[18px] z-[999] flex items-end bg-gray-100 p-3 border border-gray-300 rounded"
      style={{
        marginLeft: 'calc(-340px + 133px)',
        boxShadow:
          'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      }}
    >
      <PromptInput
        question={question}
        isProcessing={isProcessing}
        onAsk={submitAsk}
        inputProps={inputProps}
      />

      {showResult && (
        <PromptResult
          data={result}
          error={error}
          loading={loading}
          processState={currentProcessState}
          onSelectRecommendedQuestion={selectRecommendedQuestion}
          onIntentSQLAnswer={intentSQLAnswer}
          onClose={closeResult}
          onStop={stopProcess}
        />
      )}
    </div>
  );
});

