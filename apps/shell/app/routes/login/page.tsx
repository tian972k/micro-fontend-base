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

  const user = await verifyCredentials(email, password);
  if (!user) {
    return json({ error: "Invalid email or password." }, { status: 401 });
  }

  return createUserSession(request, user, redirectTo);
};

export default function Login() {
  return <LoginForm />;
}
