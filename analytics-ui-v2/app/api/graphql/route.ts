// Force Node.js runtime for GraphQL (required for knex, pg, etc.)
export const runtime = 'nodejs';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs } from '@server';
import resolvers from '@server/resolvers';
import { IContext } from '@server/types';
import { GraphQLError } from 'graphql';
import { getLogger } from '@server/utils';
import { getConfig } from '@server/config';
import { ModelService } from '@server/services/modelService';
import {
  defaultApolloErrorHandler,
  GeneralErrorCodes,
} from '@/apollo/server/utils/error';
import { TelemetryEvent } from '@/apollo/server/telemetry/telemetry';
import { components } from '@/common';

const serverConfig = getConfig();
const logger = getLogger('APOLLO');
logger.level = 'debug';

// Initialize Apollo Server
const bootstrapServer = async () => {
  const {
    telemetry,

    // repositories
    projectRepository: _projectRepository,
    modelRepository,
    modelColumnRepository,
    relationRepository,
    deployLogRepository: _deployLogRepository,
    viewRepository,
    schemaChangeRepository: _schemaChangeRepository,
    learningRepository: _learningRepository,
    modelNestedColumnRepository: _modelNestedColumnRepository,
    dashboardRepository: _dashboardRepository,
    dashboardItemRepository: _dashboardItemRepository,
    sqlPairRepository: _sqlPairRepository,
    instructionRepository: _instructionRepository,
    apiHistoryRepository: _apiHistoryRepository,
    dashboardItemRefreshJobRepository: _dashboardItemRefreshJobRepository,
    // adaptors
    analyticsEngineAdaptor,
    ibisAdaptor: _ibisAdaptor,
    analyticsAIAdaptor: _analyticsAIAdaptor,

    // services
    projectService,
    queryService,
    askingService,
    deployService: _deployService,
    mdlService,
    dashboardService: _dashboardService,
    sqlPairService: _sqlPairService,

    instructionService: _instructionService,
    // background trackers
    projectRecommendQuestionBackgroundTracker,
    threadRecommendQuestionBackgroundTracker,
    dashboardCacheBackgroundTracker: _dashboardCacheBackgroundTracker,
  } = components;

  const _modelService = new ModelService({
    projectService,
    modelRepository,
    modelColumnRepository,
    relationRepository,
    viewRepository,
    mdlService,
    analyticsEngineAdaptor,
    queryService,
  });

  // initialize services
  await Promise.all([
    askingService.initialize(),
    projectRecommendQuestionBackgroundTracker.initialize(),
    threadRecommendQuestionBackgroundTracker.initialize(),
  ]);

  const apolloServer = new ApolloServer<IContext>({
    typeDefs,
    resolvers,
    formatError: (formattedError, error) => {
      // Convert formattedError back to GraphQLError if possible
      let graphQLError: GraphQLError;
      if (error instanceof GraphQLError) {
        graphQLError = error;
      } else {
        graphQLError = new GraphQLError(
          formattedError.message,
          undefined,
          undefined,
          undefined,
          formattedError.path,
          error instanceof Error ? error : undefined,
          formattedError.extensions,
        );
      }

      // stop print error stacktrace of dry run error
      if (graphQLError.extensions?.code === GeneralErrorCodes.DRY_RUN_ERROR) {
        return defaultApolloErrorHandler(graphQLError);
      }

      // print error stacktrace of graphql error
      const exception = graphQLError.extensions?.exception as { stacktrace?: string[] } | undefined;
      const stacktrace = exception?.stacktrace;
      if (stacktrace) {
        logger.error(stacktrace.join('\n'));
      }

      // print original error stacktrace
      const originalError = graphQLError.extensions?.originalError as Error | undefined;
      if (originalError) {
        logger.error(`== original error ==`);
        // error may not have stack, so print error message if stack is not available
        logger.error(originalError.stack || originalError.message);
      }

      // telemetry: capture internal server error
      if (graphQLError.extensions?.code === GeneralErrorCodes.INTERNAL_SERVER_ERROR) {
        telemetry.sendEvent(
          TelemetryEvent.GRAPHQL_ERROR,
          {
            originalErrorStack: originalError?.stack,
            originalErrorMessage: originalError?.message,
            errorMessage: graphQLError.message,
          },
          graphQLError.extensions?.service,
          false,
        );
      }
      return defaultApolloErrorHandler(graphQLError);
    },
    introspection: process.env.NODE_ENV !== 'production',
  });

  return apolloServer;
};

// Create handler with context
const handlerPromise = (async () => {
  const server = await bootstrapServer();
  return startServerAndCreateNextHandler<NextRequest, IContext>(
    server,
  {
    context: async (_req): Promise<IContext> => {
      const {
        telemetry,

        // repositories
        projectRepository,
        modelRepository,
        modelColumnRepository,
        relationRepository,
        deployLogRepository,
        viewRepository,
        schemaChangeRepository,
        learningRepository,
        modelNestedColumnRepository,
        dashboardRepository,
        dashboardItemRepository,
        sqlPairRepository,
        instructionRepository,
        apiHistoryRepository,
        dashboardItemRefreshJobRepository,
        // adaptors
        analyticsEngineAdaptor,
        ibisAdaptor,
        analyticsAIAdaptor,

        // services
        projectService,
        queryService,
        askingService,
        deployService,
        mdlService,
        dashboardService,
        sqlPairService,

        instructionService,
        // background trackers
        projectRecommendQuestionBackgroundTracker,
        threadRecommendQuestionBackgroundTracker,
        dashboardCacheBackgroundTracker,
      } = components;

      const modelService = new ModelService({
        projectService,
        modelRepository,
        modelColumnRepository,
        relationRepository,
        viewRepository,
        mdlService,
        analyticsEngineAdaptor,
        queryService,
      });

      return {
        config: serverConfig,
        telemetry,
        // adaptor
        analyticsEngineAdaptor,
        ibisServerAdaptor: ibisAdaptor,
        analyticsAIAdaptor,
        // services
        projectService,
        modelService,
        mdlService,
        deployService,
        askingService,
        queryService,
        dashboardService,
        sqlPairService,
        instructionService,
        // repository
        projectRepository,
        modelRepository,
        modelColumnRepository,
        modelNestedColumnRepository,
        relationRepository,
        viewRepository,
        deployRepository: deployLogRepository,
        schemaChangeRepository,
        learningRepository,
        dashboardRepository,
        dashboardItemRepository,
        sqlPairRepository,
        instructionRepository,
        apiHistoryRepository,
        dashboardItemRefreshJobRepository,
        // background trackers
        projectRecommendQuestionBackgroundTracker,
        threadRecommendQuestionBackgroundTracker,
        dashboardCacheBackgroundTracker,
      };
    },
  });
})();

export async function GET(req: NextRequest) {
  const handler = await handlerPromise;
  return handler(req);
}

export async function POST(req: NextRequest) {
  const handler = await handlerPromise;
  return handler(req);
}

