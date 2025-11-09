import { NextRequest } from 'next/server';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
import { components } from '@/common';
import { ApiType } from '@server/repositories/apiHistoryRepository';
import * as Errors from '@/apollo/server/utils/error';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiError,
  respondWithRoute,
  handleApiErrorRoute,
  MAX_WAIT_TIME,
  validateSummaryResult,
} from '@/apollo/server/utils/apiUtils';
import {
  TextBasedAnswerInput,
  TextBasedAnswerResult,
  TextBasedAnswerStatus,
  AnalyticsAILanguage,
} from '@server/models/adaptor';
import { getLogger } from '@server/utils';

const logger = getLogger('API_GENERATE_SUMMARY');
logger.level = 'debug';

const { projectService, analyticsAIAdaptor, deployService, queryService } =
  components;

interface GenerateSummaryRequest {
  question: string;
  sql: string;
  sampleSize?: number;
  language?: string;
  threadId?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateSummaryRequest;
  const { question, sql, sampleSize, language, threadId } = body;
  const startTime = Date.now();
  let project;

  try {
    project = await projectService.getCurrentProject();

    // Input validation
    if (!question) {
      throw new ApiError('Question is required', 400);
    }

    if (!sql) {
      throw new ApiError('SQL is required', 400);
    }

    // Get current project's last deployment
    const lastDeploy = await deployService.getLastDeployment(project.id);
    if (!lastDeploy) {
      throw new ApiError(
        'No deployment found, please deploy your project first',
        400,
        Errors.GeneralErrorCodes.NO_DEPLOYMENT_FOUND,
      );
    }

    // Create a new thread if it's a new question
    const newThreadId = threadId || uuidv4();

    // Get the data from the SQL
    let sqlData;
    try {
      const queryResult = await queryService.preview(sql, {
        project,
        limit: sampleSize || 500,
        manifest: lastDeploy.manifest,
        modelingOnly: false,
      });
      sqlData = queryResult;
    } catch (queryError: any) {
      throw new ApiError(
        queryError?.message || 'Error executing SQL query',
        400,
        Errors.GeneralErrorCodes.INVALID_SQL_ERROR,
      );
    }

    // Create text-based answer input for summary generation
    const textBasedAnswerInput: TextBasedAnswerInput = {
      query: question,
      sql,
      sqlData,
      threadId: newThreadId,
      configurations: {
        language:
          language ||
          (project.language
            ? AnalyticsAILanguage[project.language as keyof typeof AnalyticsAILanguage]
            : undefined) ||
          AnalyticsAILanguage.EN,
      },
    };

    // Start the summary generation task
    const task =
      await analyticsAIAdaptor.createTextBasedAnswer(textBasedAnswerInput);

    if (!task || !task.queryId) {
      throw new ApiError('Failed to start summary generation task', 500);
    }

    // Poll for the result
    const deadline = Date.now() + MAX_WAIT_TIME;
    let result: TextBasedAnswerResult;
    while (true) {
      result = await analyticsAIAdaptor.getTextBasedAnswerResult(task.queryId);
      if (
        result.status === TextBasedAnswerStatus.SUCCEEDED ||
        result.status === TextBasedAnswerStatus.FAILED
      ) {
        break;
      }

      if (Date.now() > deadline) {
        throw new ApiError(
          'Timeout waiting for summary generation',
          500,
          Errors.GeneralErrorCodes.POLLING_TIMEOUT,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every second
    }

    // Validate the summary result
    validateSummaryResult(result);

    // Return the queryId so client can stream the summary
    if (result.status === TextBasedAnswerStatus.SUCCEEDED) {
      return await respondWithRoute({
        statusCode: 200,
        responsePayload: {
          explanationQueryId: task.queryId,
          threadId: newThreadId,
        },
        projectId: project.id,
        apiType: ApiType.GENERATE_SUMMARY,
        startTime,
        requestPayload: body,
        threadId: newThreadId,
        headers: Object.fromEntries(req.headers.entries()),
      });
    } else {
      throw new ApiError('Summary generation failed', 500);
    }
  } catch (error) {
    return await handleApiErrorRoute({
      error,
      projectId: project?.id,
      apiType: ApiType.GENERATE_SUMMARY,
      requestPayload: body,
      threadId,
      headers: Object.fromEntries(req.headers.entries()),
      startTime,
      logger,
    });
  }
}

