import { MetaFunction, ActionFunctionArgs, redirect } from "@remix-run/node";
import { LoginForm } from "@/features/auth/components/login-form";

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
  return <LoginForm />;
}
