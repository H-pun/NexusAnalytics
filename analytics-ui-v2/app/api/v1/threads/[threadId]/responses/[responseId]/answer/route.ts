import { NextRequest } from 'next/server';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
import { components } from '@/common';
import { ApiType } from '@server/repositories/apiHistoryRepository';
import {
  ApiError,
  respondWithRoute,
  handleApiErrorRoute,
} from '@/apollo/server/utils/apiUtils';
import { getLogger } from '@server/utils';
import { ThreadResponseAnswerStatus } from '@server/services/askingService';

const logger = getLogger('API_THREAD_RESPONSE_ANSWER');
logger.level = 'debug';

const { projectService, askingService } = components;

/**
 * POST /api/v1/threads/:threadId/responses/:responseId/answer - Update answer detail status/content
 * Body: { status?: ThreadResponseAnswerStatus, content?: string }
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ threadId: string; responseId: string }> },
) {
  const { threadId, responseId } = await context.params;
  const body = await req.json();
  const { status, content } = body || {};
  const startTime = Date.now();
  let project;

  try {
    project = await projectService.getCurrentProject();

    const responseIdNum = parseInt(responseId, 10);
    if (isNaN(responseIdNum)) {
      throw new ApiError('Invalid response ID', 400);
    }

    // default: FINISHED when only content provided
    const nextStatus: ThreadResponseAnswerStatus = status || ThreadResponseAnswerStatus.FINISHED;

    const updated = await askingService.changeThreadResponseAnswerDetailStatus(
      responseIdNum,
      nextStatus,
      content,
    );

    return await respondWithRoute({
      statusCode: 200,
      responsePayload: { response: updated },
      projectId: project.id,
      apiType: ApiType.ASK,
      startTime,
      requestPayload: body,
      threadId,
      headers: Object.fromEntries(req.headers.entries()),
    });
  } catch (error) {
    return await handleApiErrorRoute({
      error,
      projectId: project?.id,
      apiType: ApiType.ASK,
      requestPayload: body,
      threadId,
      headers: Object.fromEntries(req.headers.entries()),
      startTime,
      logger,
    });
  }
}




