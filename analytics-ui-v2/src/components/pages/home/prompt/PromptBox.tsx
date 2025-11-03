'use client';

import { ComponentRef, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Prompt from './Prompt';
import useAskPrompt from '@/hooks/useAskPrompt';
import {
  useCreateThreadMutation,
  useThreadLazyQuery,
} from '@/apollo/client/graphql/home.generated';
import { CreateThreadInput } from '@/apollo/client/graphql/__types__';

interface PromptBoxProps {
  threadId?: number;
}

export default function PromptBox({ threadId }: PromptBoxProps) {
  const $prompt = useRef<ComponentRef<typeof Prompt>>(null);
  const router = useRouter();
  const askPrompt = useAskPrompt(threadId);

  const [createThread, { loading: threadCreating }] = useCreateThreadMutation({
    onError: (error) => console.error(error),
  });
  const [preloadThread] = useThreadLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const onCreateResponse = async (
    payload: CreateThreadInput | { question: string; taskId?: string },
  ) => {
    try {
      askPrompt.onStopPolling();
      const response = await createThread({
        variables: { data: payload as CreateThreadInput },
      });
      const newThreadId = response.data?.createThread.id;
      if (newThreadId) {
        await preloadThread({ variables: { threadId: newThreadId } });
        router.push(`/home/${newThreadId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Convert null to undefined for compatibility
  const promptData = {
    ...askPrompt.data,
    askingTask: askPrompt.data.askingTask ?? undefined,
    recommendedQuestions: askPrompt.data.recommendedQuestions ?? undefined,
  };

  return (
    <Prompt
      ref={$prompt}
      data={promptData}
      loading={askPrompt.loading}
      onSubmit={askPrompt.onSubmit}
      onStop={askPrompt.onStop}
      onStopPolling={askPrompt.onStopPolling}
      onStopStreaming={askPrompt.onStopStreaming}
      onStopRecommend={askPrompt.onStopRecommend}
      inputProps={askPrompt.inputProps}
      onCreateResponse={onCreateResponse}
    />
  );
}

