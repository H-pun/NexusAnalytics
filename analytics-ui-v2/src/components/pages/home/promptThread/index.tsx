"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useThreadQuery } from '@/apollo/client/graphql/home.generated';
import BaseCodeBlock from '@/components/code/BaseCodeBlock';
import ErrorCollapse from '@/components/ErrorCollapse';

export default function PromptThread({ threadId }: { threadId?: number }) {
  const router = useRouter();
  
  const { data, loading, error } = useThreadQuery({
    variables: { threadId: threadId! },
    fetchPolicy: 'cache-and-network',
    skip: !threadId,
    pollInterval: 2000, // Poll every 2 seconds to get updates
    onError: () => {
      // Navigate back to home if thread not found
      router.push('/home');
    },
  });

  const responses = useMemo(
    () => data?.thread?.responses || [],
    [data?.thread?.responses],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !data?.thread) {
    return null;
  }

  if (responses.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No responses yet</div>
      </div>
    );
  }

  // Show the latest response
  const latestResponse = responses[responses.length - 1];

  return (
    <div className="space-y-4">
      {latestResponse.sql && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">SQL</div>
          <BaseCodeBlock code={latestResponse.sql} language="sql" />
        </div>
      )}

      {latestResponse.answerDetail?.content && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Answer</div>
          <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">
            {latestResponse.answerDetail.content}
          </div>
        </div>
      )}

      {latestResponse.answerDetail?.status && (
        <div className="text-xs text-muted-foreground">
          Status: {latestResponse.answerDetail.status}
        </div>
      )}

      {latestResponse.breakdownDetail?.error?.message && (
        <ErrorCollapse message={latestResponse.breakdownDetail.error.message} />
      )}

      {/* chart rendering will be wired later using existing chart utils */}
    </div>
  );
}



