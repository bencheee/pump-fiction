import { applyActiveWorkoutCommand } from "@/server/application/active-workout";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json(
      {
        kind: "rejected",
        code: "validation",
        message: "Provide a valid JSON active-workout command.",
      },
      { status: 400 },
    );
  }

  const result = await applyActiveWorkoutCommand(input);

  return Response.json(result, {
    status: responseStatus(
      result.kind,
      result.kind === "rejected" ? result.code : null,
    ),
    headers: { "Cache-Control": "no-store" },
  });
}

function responseStatus(
  kind: "acknowledged" | "conflict" | "rejected" | "retry",
  rejectedCode: "validation" | "not_found" | null,
): number {
  if (kind === "acknowledged") {
    return 200;
  }

  if (kind === "conflict") {
    return 409;
  }

  if (kind === "retry") {
    return 503;
  }

  return rejectedCode === "not_found" ? 404 : 400;
}
