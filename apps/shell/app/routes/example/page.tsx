import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";
import { useEffect, useRef } from "react";

// Server-side Loader: Fetches data before rendering
export async function loader({ request }: LoaderFunctionArgs) {
  console.log("[Server] Loading example route data...");

  // Simulate DB delay
  await new Promise((r) => setTimeout(r, 500));

  return json({
    message: "Welcome to the Custom Routes Example!",
    timestamp: new Date().toISOString(),
    serverEnv: process.env.NODE_ENV,
  });
}

// Define specific response types
type ActionData =
  | { success: true; message: string; time: string }
  | { success: false; message: string; time?: never };

// Server-side Action: Handles form submissions
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const message = formData.get("message");

  console.log(`[Server] Action received: ${intent}`);
  console.log(`[Server] Action received message: ${message}`);

  if (intent === "ping") {
    return json<ActionData>({
      success: true,
      message: "Pong! Server received your ping.",
      time: new Date().toLocaleTimeString(),
    });
  }

  return json<ActionData>(
    { success: false, message: "Unknown action" },
    { status: 400 },
  );
}

export default function ExampleRoute() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isSubmitting) {
      formRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Custom Route Demo</h1>

      <div className="grid gap-6">
        {/* Loader Data Display */}
        <Card>
          <CardHeader>
            <CardTitle>Server Loader Data</CardTitle>
            <CardDescription>
              Data fetched server-side on initial load.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Message:</span>
              <span>{data.message}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Server Time:</span>
              <span className="font-mono text-sm">{data.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Environment:</span>
              <span className="badge">{data.serverEnv}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Form */}
        <Card>
          <CardHeader>
            <CardTitle>Server Action Interaction</CardTitle>
            <CardDescription>
              Submit data to the server without JavaScript required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" ref={formRef} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="input-ping"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send a message
                </label>
                <Input
                  id="input-ping"
                  name="message"
                  placeholder="Type something (optional)..."
                />
              </div>

              {actionData?.message && (
                <div
                  className={`p-3 rounded-md text-sm ${actionData.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {actionData.message}{" "}
                  {actionData.success && `at ${actionData.time}`}
                </div>
              )}

              <Button
                type="submit"
                name="intent"
                value="ping"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Ping Server"}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
