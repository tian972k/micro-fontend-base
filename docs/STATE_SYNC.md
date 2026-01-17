# State Synchronization for Micro-Frontends

This guide explains how to synchronize state between different micro-frontend applications using the `@repo/core` utility `syncStore`.

## Overview

In a micro-frontend architecture, different apps might be built with different frameworks (React, Vue, Svelte) and use different state management libraries (Zustand, Redux, Pinia). `syncStore` provides a unified way to keep these stores in sync using a global `EventBus`.

## How it works

`syncStore` uses an **Adapter Pattern**. You provide an adapter that maps your specific store's API to a standard interface:

```typescript
interface SyncStoreAdapter<T> {
  getState: () => T;
  setState: (state: T) => void;
  subscribe: (listener: (state: T) => void) => () => void;
}
```

## Usage Examples

### Zustand (React)

```typescript
import { create } from "zustand";
import { syncStore } from "@repo/core";

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  setCount: (count) => set({ count }),
}));

// Synchronize
syncStore(
  {
    getState: () => useCounterStore.getState(),
    setState: (state) => useCounterStore.setState(state),
    subscribe: (listener) => useCounterStore.subscribe(listener),
  },
  { key: "SHARED_COUNTER" },
);
```

### Redux

```typescript
import { createStore } from "redux";
import { syncStore } from "@repo/core";

const store = createStore(reducer);

syncStore(
  {
    getState: () => store.getState(),
    setState: (state) => store.dispatch({ type: "SYNC_STATE", payload: state }),
    subscribe: (listener) => store.subscribe(() => listener(store.getState())),
  },
  { key: "SHARED_COUNTER" },
);
```

### Vue (Reactive State)

```typescript
import { reactive, watch } from "vue";
import { syncStore } from "@repo/core";

const state = reactive({ count: 0 });

syncStore(
  {
    getState: () => ({ ...state }),
    setState: (newState) => Object.assign(state, newState),
    subscribe: (listener) => {
      const unwatch = watch(state, (val) => listener({ ...val }));
      return () => unwatch();
    },
  },
  { key: "SHARED_COUNTER" },
);
```

### Svelte (Store)

```typescript
import { writable } from "svelte/store";
import { syncStore } from "@repo/core";

const count = writable(0);

syncStore(
  {
    getState: () => {
      let val;
      count.subscribe((v) => (val = v))();
      return val;
    },
    setState: (val) => count.set(val),
    subscribe: (listener) => count.subscribe(listener),
  },
  { key: "SHARED_COUNTER" },
);
```

## API Reference

### `syncStore<T>(adapter, options)`

- `adapter`: An object implementing `SyncStoreAdapter<T>`.
- `options`:
  - `key`: (Required) A unique string to identify the state on the EventBus.
  - `readOnly`: (Optional) If `true`, the store will only receive updates but won't broadcast its own changes.
