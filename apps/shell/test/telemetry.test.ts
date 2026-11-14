import { describe, expect, it, vi } from "vitest";
import { action, loader } from "../app/routes/api/telemetry/route";

let ip = 0;
/** Each test posts from its own address, so rate limits don't interact. */
function post(body: string, address = `198.51.100.${++ip}`) {
  const request = new Request("http://shell.test/api/telemetry", {
    method: "POST",
    headers: { "x-forwarded-for": address },
    body,
  });
  return action({ request, params: {}, context: {} }) as Promise<Response>;
}

describe("POST /api/telemetry", () => {
  it("logs one JSON line per record", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const response = await post(
      JSON.stringify({ records: [{ kind: "error", message: "boom" }, 42] }),
    );

    expect(response.status).toBe(204);
    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({
      type: "telemetry",
      kind: "error",
      message: "boom",
    });
  });

  it("rejects invalid and oversized payloads", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post(JSON.stringify({ records: "nope" }))).status).toBe(400);
    expect((await post("x".repeat(64 * 1024 + 1))).status).toBe(413);
  });

  it("rate limits a single client", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const body = JSON.stringify({ records: [] });
    const statuses = [];
    for (let i = 0; i < 61; i++) {
      statuses.push((await post(body, "203.0.113.50")).status);
    }
    expect(statuses.slice(0, 60).every((status) => status === 204)).toBe(true);
    expect(statuses[60]).toBe(429);
  });

  it("only accepts POST", async () => {
    expect((loader() as Response).status).toBe(405);
  });
});
