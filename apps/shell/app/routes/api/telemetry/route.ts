import { json, type ActionFunctionArgs } from "@remix-run/node";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_RECORDS = 50;

/**
 * POST /api/telemetry - receives batches from createBeaconReporter.
 *
 * Records are written as one JSON line each (picked up by Vercel/Docker
 * log drains). Set TELEMETRY_FORWARD_URL to also forward each batch to a
 * collector (Datadog/Loki/OTel HTTP endpoint, ...).
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return json({ error: "Payload too large" }, { status: 413 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "Payload too large" }, { status: 413 });
  }

  let records: unknown[];
  try {
    const parsed = JSON.parse(raw) as { records?: unknown };
    if (!Array.isArray(parsed.records)) throw new Error("records missing");
    records = parsed.records.slice(0, MAX_RECORDS);
  } catch {
    return json({ error: "Invalid payload" }, { status: 400 });
  }

  const meta = {
    userAgent: request.headers.get("user-agent") ?? undefined,
    receivedAt: new Date().toISOString(),
  };

  for (const record of records) {
    if (typeof record !== "object" || record === null) continue;
    console.log(JSON.stringify({ type: "telemetry", ...record, ...meta }));
  }

  const forwardUrl = process.env.TELEMETRY_FORWARD_URL;
  if (forwardUrl) {
    // Fire-and-forget; telemetry must never slow down or fail the client.
    void fetch(forwardUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records, ...meta }),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }

  return new Response(null, { status: 204 });
};

export const loader = () =>
  json({ error: "Method not allowed" }, { status: 405 });
