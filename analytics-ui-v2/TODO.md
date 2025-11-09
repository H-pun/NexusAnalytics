# Analytics UI v2 Migration TODO

## Status Progress

### ✅ Completed
- [x] Create server config/env in analytics-ui-v2 mirroring @server/config
- [x] Add tsconfig path aliases (@server, @/apollo) and Node runtime settings
- [x] Add DB bootstrap (knex), knexfile, and port migrations to v2
- [x] Implement minimal repositories (Project, DeployLog, ApiHistory)
- [x] Copy adaptors, models, services, utils from analytics-ui
- [x] Update package.json with required dependencies

### 🔄 In Progress
- [ ] Fix import paths in copied files (@server, @/apollo)
- [ ] Add API client wrappers (typed) and wire Chat UI to BFF
- [ ] Test all endpoints match analytics-ui behavior
- [ ] Verify GraphQL queries work identically
- [ ] Test streaming endpoints (SSE)

### ✅ Recently Completed
- [x] Port REST endpoints to app/api/v1 (generate_sql, run_sql, generate_vega_chart)
- [x] Implement SSE endpoint app/api/v1/stream_explanation
- [x] Add GraphQL endpoint app/api/graphql with same typeDefs/resolvers
- [x] Port config endpoint app/api/config
- [x] Update next.config.mjs for Node.js runtime
- [x] Add runtime = 'nodejs' to all API routes

### 📋 Pending
- [ ] Add env examples and documentation
- [ ] Test all endpoints match analytics-ui behavior
- [ ] Verify GraphQL queries work identically
- [ ] Test streaming endpoints (SSE)
- [ ] Add error handling and logging
- [ ] Update next.config.mjs for Node.js runtime where needed

## Environment Variables

Required environment variables (same as analytics-ui):
```
ANALYTICS_ENGINE_ENDPOINT=http://192.168.18.68:8080
ANALYTICS_AI_ENDPOINT=http://192.168.18.68:5555
IBIS_SERVER_ENDPOINT=http://192.168.18.68:8000
DB_TYPE=pg
PG_URL=postgres://demo:demo123@192.168.18.68:5432/northwind
```

Optional:
```
TELEMETRY_ENABLED=true
POSTHOG_API_KEY=...
POSTHOG_HOST=...
USER_UUID=...
ENCRYPTION_PASSWORD=...
ENCRYPTION_SALT=...
```

## Next Steps

1. Port REST API endpoints from `pages/api/v1/*` to `app/api/v1/*/route.ts`
2. Port GraphQL endpoint from `pages/api/graphql.ts` to `app/api/graphql/route.ts`
3. Fix all import paths in copied files to use @server/* and @/apollo/* aliases
4. Test endpoints match analytics-ui behavior exactly
5. Wire up Chat UI to use new BFF endpoints

## Notes

- All migrations have been copied from analytics-ui
- Server-side code (repositories, services, adaptors) copied from analytics-ui
- Need to adjust for Next.js 16 App Router (route handlers instead of API routes)
- GraphQL needs to use @apollo/server instead of apollo-server-micro

