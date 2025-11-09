export interface IConfig {
  otherServiceUsingDocker: boolean;

  // database
  dbType: string;
  pgUrl?: string;
  debug?: boolean;
  sqliteFile?: string;

  persistCredentialDir?: string;

  // analytics engine
  analyticsEngineEndpoint: string;

  // analytics AI
  analyticsAIEndpoint: string;
  generationModel?: string;

  // ibis server
  experimentalEngineRustVersion?: boolean;
  ibisServerEndpoint: string;

  // encryption
  encryptionPassword: string;
  encryptionSalt: string;

  // telemetry
  telemetryEnabled?: boolean;
  posthogApiKey?: string;
  posthogHost?: string;
  userUUID?: string;

  // versions
  wrenUIVersion?: string;
  wrenEngineVersion?: string;
  wrenAIVersion?: string;
  wrenProductVersion?: string;

  // recommendation questions
  projectRecommendationQuestionMaxCategories?: number;
  projectRecommendationQuestionsMaxQuestions?: number;
  threadRecommendationQuestionMaxCategories?: number;
  threadRecommendationQuestionsMaxQuestions?: number;
}

const defaultConfig: IConfig = {
  otherServiceUsingDocker: false,

  // database
  dbType: 'sqlite',
  pgUrl: 'postgres://postgres:postgres@localhost:5432/admin_ui',
  debug: false,
  sqliteFile: './db.sqlite3',

  persistCredentialDir: `${process.cwd()}/.tmp`,

  // analytics engine
  analyticsEngineEndpoint: 'http://localhost:8080',

  // analytics AI
  analyticsAIEndpoint: 'http://localhost:5555',

  // ibis server
  experimentalEngineRustVersion: true,
  ibisServerEndpoint: 'http://127.0.0.1:8000',

  // encryption
  encryptionPassword: 'sementic',
  encryptionSalt: 'layer',
};

function envNumber(val: string | undefined, fallback: number): number {
  if (!val) return fallback;
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
}

function omitUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && `${v}` !== '') {
      (out as any)[k] = v;
    }
  }
  return out;
}

const envConfig: Partial<IConfig> = {
  otherServiceUsingDocker: process.env.OTHER_SERVICE_USING_DOCKER === 'true',

  // database
  dbType: process.env.DB_TYPE,
  pgUrl: process.env.PG_URL,
  debug: process.env.DEBUG === 'true',
  sqliteFile: process.env.SQLITE_FILE,

  persistCredentialDir:
    process.env.PERSIST_CREDENTIAL_DIR && process.env.PERSIST_CREDENTIAL_DIR.length > 0
      ? process.env.PERSIST_CREDENTIAL_DIR
      : undefined,

  // analytics engine
  analyticsEngineEndpoint: process.env.ANALYTICS_ENGINE_ENDPOINT,

  // analytics AI
  analyticsAIEndpoint: process.env.ANALYTICS_AI_ENDPOINT,
  generationModel: process.env.GENERATION_MODEL,

  // ibis server
  experimentalEngineRustVersion: process.env.EXPERIMENTAL_ENGINE_RUST_VERSION === 'true',
  ibisServerEndpoint: process.env.IBIS_SERVER_ENDPOINT,

  // encryption
  encryptionPassword: process.env.ENCRYPTION_PASSWORD,
  encryptionSalt: process.env.ENCRYPTION_SALT,

  // telemetry
  telemetryEnabled:
    !!process.env.TELEMETRY_ENABLED && process.env.TELEMETRY_ENABLED.toLowerCase() === 'true',
  posthogApiKey: process.env.POSTHOG_API_KEY,
  posthogHost: process.env.POSTHOG_HOST,
  userUUID: process.env.USER_UUID,

  // versions
  wrenUIVersion: process.env.WREN_UI_VERSION,
  wrenEngineVersion: process.env.WREN_ENGINE_VERSION,
  wrenAIVersion: process.env.WREN_AI_SERVICE_VERSION,
  wrenProductVersion: process.env.WREN_PRODUCT_VERSION,

  // recommendation questions
  projectRecommendationQuestionMaxCategories: envNumber(
    process.env.PROJECT_RECOMMENDATION_QUESTION_MAX_CATEGORIES,
    3,
  ),
  projectRecommendationQuestionsMaxQuestions: envNumber(
    process.env.PROJECT_RECOMMENDATION_QUESTIONS_MAX_QUESTIONS,
    3,
  ),
  threadRecommendationQuestionMaxCategories: envNumber(
    process.env.THREAD_RECOMMENDATION_QUESTION_MAX_CATEGORIES,
    3,
  ),
  threadRecommendationQuestionsMaxQuestions: envNumber(
    process.env.THREAD_RECOMMENDATION_QUESTIONS_MAX_QUESTIONS,
    1,
  ),
};

export function getConfig(): IConfig {
  return { ...defaultConfig, ...omitUndefined(envConfig) } as IConfig;
}





