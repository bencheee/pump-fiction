import { createClient } from "@supabase/supabase-js";

/*
 * The local database is shared with real use, so a scenario that points the
 * current program at its own fixture puts the one it found back afterwards.
 */
function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function rememberCurrentProgram(): Promise<string | null> {
  const { data, error } = await adminClient()
    .from("app_settings")
    .select("current_program_id")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return (data?.current_program_id as string | null) ?? null;
}

export async function restoreCurrentProgram(
  programId: string | null,
): Promise<void> {
  const { error } = await adminClient()
    .from("app_settings")
    .update({ current_program_id: programId })
    .eq("id", 1);
  if (error) throw error;
}
