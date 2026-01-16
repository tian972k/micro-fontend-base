import { Button } from "@repo/ui";
import { globalEventBus } from "@repo/core";
import { useEffect, useState } from "react";

import type { MicroAppProps } from "@repo/core";

export function MfeComponent(props: MicroAppProps) {
  const [count, setCount] = useState(0);
  const [shellCount, setShellCount] = useState(0);

  useEffect(() => {
    const handleShellUpdate = (data: number) => {
      console.log("[App B] Received from Shell:", data);
      setShellCount(data);
    };

    globalEventBus.on("SHELL_COUNTER_UPDATE", handleShellUpdate);
    return () => {
      globalEventBus.off("SHELL_COUNTER_UPDATE", handleShellUpdate);
    };
  }, []);

  return (
    <div className="p-6 border rounded-lg bg-secondary text-secondary-foreground shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Micro App B (Next.js Hybrid)</h2>
      <p className="mb-4 text-muted-foreground">
        This component is part of a Next.js app, but bundled via Vite for the
        Shell!
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Button variant="destructive" onClick={() => setCount((c) => c + 1)}>
            App B Count: {count}
          </Button>
        </div>

        <div className="p-4 bg-background/50 rounded-md border text-sm">
          <strong>Shared Event Bus:</strong>
          <br />
          Shell Counter Subscription:{" "}
          <span className="text-primary font-bold text-lg">{shellCount}</span>
        </div>
      </div>
    </div>
  );
}
