import { getConfig } from '@/apollo/server/config';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

export async function GET() {
  const config = getConfig();
  const encodedTelemetryKey = config.posthogApiKey
    ? Buffer.from(config.posthogApiKey).toString('base64')
    : '';

  return Response.json({
    isTelemetryEnabled: config.telemetryEnabled || false,
    telemetryKey: encodedTelemetryKey,
    telemetryHost: config.posthogHost || '',
    userUUID: config.userUUID || '',
  });
}

