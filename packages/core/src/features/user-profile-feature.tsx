import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { useUserStore, syncStore, type CounterState, EVENT_KEYS } from "../index";

/**
 * Shared User Profile Feature component
 * Demonstrates cross-framework state sync with counter
 * Usage: Import from @repo/core in any React-based MFE
 */
export function UserProfileFeature() {
  const [count, setCount] = useState(0);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const cleanup = syncStore(
      {
        getState: (): CounterState => ({ count }),
        setState: (newState: CounterState) => {
          setCount(newState.count);
        },
        subscribe: () => {
          return () => {};
        },
      },
      { key: EVENT_KEYS.APP_COUNTER },
    );

    return cleanup;
  }, [count]);

  return (
    <div className="p-4 bg-background">
      <Card className="border-primary/20 shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/[0.03] space-y-1">
          <CardTitle className="text-xl">User Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Shared Component from @repo/core</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/20 border border-accent/30 text-center space-y-3">
            <p className="text-sm font-medium text-accent-foreground">
              Shared State Sync
            </p>
            <div className="text-4xl font-bold tracking-tighter text-primary">
              {count}
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCount((c) => c - 1)}
              >
                -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCount((c) => c + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
