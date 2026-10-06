import { describe, expect, it, vi } from "vitest";
import { createVueMfeEntry } from "../src/mfe/vue-factory";
import { createSvelteMfeEntry } from "../src/mfe/svelte-factory";
import { createSolidMfeEntry } from "../src/mfe/solid-factory";
import type { MicroApp, MfeRegistry } from "../src/types";

const makeRegistry = (): MfeRegistry & { apps: Map<string, MicroApp> } => {
  const apps = new Map<string, MicroApp>();
  return {
    apps,
    register: (name, app) => void apps.set(name, app),
    isRegistered: (name) => apps.has(name),
  };
};

describe("framework MFE factories", () => {
  it("vue: mounts/unmounts per container and registers once", () => {
    const registry = makeRegistry();
    const unmountSpy = vi.fn();
    const createApp = vi.fn(() => ({ mount: vi.fn(), unmount: unmountSpy }));

    const entry = createVueMfeEntry({
      AppComponent: {},
      appId: "vue",
      registry,
      createApp,
    });
    createVueMfeEntry({ AppComponent: {}, appId: "vue", registry, createApp });
    expect(registry.apps.get("vue")).toBe(entry.default);

    const a = document.createElement("div");
    const b = document.createElement("div");
    entry.mount(a, { locale: "vi" });
    entry.mount(b, {});
    expect(createApp).toHaveBeenCalledWith({}, { locale: "vi" });

    entry.unmount(a);
    entry.unmount(a); // second call is a no-op
    expect(unmountSpy).toHaveBeenCalledTimes(1);
    entry.unmount(b);
    expect(unmountSpy).toHaveBeenCalledTimes(2);
  });

  it("svelte: destroys the instance it created", () => {
    const destroy = vi.fn();
    const ctor = vi.fn(function (this: { $destroy: () => void }) {
      this.$destroy = destroy;
    });
    const entry = createSvelteMfeEntry({
      AppComponent: ctor as never,
      appId: "svelte",
      registry: makeRegistry(),
    });
    const el = document.createElement("div");
    entry.mount(el, { theme: "dark" });
    expect(ctor).toHaveBeenCalledWith({ target: el, props: { theme: "dark" } });
    entry.unmount(el);
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("solid: calls the dispose function returned by renderApp", () => {
    const dispose = vi.fn();
    const entry = createSolidMfeEntry({
      appId: "solid",
      registry: makeRegistry(),
      renderApp: () => dispose,
    });
    const el = document.createElement("div");
    entry.mount(el, {});
    entry.unmount(el);
    expect(dispose).toHaveBeenCalledOnce();
  });
});
