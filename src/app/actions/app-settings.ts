"use server";

import { updateAppTimeZone } from "@/server/application/app-settings";

export async function updateAppTimeZoneAction(input: { timeZone: unknown }) {
  return updateAppTimeZone(input);
}
