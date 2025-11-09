# Analytics UI v2 - Architecture & Backend Connection

## 🏗️ Arsitektur Sistem

### Overview
`analytics-ui-v2` adalah Next.js application yang berfungsi sebagai **BFF (Backend for Frontend)** yang menghubungkan frontend dengan backend services. Berbeda dengan `analytics-ui` yang menggunakan GraphQL, `analytics-ui-v2` menggunakan **REST API endpoints**.

### Komponen Utama

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                  │
│              components/chat, app/chat, hooks/              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API Calls
                        │
┌───────────────────────▼─────────────────────────────────────┐
│         analytics-ui-v2 (Next.js BFF Layer)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (app/api/v1/*)                           │  │
│  │  - /api/v1/generate_sql                             │  │
│  │  - /api/v1/run_sql                                  │  │
│  │  - /api/v1/generate_summary                         │  │
│  │  - /api/v1/stream_summary                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services & Adaptors (src/apollo/server/)            │  │
│  │  - AnalyticsAIAdaptor                               │  │
│  │  - AnalyticsEngineAdaptor                           │  │
│  │  - QueryService                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌──────────────┐ ┌──────────────┐
│ wren-ai-      │ │ wren-engine  │ │ ibis-server  │
│ service       │ │              │ │              │
│ :5555         │ │ :8080        │ │ :8000        │
└───────┬───────┘ └──────────────┘ └──────────────┘
        │
        │ (uses)
        ▼
┌───────────────┐
│   Qdrant      │
│   :6333       │
│ (Vector DB)   │
└───────────────┘
```

## 🔌 Backend Services Connection

### 1. Analytics AI Service (wren-ai-service)
- **Endpoint**: `ANALYTICS_AI_ENDPOINT` (default: `http://localhost:5555`)
- **Digunakan untuk**:
  - Generate SQL dari natural language (`/v1/asks`)
  - Generate summary dari SQL results (`/v1/text-based-answers`)
  - Generate charts (`/v1/charts`)
- **Terhubung ke**:
  - **Qdrant** (port 6333): Vector database untuk schema embeddings & historical questions
  - **LLM** (via litellm): Untuk text generation
  - **Embedder**: Untuk vector embeddings
- **File konfigurasi**: `analytics-ai-service/config.yaml`

### 2. Analytics Engine (wren-engine)
- **Endpoint**: `ANALYTICS_ENGINE_ENDPOINT` (default: `http://localhost:8080`)
- **Digunakan untuk**:
  - Execute SQL queries
  - Validate SQL syntax
  - Get native SQL (untuk DuckDB)
- **Digunakan oleh**: `QueryService` di `analytics-ui-v2`

### 3. Ibis Server
- **Endpoint**: `IBIS_SERVER_ENDPOINT` (default: `http://127.0.0.1:8000`)
- **Digunakan untuk**:
  - Convert SQL ke native SQL untuk BigQuery dan databases lain
  - Query execution untuk non-DuckDB databases

### 4. Qdrant (Vector Database)
- **Port**: 6333
- **Digunakan untuk**:
  - Menyimpan schema embeddings (MDL)
  - Retrieve relevant schema context untuk SQL generation
  - Historical question retrieval
- **Terhubung melalui**: `wren-ai-service` (bukan langsung dari `analytics-ui-v2`)

## 📊 Data Flow

### Flow: Generate SQL → Run SQL → Generate Summary

```
1. User asks question
   ↓
2. Frontend: POST /api/v1/generate_sql
   ↓
3. analytics-ui-v2: app/api/v1/generate_sql/route.ts
   ├─> analyticsAIAdaptor.ask()
   │   └─> POST http://ANALYTICS_AI_ENDPOINT/v1/asks
   │       └─> wren-ai-service:
   │           ├─> Query Qdrant (retrieve schema context)
   │           ├─> Use LLM (generate SQL)
   │           └─> Return queryId
   ├─> Polling: analyticsAIAdaptor.getAskResult()
   └─> Return SQL to frontend
   ↓
4. Frontend: POST /api/v1/run_sql
   ↓
5. analytics-ui-v2: app/api/v1/run_sql/route.ts
   ├─> queryService.preview()
   │   ├─> analyticsEngineAdaptor (for DuckDB)
   │   │   └─> POST http://ANALYTICS_ENGINE_ENDPOINT/...
   │   └─> OR ibisAdaptor (for BigQuery/others)
   │       └─> POST http://IBIS_SERVER_ENDPOINT/...
   └─> Return data to frontend
   ↓
6. Frontend: POST /api/v1/generate_summary
   ↓
7. analytics-ui-v2: app/api/v1/generate_summary/route.ts
   ├─> analyticsAIAdaptor.createTextBasedAnswer()
   │   └─> POST http://ANALYTICS_AI_ENDPOINT/v1/text-based-answers
   │       └─> wren-ai-service:
   │           └─> Use LLM (generate summary from SQL + data)
   ├─> Polling: analyticsAIAdaptor.getTextBasedAnswerResult()
   └─> Return summary to frontend
```

## 🔍 Key Files

### API Routes
- `app/api/v1/generate_sql/route.ts` - Generate SQL endpoint
- `app/api/v1/run_sql/route.ts` - Execute SQL endpoint
- `app/api/v1/generate_summary/route.ts` - Generate summary endpoint
- `app/api/v1/stream_summary/route.ts` - Stream summary endpoint

### Adaptors (Backend Connectors)
- `src/apollo/server/adaptors/analyticsAIAdaptor.ts` - Connects to wren-ai-service
- `src/apollo/server/adaptors/analyticsEngineAdaptor.ts` - Connects to wren-engine
- `src/apollo/server/adaptors/ibisAdaptor.ts` - Connects to ibis-server

### Services
- `src/apollo/server/services/queryService.ts` - SQL execution service
- `src/apollo/server/services/askingService.ts` - Question handling service

### Configuration
- `src/apollo/server/config.ts` - Server configuration
- `src/common.ts` - Component initialization

## ✅ Verifikasi Koneksi

### Checklist untuk memastikan semua terhubung:

1. **Environment Variables** (di `.env.local` atau environment):
   ```bash
   ANALYTICS_AI_ENDPOINT=http://localhost:5555
   ANALYTICS_ENGINE_ENDPOINT=http://localhost:8080
   IBIS_SERVER_ENDPOINT=http://127.0.0.1:8000
   DB_TYPE=pg  # atau sqlite
   PG_URL=postgres://...  # jika pakai PostgreSQL
   ```

2. **Backend Services Running**:
   - ✅ wren-ai-service running di port 5555
   - ✅ wren-engine running di port 8080
   - ✅ ibis-server running di port 8000
   - ✅ Qdrant running di port 6333

3. **Test Endpoints**:
   ```bash
   # Test generate_sql
   curl -X POST http://localhost:3000/api/v1/generate_sql \
     -H "Content-Type: application/json" \
     -d '{"question": "Show me total sales"}'
   
   # Test run_sql
   curl -X POST http://localhost:3000/api/v1/run_sql \
     -H "Content-Type: application/json" \
     -d '{"sql": "SELECT * FROM sales LIMIT 10"}'
   ```

## 🔄 Perbedaan dengan analytics-ui

| Aspek | analytics-ui | analytics-ui-v2 |
|-------|--------------|------------------|
| **API Style** | GraphQL | REST API |
| **API Routes** | `pages/api/graphql.ts` | `app/api/v1/*/route.ts` |
| **Frontend Calls** | GraphQL queries | REST fetch calls |
| **Backend Services** | ✅ Sama | ✅ Sama |
| **Qdrant Connection** | ✅ Via wren-ai-service | ✅ Via wren-ai-service |
| **Engine Connection** | ✅ Via adaptors | ✅ Via adaptors |

## 📝 Notes

- **Semua backend services sama**: `analytics-ui-v2` menggunakan backend yang sama dengan `analytics-ui`
- **Qdrant tidak langsung**: Qdrant diakses melalui `wren-ai-service`, bukan langsung dari `analytics-ui-v2`
- **Engine connection**: `wren-engine` digunakan untuk execute SQL, terhubung melalui `AnalyticsEngineAdaptor`
- **Ibis untuk BigQuery**: Untuk databases selain DuckDB, menggunakan `ibis-server` untuk native SQL conversion

## 🚀 Next Steps

1. Pastikan semua environment variables sudah dikonfigurasi
2. Test semua endpoints (`generate_sql`, `run_sql`, `generate_summary`)
3. Verify koneksi ke Qdrant melalui wren-ai-service
4. Monitor logs untuk memastikan tidak ada connection errors

