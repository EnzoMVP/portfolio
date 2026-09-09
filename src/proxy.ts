import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
  // Skip Sanity Studio, API routes, Next internals, and static files.
  matcher: ["/((?!api|studio|_next|.*\\..*).*)"],
};
