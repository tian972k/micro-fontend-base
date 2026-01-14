import { Button } from "@repo/ui";
import { useState } from "react";

import type { MicroAppProps } from "@repo/core";

export function App(props: MicroAppProps) {
    const [count, setCount] = useState(0);

    return (
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-primary">Micro App A</h2>
            <p className="text-muted-foreground mb-4">
                This is a standalone Vite React application mounted inside the Shell.
            </p>

            <div className="flex gap-4 items-center">
                <Button onClick={() => setCount((c) => c + 1)}>
                    Count is {count}
                </Button>
                <div className="text-sm text-muted-foreground">
                    Try clicking the button from shared UI!
                </div>
            </div>
        </div>
    );
}
