import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../src/events/event-bus";

describe("EventBus", () => {
  it("is a window-wide singleton", () => {
    expect(EventBus.getInstance()).toBe(EventBus.getInstance());
    expect(window.__MFE_EVENT_BUS__).toBe(EventBus.getInstance());
  });

  it("delivers events to subscribers until they unsubscribe", () => {
    const bus = EventBus.getInstance();
    const cb = vi.fn();
    const off = bus.on("test:deliver", cb);

    bus.emit("test:deliver", 1);
    off();
    bus.emit("test:deliver", 2);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(1);
  });

  it("keeps notifying other listeners when one throws", () => {
    const bus = EventBus.getInstance();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();
    const offBad = bus.on("test:throw", bad);
    const offGood = bus.on("test:throw", good);

    bus.emit("test:throw", "x");

    expect(good).toHaveBeenCalledWith("x");
    offBad();
    offGood();
  });
});
