import { NextResponse, type NextRequest } from "next/server";

import {
  accessCookieName,
  isAccessGateEnforced,
  isAccessTokenValid,
  readAccessPassword,
} from "@/server/access/access-gate";

const unlockPath = "/unlock";

// The active-workout outbox posts here. A locked-out delivery answers in the
// transport's own retry shape, so the command stays pending and replays after
// the next unlock instead of being read as a permanent rejection.
const commandsPath = "/api/active-workout/commands";

const lockedCommandResult = {
  kind: "retry",
  code: "persistence",
  message: "We couldn't save the workout change. Try again.",
} as const;

export async function middleware(request: NextRequest) {
  if (!isAccessGateEnforced()) {
    return NextResponse.next();
  }

  const password = readAccessPassword();

  if (!password) {
    return deny(request, "unconfigured");
  }

  const { pathname } = request.nextUrl;

  if (pathname === unlockPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(accessCookieName)?.value;

  if (token && (await isAccessTokenValid(token, password))) {
    return NextResponse.next();
  }

  return deny(request, "locked");
}

function deny(request: NextRequest, reason: "locked" | "unconfigured") {
  if (request.nextUrl.pathname === commandsPath) {
    return NextResponse.json(lockedCommandResult, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (reason === "unconfigured") {
    return new NextResponse(
      "This deployment has no access password configured.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const destination = request.nextUrl.clone();
  destination.pathname = unlockPath;
  destination.search = "";

  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};
