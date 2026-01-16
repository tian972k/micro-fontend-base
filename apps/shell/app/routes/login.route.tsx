import { MetaFunction, ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@repo/ui";
import { userActions } from "@repo/core";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Login - MFE Platform" }];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Determine the redirect URL, default to '/dashboard'
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";

  // Set a cookie (simple mock auth)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": "auth_token=valid_user_123; Path=/; HttpOnly; SameSite=Lax",
    },
  });
};

export default function Login() {
  // In a real app, we might hydrate the store from server state or API after login
  // For this demo, we'll simulate setting the user on the client side after a "successful" form submission
  // However, since Action creates a redirect, the store would be reset on page load if simulated here without persistence.
  // So usually we'd initialize the store in the root loader or a layout effect.
  // BUT, for the explicit "login flows" request: we will rely on the dashboard layout to "check auth" and "init store" if needed,
  // or just hardcode a dispatch here for demonstration if it were a SPA navigation.
  // Since Remix does full page reloads on actions by default, the client store clears.
  // Better strategy: The DashboardLayout should initialize the store if the cookie exists.

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-4">
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password</label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          Use any credentials to login
        </CardFooter>
      </Card>
    </div>
  );
}
