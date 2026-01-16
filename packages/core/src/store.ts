export type Listener<T> = (state: T) => void;

export interface Store<T> {
  getState: () => T;
  setState: (newState: T | ((prevState: T) => T)) => void;
  subscribe: (listener: Listener<T>) => () => void;
}

export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  return {
    getState: () => state,
    setState: (newState) => {
      state =
        typeof newState === "function"
          ? (newState as (prevState: T) => T)(state)
          : newState;
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
