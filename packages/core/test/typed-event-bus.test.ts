import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../src/events/event-bus";
import {
  createTypedEventBus,
  runtimeEvents,
} from "../src/contracts/typed-event-bus";

type TestEvents = { ping: { n: number }; other: string };

describe("createTypedEventBus", () => {
  it("namespaces events on the shared bus", () => {
    const raw = vi.fn();
    const off = EventBus.getInstance().on("test:v1:ping", raw);
    const bus = createTypedEventBus<TestEvents>("test:v1");

    bus.emit("ping", { n: 1 });
    off();

    expect(raw).toHaveBeenCalledWith({ n: 1 });
  });

  it("keeps different namespaces apart", () => {
    const v1 = createTypedEventBus<TestEvents>("iso:v1");
    const v2 = createTypedEventBus<TestEvents>("iso:v2");
    const cb = vi.fn();
    const off = v1.on("ping", cb);

    v2.emit("ping", { n: 2 });
    expect(cb).not.toHaveBeenCalled();
    v1.emit("ping", { n: 3 });
    expect(cb).toHaveBeenCalledWith({ n: 3 });
    off();
  });

  it("once() fires a single time", () => {
    const bus = createTypedEventBus<TestEvents>("once:v1");
    const cb = vi.fn();
    bus.once("other", cb);
    bus.emit("other", "a");
    bus.emit("other", "b");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("a");
  });

  it("exposes the platform runtime events under runtime:v1", () => {
    const cb = vi.fn();
    const off = runtimeEvents.on("theme:set", cb);
    runtimeEvents.emit("theme:set", { theme: "dark" });
    off();
    expect(runtimeEvents.namespace).toBe("runtime:v1");
    expect(cb).toHaveBeenCalledWith({ theme: "dark" });
  });
});
