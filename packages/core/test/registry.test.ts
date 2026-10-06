import { afterEach, describe, expect, it, vi } from "vitest";
import { AppRegistry, MFE_REGISTERED_EVENT } from "../src/mfe/registry";

const app = { mount: vi.fn(), unmount: vi.fn() };

afterEach(() => {
  delete window.MFE;
});

describe("AppRegistry", () => {
  it("registers an app on window.MFE and reports it", () => {
    AppRegistry.register("app-a", app);
    expect(window.MFE?.["app-a"]).toBe(app);
    expect(AppRegistry.get("app-a")).toBe(app);
    expect(AppRegistry.isRegistered("app-a")).toBe(true);
    expect(AppRegistry.isRegistered("missing")).toBe(false);
  });

  it("dispatches the registration event with the app name", () => {
    const listener = vi.fn();
    window.addEventListener(MFE_REGISTERED_EVENT, listener);
    AppRegistry.register("app-b", app);
    window.removeEventListener(MFE_REGISTERED_EVENT, listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      name: "app-b",
    });
  });

  it("warns when overwriting an existing registration", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    AppRegistry.register("app-c", app);
    AppRegistry.register("app-c", app);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
