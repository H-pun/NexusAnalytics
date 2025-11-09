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

const logger = getLogger('API_THREAD_RESPONSES');
logger.level = 'debug';

const { projectService, askingService, threadRepository, threadResponseRepository } = components;

/**
 * GET /api/v1/threads/:threadId/responses - Get all responses for a thread
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

    // Verify thread exists
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
        responses,
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

/**
 * POST /api/v1/threads/:threadId/responses - Create a new response in the thread
 * Body: { question: string, sql?: string }
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await context.params;
  const body = await req.json();
  const { question, sql } = body || {};
  const startTime = Date.now();
  let project;

  try {
    project = await projectService.getCurrentProject();

    const threadIdNum = parseInt(threadId, 10);
    if (isNaN(threadIdNum)) {
      throw new ApiError('Invalid thread ID', 400);
    }

    if (!question) {
      throw new ApiError('Question is required', 400);
    }

    // Verify thread exists
    const thread = await threadRepository.findOneBy({ id: threadIdNum });
    if (!thread) {
      throw new ApiError('Thread not found', 404);
    }

    // Create new thread response
    const response = await askingService.createThreadResponse(
      { question, sql },
      threadIdNum,
    );

    return await respondWithRoute({
      statusCode: 201,
      responsePayload: {
        response,
      },
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

