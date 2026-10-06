import { describe, expect, it, vi } from "vitest";
import { MountManager } from "../src/mfe/mount-manager";

const container = () => document.createElement("div");

describe("MountManager", () => {
  it("runs hooks in order and records the mount", async () => {
    const order: string[] = [];
    const mm = new MountManager();
    await mm.mount(
      "app",
      container(),
      {} as never,
      {
        onBeforeMount: () => void order.push("before"),
        onAfterMount: () => void order.push("after"),
      },
      () => void order.push("mount"),
    );
    expect(order).toEqual(["before", "mount", "after"]);
    expect(mm.isMounted("app")).toBe(true);
  });

  it("rejects a hanging hook after the timeout in strict mode", async () => {
    vi.useFakeTimers();
    const mm = new MountManager();
    const onError = vi.fn();
    const p = mm.mount(
      "slow",
      container(),
      {} as never,
      { onBeforeMount: () => new Promise(() => {}), onError },
      () => {},
      { timeout: 100, strict: true },
    );
    const assertion = expect(p).rejects.toThrow(/Mount timeout/);
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    expect(onError).toHaveBeenCalledOnce();
    expect(mm.isMounted("slow")).toBe(false);
    vi.useRealTimers();
  });

  it("calls unmount and clears state", async () => {
    const mm = new MountManager();
    await mm.mount("app", container(), {} as never, {}, () => {});
    const unmount = vi.fn();
    await mm.unmount("app", unmount);
    expect(unmount).toHaveBeenCalledOnce();
    expect(mm.isMounted("app")).toBe(false);
  });
});
