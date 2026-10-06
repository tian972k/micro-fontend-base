import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MfeHost } from "../src/mfe/react/mfe-host";
import { AppRegistry } from "../src/mfe/registry";
import { MicroAppType } from "../src/types";

afterEach(() => {
  delete window.MFE;
  vi.unstubAllGlobals();
});

const fakeApp = () => ({ mount: vi.fn(), unmount: vi.fn() });

/** Healthy remote: health.json returns { status: "available" }. */
const stubHealthy = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ status: "available" }))),
  );

describe("MfeHost", () => {
  it("shows an error for a non-http host", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <MfeHost
        name="bad"
        type={MicroAppType.REACT}
        host="javascript:alert(1)"
      />,
    );
    expect(
      await screen.findByText(/Invalid MFE host configuration/),
    ).toBeTruthy();
  });

  it("accepts a same-origin relative host and mounts via remoteLoader", async () => {
    const app = fakeApp();
    const remoteLoader = vi.fn(async () => AppRegistry.register("rel", app));
    stubHealthy();
    vi.spyOn(console, "debug").mockImplementation(() => {});

    render(
      <MfeHost
        name="rel"
        type={MicroAppType.REACT}
        host="/api/proxy/react/"
        remoteLoader={remoteLoader}
        props={{ locale: "vi" }}
      />,
    );

    await waitFor(() => expect(app.mount).toHaveBeenCalledOnce());
    expect(app.mount.mock.calls[0][1]).toMatchObject({ locale: "vi" });
  });

  it("does not mount after the host unmounted while waiting", async () => {
    const app = fakeApp();
    let finishLoad!: () => void;
    const remoteLoader = vi.fn(
      () => new Promise<void>((resolve) => (finishLoad = resolve)),
    );
    stubHealthy();

    const { unmount } = render(
      <MfeHost
        name="late"
        type={MicroAppType.REACT}
        host="http://localhost:9999"
        remoteLoader={remoteLoader}
      />,
    );
    // Unmount while the remote's code is still downloading.
    await waitFor(() => expect(remoteLoader).toHaveBeenCalled());
    unmount();

    vi.spyOn(console, "debug").mockImplementation(() => {});
    await act(async () => {
      AppRegistry.register("late", app);
      finishLoad();
    });

    expect(app.mount).not.toHaveBeenCalled();
    expect(app.unmount).not.toHaveBeenCalled();
  });

  it("does not load the remote if unmounted during the health check", async () => {
    let finishHealth!: (r: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>((resolve) => (finishHealth = resolve))),
    );
    const remoteLoader = vi.fn(async () => {});
    const { unmount } = render(
      <MfeHost
        name="early"
        type={MicroAppType.REACT}
        host="http://localhost:9999"
        remoteLoader={remoteLoader}
      />,
    );
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    unmount();
    await act(async () => {
      finishHealth(new Response(JSON.stringify({ status: "available" })));
    });
    expect(remoteLoader).not.toHaveBeenCalled();
  });

  it("unmounts the app it mounted", async () => {
    const app = fakeApp();
    window.MFE = { mounted: app };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ version: "1" }))),
    );
    vi.spyOn(console, "log").mockImplementation(() => {});

    const { unmount } = render(
      <MfeHost
        name="mounted"
        type={MicroAppType.REACT}
        host="http://localhost:9999"
      />,
    );
    await waitFor(() => expect(app.mount).toHaveBeenCalledOnce());
    unmount();
    expect(app.unmount).toHaveBeenCalledOnce();
  });
});

describe("MfeHost with remoteLoader", () => {
  it("shows maintenance and does not load the remote", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify({ status: "maintenance" })),
      ),
    );
    const remoteLoader = vi.fn(async () => {});
    render(
      <MfeHost
        name="maint"
        type={MicroAppType.REACT}
        host="http://localhost:9999"
        remoteLoader={remoteLoader}
      />,
    );
    expect(await screen.findByText("Under Maintenance")).toBeTruthy();
    expect(remoteLoader).not.toHaveBeenCalled();
  });

  it("reports an unreachable host instead of loading", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    const remoteLoader = vi.fn(async () => {});
    render(
      <MfeHost
        name="down"
        type={MicroAppType.REACT}
        host="http://localhost:9999"
        remoteLoader={remoteLoader}
      />,
    );
    await waitFor(() => expect(remoteLoader).not.toHaveBeenCalled());
    expect(await screen.findByText("Connection Failed")).toBeTruthy();
  });
});

describe("MfeHost version changes (federation)", () => {
  it("keeps the running version instead of waiting for a re-registration", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const app = fakeApp();
    window.MFE = { versioned: app };
    // Cached v1, checked long ago -> MfeHost re-checks and sees v2.
    localStorage.setItem(
      "mfe_version_cache",
      JSON.stringify({ versioned: { version: "1", checkedAt: 0 } }),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ version: "2" }))),
    );
    const remoteLoader = vi.fn(async () => {});

    render(
      <MfeHost
        name="versioned"
        type={MicroAppType.REACT}
        host="http://localhost:9999"
        remoteLoader={remoteLoader}
      />,
    );

    await waitFor(() => expect(app.mount).toHaveBeenCalledOnce());
    expect(remoteLoader).not.toHaveBeenCalled();
    expect(window.MFE.versioned).toBe(app);
    localStorage.clear();
  });
});
