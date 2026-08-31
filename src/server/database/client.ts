import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { readSupabaseServerEnvironment } from "./environment";

export type ServerDatabaseClient = SupabaseClient<Database>;

export function createServerDatabaseClient(): ServerDatabaseClient {
  const environment = readSupabaseServerEnvironment();

  return createClient<Database>(environment.url, environment.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: { "X-Client-Info": "pump-fiction-server" },
    },
  });
}
