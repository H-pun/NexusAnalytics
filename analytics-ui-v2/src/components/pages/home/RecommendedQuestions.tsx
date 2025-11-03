"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PROJECT_RECOMMENDATION_QUESTIONS,
  GENERATE_PROJECT_RECOMMENDATION_QUESTIONS,
  GET_THREAD_RECOMMENDATION_QUESTIONS,
  GENERATE_THREAD_RECOMMENDATION_QUESTIONS,
  INSTANT_RECOMMENDED_QUESTIONS,
  CREATE_INSTANT_RECOMMENDED_QUESTIONS,
} from '@/apollo/client/graphql/home';
import { Button } from '@/components/ui/button';

interface Props {
  threadId?: number;
  onPick?: (question: string) => void;
}

export default function RecommendedQuestions({ threadId, onPick }: Props) {
  const isThread = !!threadId;

  const { data: projectData, refetch: refetchProject } = useQuery(
    GET_PROJECT_RECOMMENDATION_QUESTIONS,
    { skip: isThread }
  );
  const { data: threadData, refetch: refetchThread } = useQuery(
    GET_THREAD_RECOMMENDATION_QUESTIONS,
    { skip: !isThread, variables: { threadId } }
  );

  const [generateProject, { loading: genProjLoading }] = useMutation(
    GENERATE_PROJECT_RECOMMENDATION_QUESTIONS
  );
  const [generateThread, { loading: genThreadLoading }] = useMutation(
    GENERATE_THREAD_RECOMMENDATION_QUESTIONS
  );

  const questions = useMemo(() => {
    const task = isThread
      ? threadData?.getThreadRecommendationQuestions
      : projectData?.getProjectRecommendationQuestions;
    return task?.questions ?? [];
  }, [isThread, projectData, threadData]);

  const loading = genProjLoading || genThreadLoading;

  const onGenerate = async () => {
    if (isThread) {
      await generateThread({ variables: { threadId } });
      await refetchThread();
    } else {
      await generateProject();
      await refetchProject();
    }
  };

  // Instant recommended questions (optional quick generate)
  const [taskId, setTaskId] = useState<string | null>(null);
  const [createInstant] = useMutation(CREATE_INSTANT_RECOMMENDED_QUESTIONS);
  const { data: instantData, refetch: refetchInstant } = useQuery(
    INSTANT_RECOMMENDED_QUESTIONS,
    { skip: !taskId, variables: { taskId: taskId as string } }
  );

  useEffect(() => {
    if (!taskId) return;
    const t = setInterval(() => refetchInstant(), 1500);
    return () => clearInterval(t);
  }, [taskId, refetchInstant]);

  const onInstant = async () => {
    const res = await createInstant({ variables: { data: { threadId } } });
    const newId = res?.data?.createInstantRecommendedQuestions?.id;
    if (newId) setTaskId(newId);
  };

  const instantQuestions = instantData?.instantRecommendedQuestions?.questions ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onGenerate} disabled={loading}>
          Generate Questions
        </Button>
        <Button size="sm" variant="secondary" onClick={onInstant}>
          Instant Suggestions
        </Button>
      </div>

      {questions?.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Recommended</div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q: any, idx: number) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => onPick?.(typeof q === 'string' ? q : q?.question ?? '')}
              >
                {typeof q === 'string' ? q : q?.question ?? ''}
              </Button>
            ))}
          </div>
        </div>
      )}

      {instantQuestions?.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Instant</div>
          <div className="flex flex-wrap gap-2">
            {instantQuestions.map((q: any, idx: number) => (
              <Button
                key={idx}
                variant="ghost"
                size="sm"
                onClick={() => onPick?.(typeof q === 'string' ? q : q?.question ?? '')}
              >
                {typeof q === 'string' ? q : q?.question ?? ''}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


