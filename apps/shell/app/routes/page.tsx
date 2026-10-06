import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "../server/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return redirect((await getUser(request)) ? "/dashboard" : "/login");
};

export default function Index() {
  return null;
}
