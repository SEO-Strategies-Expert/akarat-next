import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const handleI18nRouting = createIntlMiddleware({
  locales: ["ar", "en", "ru"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
});

export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  // Set x-pathname header so root layout can detect locale
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: ["/", "/(en|ru)/:path*"],
};
