import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { type MicroAppProps, useUserStore } from "@repo/core";

function App(props: MicroAppProps) {
  const [count, setCount] = useState(0);
  const user = useUserStore((state) => state.user);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Micro App A (React + Vite)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Current User from Store:{" "}
            <span className="font-bold text-primary">
              {user ? user.name : "Not Logged In"}
            </span>
          </p>
          {user && (
            <div className="flex items-center gap-2 p-2 border rounded mb-4 bg-muted/50">
              <img src={user.avatarUrl} className="w-8 h-8 rounded-full" />
              <span>{user.email}</span>
            </div>
          )}

          <h1 className="text-2xl font-bold my-4">Vite + React</h1>
          <div className="card">
            <Button onClick={() => setCount((count) => count + 1)}>
              Count is {count}
            </Button>
            <p className="mt-4 text-muted-foreground">
              Try clicking the button from shared UI!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
