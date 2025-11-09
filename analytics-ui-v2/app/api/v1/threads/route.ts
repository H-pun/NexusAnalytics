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

const logger = getLogger('API_THREADS');
logger.level = 'debug';

const { projectService, askingService } = components;

/**
 * GET /api/v1/threads - List all threads
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let project;

  try {
    project = await projectService.getCurrentProject();

    const threads = await askingService.listThreads();

    return await respondWithRoute({
      statusCode: 200,
      responsePayload: {
        threads,
      },
      projectId: project.id,
      apiType: ApiType.ASK,
      startTime,
      headers: Object.fromEntries(req.headers.entries()),
    });
  } catch (error) {
    return await handleApiErrorRoute({
      error,
      projectId: project?.id,
      apiType: ApiType.ASK,
      headers: Object.fromEntries(req.headers.entries()),
      startTime,
      logger,
    });
  }
}

/**
 * POST /api/v1/threads - Create a new thread
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { summary } = body;
  const startTime = Date.now();
  let project;

  try {
    project = await projectService.getCurrentProject();

    if (!summary) {
      throw new ApiError('Summary is required', 400);
    }

    const thread = await askingService.createThread({
      question: summary,
    });

    return await respondWithRoute({
      statusCode: 201,
      responsePayload: {
        thread,
      },
      projectId: project.id,
      apiType: ApiType.ASK,
      startTime,
      requestPayload: body,
      headers: Object.fromEntries(req.headers.entries()),
    });
  } catch (error) {
    return await handleApiErrorRoute({
      error,
      projectId: project?.id,
      apiType: ApiType.ASK,
      requestPayload: body,
      headers: Object.fromEntries(req.headers.entries()),
      startTime,
      logger,
    });
  }
}

