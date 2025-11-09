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

const logger = getLogger('API_THREAD');
logger.level = 'debug';

const { projectService, threadRepository, threadResponseRepository } = components;

/**
 * GET /api/v1/threads/:threadId - Get thread with responses
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await context.params;
  const startTime = Date.now();
  let project;

  try {
    project = await projectService.getCurrentProject();

    const threadIdNum = parseInt(threadId, 10);
    if (isNaN(threadIdNum)) {
      throw new ApiError('Invalid thread ID', 400);
    }

    // Get thread
    const thread = await threadRepository.findOneBy({ id: threadIdNum });
    if (!thread) {
      throw new ApiError('Thread not found', 404);
    }

    // Get responses
    const responses = await threadResponseRepository.getResponsesWithThread(
      threadIdNum,
    );

    return await respondWithRoute({
      statusCode: 200,
      responsePayload: {
        thread: {
          ...thread,
          responses,
        },
      },
      projectId: project.id,
      apiType: ApiType.ASK,
      startTime,
      threadId: threadId,
      headers: Object.fromEntries(req.headers.entries()),
    });
  } catch (error) {
    return await handleApiErrorRoute({
      error,
      projectId: project?.id,
      apiType: ApiType.ASK,
      threadId,
      headers: Object.fromEntries(req.headers.entries()),
      startTime,
      logger,
    });
  }
}

