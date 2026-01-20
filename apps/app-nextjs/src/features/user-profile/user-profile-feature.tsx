import { Button } from "@repo/ui";
import {
  useCounterStore,
  useUserStore,
  incrementCounter,
  decrementCounter,
} from "@repo/core/react";

/**
 * Next.js User Profile Feature Component
 * Demonstrates cross-framework state sync with counter
 */
export function UserProfileFeature() {
  // Use the shared counter store with proper React hook
  const count = useCounterStore((state) => state.count);
  const user = useUserStore((state) => state.user);

  return (
    <div className="p-4 bg-background">
      <div className="border border-primary/20 shadow-sm overflow-hidden rounded-lg bg-card">
        <div className="bg-primary/[0.03] p-4 space-y-1">
          <h2 className="text-xl font-semibold">User Profile</h2>
          <p className="text-sm text-muted-foreground">
            Shared Component from Next.js
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.name || "Guest"}</h3>
              <p className="text-sm text-muted-foreground">
                {user?.email || "No email"}
              </p>
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
                onClick={() => decrementCounter()}
              >
                -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => incrementCounter()}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
