import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  createUserSession,
  getUser,
  safeRedirect,
  verifyCredentials,
} from "../../server/auth.server";
import { getClientIp, loginRateLimiter } from "../../server/rate-limit.server";
import { mergeMeta } from "@/lib/meta";

export const meta = mergeMeta(() => {
  return [{ title: "Login - MFE Platform" }];
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (await getUser(request)) {
    const url = new URL(request.url);
    return redirect(safeRedirect(url.searchParams.get("redirectTo")));
  }
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const redirectTo = safeRedirect(
    form.get("redirectTo") ?? url.searchParams.get("redirectTo"),
  );

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Email and password are required." }, { status: 400 });
  }

  // Only failed attempts count: the window is cleared on success.
  const clientKey = getClientIp(request);
  const attempt = loginRateLimiter.consume(clientKey);
  if (!attempt.allowed) {
    return json(
      { error: "Too many sign-in attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(attempt.retryAfterSeconds) },
      },
    );
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return json({ error: "Invalid email or password." }, { status: 401 });
  }
  loginRateLimiter.reset(clientKey);

  return createUserSession(request, user, redirectTo);
};

export default function Login() {
  return <LoginForm />;
}
