import { NextRequest } from 'next/server';

// Force Node.js runtime for this route (required for knex, pg, etc.)
export const runtime = 'nodejs';

import { components } from '@/common';
import { ApiType } from '@server/repositories/apiHistoryRepository';
import { AskResult, AnalyticsAILanguage } from '@/apollo/server/models/adaptor';
import * as Errors from '@/apollo/server/utils/error';
import { getLogger } from '@server/utils';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiError,
  respondWithRoute,
  handleApiErrorRoute,
  MAX_WAIT_TIME,
  isAskResultFinished,
  validateAskResult,
  transformHistoryInput,
} from '@/apollo/server/utils/apiUtils';
import { DataSourceName } from '@server/types';

const logger = getLogger('API_GENERATE_SQL');
logger.level = 'debug';

const {
  apiHistoryRepository,
  projectService,
  deployService,
  analyticsAIAdaptor,
  analyticsEngineAdaptor,
  ibisAdaptor,
} = components;

interface GenerateSqlRequest {
  question: string;
  threadId?: string;
  language?: string;
  returnSqlDialect?: boolean;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateSqlRequest;
  const {
    question,
    threadId,
    language,
    returnSqlDialect = false,
  } = body;
  const startTime = Date.now();
  let project;

  try {
    project = await projectService.getCurrentProject();

    // input validation
    if (!question) {
      throw new ApiError('Question is required', 400);
    }

    // get current project's last deployment
    const lastDeploy = await deployService.getLastDeployment(project.id);

    if (!lastDeploy) {
      throw new ApiError(
        'No deployment found, please deploy a model first',
        400,
        Errors.GeneralErrorCodes.NO_DEPLOYMENT_FOUND,
      );
    }

    // ask AI service to generate SQL
    const histories = threadId
      ? await apiHistoryRepository.findAllBy({ threadId })
      : undefined;
    const task = await analyticsAIAdaptor.ask({
      query: question,
      deployId: lastDeploy.hash,
      histories: transformHistoryInput(histories || []) as any,
      configurations: {
        language:
          language ||
          (project.language
            ? (AnalyticsAILanguage[project.language as keyof typeof AnalyticsAILanguage] ||
                AnalyticsAILanguage.EN)
            : AnalyticsAILanguage.EN),
      },
    });

    // polling for the result
    const deadline = Date.now() + MAX_WAIT_TIME;
    let result: AskResult;
    while (true) {
      result = await analyticsAIAdaptor.getAskResult(task.queryId);
      if (isAskResultFinished(result)) {
        break;
      }

      if (Date.now() > deadline) {
        throw new ApiError(
          'Timeout waiting for SQL generation',
          500,
          Errors.GeneralErrorCodes.POLLING_TIMEOUT,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // poll every second
    }

    // Validate the AI result
    validateAskResult(result, task.queryId);

    // Get the generated SQL
    let sql = result.response?.[0]?.sql;

    // Create a new thread if it's a new question
    const newThreadId = threadId || uuidv4();

    // If returnSqlDialect is true, also get and return the native SQL
    if (returnSqlDialect && sql) {
      let nativeSql: string;
      if (project.type === DataSourceName.DUCKDB) {
        nativeSql = await analyticsEngineAdaptor.getNativeSQL(sql, {
          manifest: lastDeploy.manifest,
          modelingOnly: false,
        });
      } else {
        nativeSql = await ibisAdaptor.getNativeSql({
          dataSource: project.type,
          sql,
          mdl: lastDeploy.manifest,
        });
      }

      // If the native SQL is not empty, use it
      sql = nativeSql || sql;
    }

    // Return just the SQL
    return await respondWithRoute({
      statusCode: 200,
      responsePayload: {
        sql,
        threadId: newThreadId,
      },
      projectId: project.id,
      apiType: ApiType.GENERATE_SQL,
      startTime,
      requestPayload: body,
      threadId: newThreadId,
      headers: Object.fromEntries(req.headers.entries()),
    });
  } catch (error) {
    return await handleApiErrorRoute({
      error,
      projectId: project?.id,
      apiType: ApiType.GENERATE_SQL,
      requestPayload: body,
      threadId,
      headers: Object.fromEntries(req.headers.entries()),
      startTime,
      logger,
    });
  }
}
