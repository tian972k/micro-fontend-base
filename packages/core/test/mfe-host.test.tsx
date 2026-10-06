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
    const remoteLoader = () =>
      new Promise<void>((resolve) => (finishLoad = resolve));

    const { unmount } = render(
      <MfeHost
        name="late"
        type={MicroAppType.REACT}
        host="http://localhost:9999"
        remoteLoader={remoteLoader}
      />,
    );
    unmount();

    vi.spyOn(console, "debug").mockImplementation(() => {});
    await act(async () => {
      AppRegistry.register("late", app);
      finishLoad();
    });

    expect(app.mount).not.toHaveBeenCalled();
    expect(app.unmount).not.toHaveBeenCalled();
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
