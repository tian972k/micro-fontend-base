import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { logout } from "../../server/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  return logout(request);
};

// Logging out must be a POST (a GET could be triggered cross-site by an
// <img> tag); plain visits just go back to the login page.
export const loader = async () => {
  return redirect("/login");
};
