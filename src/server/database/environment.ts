import "server-only";

export type SupabaseServerEnvironment = Readonly<{
  url: string;
  serviceRoleKey: string;
}>;

export function readSupabaseServerEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): SupabaseServerEnvironment {
  const url = environment.SUPABASE_URL?.trim();
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !isHttpUrl(url)) {
    throw new Error("SUPABASE_URL must be a valid HTTP or HTTPS URL.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
  }

  return { url, serviceRoleKey };
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
