import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const handleI18nRouting = createIntlMiddleware({
  locales: ["ar", "en", "ru"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
});

export default function middleware(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  // Cover all paths except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
