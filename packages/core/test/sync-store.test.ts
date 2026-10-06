import { describe, expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";
import { syncStore } from "../src/state/sync-store";

const makeAdapter = () => {
  const store = createStore<{ n: number }>()(() => ({ n: 0 }));
  return {
    store,
    adapter: {
      getState: () => store.getState(),
      setState: (s: { n: number }) => store.setState(s),
      subscribe: (l: (s: { n: number }) => void) => store.subscribe(l),
    },
  };
};

describe("syncStore", () => {
  it("keeps two stores with the same key in sync", () => {
    const a = makeAdapter();
    const b = makeAdapter();
    const stopA = syncStore(a.adapter, { key: "test:sync" });
    const stopB = syncStore(b.adapter, { key: "test:sync" });

    a.store.setState({ n: 5 });
    expect(b.store.getState().n).toBe(5);

    b.store.setState({ n: 7 });
    expect(a.store.getState().n).toBe(7);

    stopA();
    stopB();
  });

  it("stops syncing after cleanup", () => {
    const a = makeAdapter();
    const b = makeAdapter();
    const stopA = syncStore(a.adapter, { key: "test:cleanup" });
    const stopB = syncStore(b.adapter, { key: "test:cleanup" });
    stopB();

    a.store.setState({ n: 3 });
    expect(b.store.getState().n).toBe(0);
    stopA();
  });

  it("keeps broadcasting after a remote setState throws", () => {
    const a = makeAdapter();
    let fail = true;
    const throwing = {
      ...a.adapter,
      setState: (s: { n: number }) => {
        if (fail) {
          fail = false;
          throw new Error("boom");
        }
        a.store.setState(s);
      },
    };
    const b = makeAdapter();
    const stopA = syncStore(throwing, { key: "test:throw-sync" });
    const stopB = syncStore(b.adapter, { key: "test:throw-sync" });

    // EventBus catches (and logs) the listener error.
    vi.spyOn(console, "error").mockImplementation(() => {});
    b.store.setState({ n: 1 });
    // `a` must still broadcast its own local changes afterwards.
    a.store.setState({ n: 9 });
    expect(b.store.getState().n).toBe(9);

    stopA();
    stopB();
  });
});
