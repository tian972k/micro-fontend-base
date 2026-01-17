import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");

  if (cookieHeader && cookieHeader.includes("auth_token=")) {
    return redirect("/dashboard");
  }

  return redirect("/login");
};

export default function Index() {
  return null;
}
