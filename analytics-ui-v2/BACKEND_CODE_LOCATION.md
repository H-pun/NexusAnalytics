# Bukti: analytics-ui-v2 Menggunakan Code Backend Sendiri

Dokumen ini menunjukkan bukti bahwa `analytics-ui-v2` menggunakan code backend yang ada di dalam project `analytics-ui-v2` itu sendiri, bukan dari project lain.

## 📁 Lokasi Code Backend di analytics-ui-v2

### 1. Adaptors (Connector ke Backend Services)

**Lokasi**: `analytics-ui-v2/src/apollo/server/adaptors/`

File-file yang ada:
- ✅ `analyticsAIAdaptor.ts` - Connector ke wren-ai-service
- ✅ `analyticsEngineAdaptor.ts` - Connector ke wren-engine  
- ✅ `ibisAdaptor.ts` - Connector ke ibis-server

**Bukti Code**:
```typescript
// File: analytics-ui-v2/src/apollo/server/adaptors/analyticsAIAdaptor.ts
import axios from 'axios';
import { Readable } from 'stream';
import {
  AskResult,
  AskResultStatus,
  // ... types dari @server/models/adaptor
} from '@server/models/adaptor';
import { getLogger } from '@server/utils';

export class AnalyticsAIAdaptor implements IAnalyticsAIAdaptor {
  private readonly analyticsAIBaseEndpoint: string;

  constructor({ analyticsAIBaseEndpoint }: { analyticsAIBaseEndpoint: string }) {
    this.analyticsAIBaseEndpoint = analyticsAIBaseEndpoint;
  }

  public async ask(input: AskInput): Promise<AsyncQueryResponse> {
    const res = await axios.post(`${this.analyticsAIBaseEndpoint}/v1/asks`, {
      query: input.query,
      id: input.deployId,
      histories: this.transformHistoryInput(input.histories),
      configurations: input.configurations,
    });
    return { queryId: res.data.query_id };
  }
  // ... methods lainnya
}
```

### 2. Services (Business Logic Layer)

**Lokasi**: `analytics-ui-v2/src/apollo/server/services/`

File-file yang ada:
- ✅ `queryService.ts` - Service untuk execute SQL
- ✅ `projectService.ts` - Service untuk manage projects
- ✅ `deployService.ts` - Service untuk deployments
- ✅ `askingService.ts` - Service untuk handle questions
- ✅ `mdlService.ts` - Service untuk MDL operations
- ✅ Dan lainnya...

### 3. Repositories (Data Access Layer)

**Lokasi**: `analytics-ui-v2/src/apollo/server/repositories/`

File-file yang ada:
- ✅ `projectRepository.ts`
- ✅ `apiHistoryRepository.ts`
- ✅ `threadRepository.ts`
- ✅ Dan lainnya...

### 4. Utils & Config

**Lokasi**: `analytics-ui-v2/src/apollo/server/`

- ✅ `config.ts` - Server configuration
- ✅ `utils/` - Utility functions
- ✅ `models/` - Type definitions

## 🔗 Bagaimana API Routes Memanggil Backend

### Step 1: Inisialisasi Components

**File**: `analytics-ui-v2/src/common.ts`

```typescript
// Import adaptors dari analytics-ui-v2 sendiri
import {
  AnalyticsEngineAdaptor,
  AnalyticsAIAdaptor,
  IbisAdaptor,
} from '@server/adaptors';  // ← Path alias ke analytics-ui-v2/src/apollo/server/adaptors

export const initComponents = () => {
  // Inisialisasi adaptors
  const analyticsEngineAdaptor = new AnalyticsEngineAdaptor({
    analyticsEngineEndpoint: serverConfig.analyticsEngineEndpoint,
  });
  const analyticsAIAdaptor = new AnalyticsAIAdaptor({
    analyticsAIBaseEndpoint: serverConfig.analyticsAIEndpoint,
  });
  const ibisAdaptor = new IbisAdaptor({
    ibisServerEndpoint: serverConfig.ibisServerEndpoint,
  });

  // Inisialisasi services yang menggunakan adaptors
  const queryService = new QueryService({
    ibisAdaptor,
    analyticsEngineAdaptor,
    telemetry,
  });

  return {
    // Export semua adaptors dan services
    analyticsEngineAdaptor,
    analyticsAIAdaptor,
    ibisAdaptor,
    queryService,
    // ... lainnya
  };
};

// Singleton components
export const components = initComponents();
```

### Step 2: API Routes Menggunakan Components

**Contoh 1**: `app/api/v1/generate_sql/route.ts`

```typescript
// Import dari analytics-ui-v2 sendiri
import { components } from '@/common';  // ← @/common = analytics-ui-v2/src/common.ts
import { ApiType } from '@server/repositories/apiHistoryRepository';  // ← @server = analytics-ui-v2/src/apollo/server
import { AskResult, AnalyticsAILanguage } from '@/apollo/server/models/adaptor';  // ← @/apollo = analytics-ui-v2/src/apollo

// Destructure components yang sudah diinisialisasi
const {
  apiHistoryRepository,
  projectService,
  deployService,
  analyticsAIAdaptor,  // ← Ini adalah instance dari AnalyticsAIAdaptor di analytics-ui-v2
  analyticsEngineAdaptor,
  ibisAdaptor,
} = components;

export async function POST(req: NextRequest) {
  // Menggunakan analyticsAIAdaptor dari analytics-ui-v2
  const task = await analyticsAIAdaptor.ask({
    query: question,
    deployId: lastDeploy.hash,
    histories: transformHistoryInput(histories || []),
    configurations: {
      language: /* ... */,
    },
  });
  
  // Polling menggunakan analyticsAIAdaptor dari analytics-ui-v2
  result = await analyticsAIAdaptor.getAskResult(task.queryId);
}
```

**Contoh 2**: `app/api/v1/run_sql/route.ts`

```typescript
import { components } from '@/common';  // ← Import dari analytics-ui-v2

const { projectService, queryService, deployService } = components;

export async function POST(req: NextRequest) {
  // Menggunakan queryService dari analytics-ui-v2
  const result = await queryService.preview(sql, {
    project,
    limit,
    manifest: lastDeploy.manifest,
    modelingOnly: false,
  });
}
```

**Contoh 3**: `app/api/v1/stream_summary/route.ts`

```typescript
import { components } from '@/common';  // ← Import dari analytics-ui-v2

const { analyticsAIAdaptor } = components;

export async function GET(req: NextRequest) {
  // Menggunakan analyticsAIAdaptor dari analytics-ui-v2
  const stream = await analyticsAIAdaptor.streamTextBasedAnswer(queryId);
}
```

## 🔍 Bukti Path Aliases

**File**: `analytics-ui-v2/tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*", "./src/*"],           // ← analytics-ui-v2 root
      "@server": ["./src/apollo/server/index.ts"],  // ← analytics-ui-v2/src/apollo/server
      "@server/*": ["./src/apollo/server/*"],       // ← analytics-ui-v2/src/apollo/server/*
      "@/apollo/*": ["./src/apollo/*"]              // ← analytics-ui-v2/src/apollo/*
    }
  }
}
```

**Ini membuktikan**:
- `@/common` → `analytics-ui-v2/src/common.ts`
- `@server/adaptors` → `analytics-ui-v2/src/apollo/server/adaptors/`
- `@server/services` → `analytics-ui-v2/src/apollo/server/services/`
- `@/apollo/server/utils` → `analytics-ui-v2/src/apollo/server/utils/`

## 📊 Flow Lengkap: Dari API Route ke Backend Service

```
1. User Request
   ↓
2. API Route (app/api/v1/generate_sql/route.ts)
   ├─> Import: import { components } from '@/common'
   │   └─> '@/common' = analytics-ui-v2/src/common.ts
   ↓
3. components (analytics-ui-v2/src/common.ts)
   ├─> Import: import { AnalyticsAIAdaptor } from '@server/adaptors'
   │   └─> '@server/adaptors' = analytics-ui-v2/src/apollo/server/adaptors/
   ├─> new AnalyticsAIAdaptor({ ... })
   │   └─> Instance dibuat dari code di analytics-ui-v2
   └─> Export: export const components = initComponents()
   ↓
4. API Route menggunakan components
   ├─> const { analyticsAIAdaptor } = components
   └─> await analyticsAIAdaptor.ask({ ... })
       └─> Memanggil method dari AnalyticsAIAdaptor di analytics-ui-v2
   ↓
5. AnalyticsAIAdaptor (analytics-ui-v2/src/apollo/server/adaptors/analyticsAIAdaptor.ts)
   └─> axios.post(`${this.analyticsAIBaseEndpoint}/v1/asks`, ...)
       └─> HTTP call ke wren-ai-service (backend service eksternal)
```

## ✅ Checklist Bukti

- [x] **Adaptors ada di analytics-ui-v2**: `src/apollo/server/adaptors/`
- [x] **Services ada di analytics-ui-v2**: `src/apollo/server/services/`
- [x] **Repositories ada di analytics-ui-v2**: `src/apollo/server/repositories/`
- [x] **Components diinisialisasi di analytics-ui-v2**: `src/common.ts`
- [x] **API Routes import dari analytics-ui-v2**: Menggunakan `@/common`, `@server/*`, `@/apollo/*`
- [x] **Path aliases mengarah ke analytics-ui-v2**: `tsconfig.json` menunjukkan semua path mengarah ke `./src/apollo/server/*`

## 🎯 Kesimpulan

**Semua code backend (adaptors, services, repositories) ada di dalam folder `analytics-ui-v2/src/apollo/server/`**, dan API routes di `analytics-ui-v2/app/api/v1/` menggunakan code tersebut melalui:

1. **Import path aliases** (`@/common`, `@server/*`, `@/apollo/*`) yang mengarah ke code di `analytics-ui-v2`
2. **Components singleton** yang diinisialisasi di `analytics-ui-v2/src/common.ts`
3. **Direct instantiation** dari classes yang ada di `analytics-ui-v2/src/apollo/server/`

**Tidak ada dependency ke code dari project `analytics-ui`** - semua code backend adalah milik `analytics-ui-v2` sendiri.

  