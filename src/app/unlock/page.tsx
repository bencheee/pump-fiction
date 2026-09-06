import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  accessCookieName,
  isAccessPasswordCorrect,
  issueAccessToken,
  readAccessPassword,
} from "@/server/access/access-gate";
import { Action, PageFrame, TextField } from "@/shared/ui";

export const dynamic = "force-dynamic";

async function unlock(formData: FormData) {
  "use server";

  const password = readAccessPassword();

  if (!password) {
    redirect("/unlock?state=unconfigured");
  }

  const submitted = formData.get("password");
  const correct =
    typeof submitted === "string" &&
    (await isAccessPasswordCorrect(submitted, password));

  if (!correct) {
    // Slow a guessing loop without delaying a correct entry.
    await new Promise((resolve) => setTimeout(resolve, 700));
    redirect("/unlock?state=rejected");
  }

  const token = await issueAccessToken(password);
  const secure = (await headers()).get("x-forwarded-proto") === "https";

  (await cookies()).set(accessCookieName, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: token.expiresAt,
  });

  redirect("/today");
}

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const configured = readAccessPassword() !== undefined;

  return (
    <main className="h-dvh overflow-y-auto bg-[var(--pf-bg-canvas)]">
      <PageFrame title="Locked">
        <p className="text-[var(--pf-text-2)]">
          Enter the password to reach your workouts.
        </p>
        <form action={unlock} className="flex flex-col gap-5">
          <TextField
            id="access-password"
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            disabled={!configured}
            error={
              state === "rejected" ? "That password is not correct." : undefined
            }
            hint={
              configured
                ? undefined
                : "This deployment has no access password configured."
            }
          />
          <Action type="submit" disabled={!configured}>
            Unlock
          </Action>
        </form>
      </PageFrame>
    </main>
  );
}
