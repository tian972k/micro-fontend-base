import React from "react";
import { counterStore, incrementCounter } from "@repo/core/react";

// NOTE: For shared counter, use counterStore directly from @repo/core
// counterStore already has EventBus sync built-in
// This file provides React integration with the framework-agnostic counterStore

/**
 * React hook to get counter value from shared counterStore
 * This provides React integration with the framework-agnostic counterStore
 */
export function useSharedCounter() {
  const [count, setCount] = React.useState(counterStore.getState().count);

  React.useEffect(() => {
    // Subscribe to counterStore changes
    const unsubscribe = counterStore.subscribe((state) => {
      setCount(state.count);
    });
    return unsubscribe;
  }, []);

  return {
    globalCount: count,
    increment: incrementCounter,
  };
}

// Legacy alias for backward compatibility
export const useShellStore = useSharedCounter;
