import { ActionFunctionArgs, redirect } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  // In a real app, you would destroy the session here.
  // e.g., return redirect("/login", { headers: { "Set-Cookie": await destroySession(session) } });

  // For this demo, we just redirect.
  return redirect("/login");
};

export const loader = async () => {
  return redirect("/login");
};
