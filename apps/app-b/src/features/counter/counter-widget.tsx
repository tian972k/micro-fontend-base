import { Button } from "@repo/ui";
import { syncStore, type CounterState } from "@repo/core";
import { EVENT_KEYS } from "@repo/config";
import { useEffect, useState } from "react";

export function CounterWidget() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const signup = syncStore<CounterState>(
      {
        getState: (): CounterState => ({ count }),
        setState: (state: CounterState) => {
          setCount(state.count);
        },
        subscribe: () => {
          return () => {};
        },
      },
      { key: EVENT_KEYS.APP_COUNTER },
    );

    return () => {
      signup();
    };
  }, [count]);

  return (
    <div className="p-8 space-y-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-primary">
              App B: Next.js Module
            </h3>
            <p className="text-sm text-muted-foreground">
              Framework: React 18 / Next.js
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="M7 21h10" />
              <path d="M12 3v18" />
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8 bg-background/50 rounded-lg border border-border/50 mb-6">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Shared Counter Value
          </span>
          <span className="text-6xl font-black text-primary tabular-nums">
            {count}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full h-12 text-lg hover:bg-primary/5"
            onClick={() => setCount((c) => c - 1)}
          >
            Decrement
          </Button>
          <Button
            className="w-full h-12 text-lg shadow-md"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment
          </Button>
        </div>
      </div>
    </div>
  );
}
