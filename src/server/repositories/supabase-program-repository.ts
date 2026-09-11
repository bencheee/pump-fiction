import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import {
  ProgramRepositoryError,
  type ProgramRepository,
  type ProgramRepositoryErrorCode,
} from "@/features/programs/application/program-repository";
import type {
  Program,
  ProgramDefinition,
  ProgramSplit,
  Split,
  SplitDefinition,
} from "@/features/programs/domain/program";
import type { ServerDatabaseClient } from "@/server/database/client";
import type { Database, Tables } from "@/server/database/database.types";

type ProgramRow = Pick<Tables<"programs">, "id" | "name" | "next_split_id">;
type SplitRow = Pick<
  Tables<"splits">,
  "id" | "program_id" | "name" | "position"
>;
type ExerciseRow = Pick<
  Tables<"exercises">,
  "id" | "name" | "measurement_type"
>;

const programColumns = "id, name, next_split_id" as const;
const splitColumns = "id, program_id, name, position" as const;
const prescriptionColumns =
  "exercise_id, position, planned_sets, min_reps, max_reps" as const;

export class SupabaseProgramRepository implements ProgramRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async list(): Promise<readonly Program[]> {
    try {
      const { data, error } = await this.client
        .from("programs")
        .select(programColumns)
        .order("created_at", { ascending: true });
      if (error) throw mapPostgrestError(error);
      return await this.hydratePrograms(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async getProgram(id: string): Promise<Program | null> {
    try {
      const { data, error } = await this.client
        .from("programs")
        .select(programColumns)
        .eq("id", id)
        .maybeSingle();
      if (error) throw mapPostgrestError(error);
      if (data === null) return null;
      return (await this.hydratePrograms([data]))[0] ?? null;
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async getSplit(id: string): Promise<Split | null> {
    try {
      const { data, error } = await this.client
        .from("splits")
        .select(splitColumns)
        .eq("id", id)
        .maybeSingle();
      if (error) throw mapPostgrestError(error);
      if (data === null) return null;
      return await this.hydrateSplit(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async createProgram(definition: ProgramDefinition): Promise<Program> {
    return this.runProgramRpc("create_program", { p_name: definition.name });
  }

  async updateProgram(
    id: string,
    definition: ProgramDefinition,
  ): Promise<Program> {
    return this.runProgramRpc("update_program_name", {
      p_program_id: id,
      p_name: definition.name,
    });
  }

  async setCurrentProgram(id: string, nextSplitId: string): Promise<Program> {
    return this.runProgramRpc("set_current_program", {
      p_program_id: id,
      p_next_split_id: nextSplitId,
    });
  }

  async deleteProgram(id: string): Promise<void> {
    try {
      const { error } = await this.client.rpc("delete_program", {
        p_program_id: id,
      });
      if (error) throw mapPostgrestError(error);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async createSplit(
    programId: string,
    definition: SplitDefinition,
  ): Promise<Split> {
    return this.runSplitRpc("create_split_definition", {
      p_program_id: programId,
      p_name: definition.name,
      ...prescriptionArrays(definition),
    });
  }

  async updateSplit(id: string, definition: SplitDefinition): Promise<Split> {
    return this.runSplitRpc("update_split_definition", {
      p_split_id: id,
      p_name: definition.name,
      ...prescriptionArrays(definition),
    });
  }

  async reorderSplits(
    programId: string,
    splitIds: readonly string[],
  ): Promise<Program> {
    return this.runProgramRpc("reorder_program_splits", {
      p_program_id: programId,
      p_split_ids: [...splitIds],
    });
  }

  async reorderSplitExercises(
    splitId: string,
    exerciseIds: readonly string[],
  ): Promise<Split> {
    return this.runSplitRpc("reorder_split_exercises", {
      p_split_id: splitId,
      p_exercise_ids: [...exerciseIds],
    });
  }

  async setNextSplit(programId: string, splitId: string): Promise<Program> {
    return this.runProgramRpc("set_program_next_split", {
      p_program_id: programId,
      p_split_id: splitId,
    });
  }

  async deleteSplit(id: string): Promise<void> {
    try {
      const { error } = await this.client.rpc("delete_split", {
        p_split_id: id,
      });
      if (error) throw mapPostgrestError(error);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async advanceAfterProposedCompletion(
    programId: string,
    completedSplitId: string,
  ): Promise<string | null> {
    try {
      const { data, error } = await this.client.rpc(
        "advance_program_after_proposed_completion",
        {
          p_program_id: programId,
          p_completed_split_id: completedSplitId,
        },
      );
      if (error) throw mapPostgrestError(error);
      return data;
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  private async runProgramRpc<Name extends ProgramRpcName>(
    name: Name,
    args: ProgramRpcArgs<Name>,
  ): Promise<Program> {
    try {
      const { data, error } = await this.client.rpc(name, args);
      if (error) throw mapPostgrestError(error);
      return await this.requireProgram(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  private async runSplitRpc<Name extends SplitRpcName>(
    name: Name,
    args: SplitRpcArgs<Name>,
  ): Promise<Split> {
    try {
      const { data, error } = await this.client.rpc(name, args);
      if (error) throw mapPostgrestError(error);
      return await this.requireSplit(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  private async requireProgram(id: string): Promise<Program> {
    const program = await this.getProgram(id);
    if (program === null) throw new ProgramRepositoryError("not_found");
    return program;
  }

  private async requireSplit(id: string): Promise<Split> {
    const split = await this.getSplit(id);
    if (split === null) throw new ProgramRepositoryError("not_found");
    return split;
  }

  private async hydratePrograms(
    rows: readonly ProgramRow[],
  ): Promise<Program[]> {
    if (rows.length === 0) return [];
    const programIds = rows.map((row) => row.id);
    const [splitsResult, settingsResult] = await Promise.all([
      this.client
        .from("splits")
        .select(splitColumns)
        .in("program_id", programIds)
        .order("position", { ascending: true }),
      this.client
        .from("app_settings")
        .select("current_program_id")
        .eq("id", 1)
        .maybeSingle(),
    ]);
    if (splitsResult.error) throw mapPostgrestError(splitsResult.error);
    if (settingsResult.error) throw mapPostgrestError(settingsResult.error);
    const data = splitsResult.data;
    const currentProgramId = settingsResult.data?.current_program_id ?? null;

    const splitsByProgram = new Map<string, ProgramSplit[]>();
    for (const split of data) {
      const programSplits = splitsByProgram.get(split.program_id) ?? [];
      programSplits.push(toProgramSplit(split));
      splitsByProgram.set(split.program_id, programSplits);
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      isCurrent: row.id === currentProgramId,
      nextSplitId: row.next_split_id,
      splits: splitsByProgram.get(row.id) ?? [],
    }));
  }

  private async hydrateSplit(row: SplitRow): Promise<Split> {
    const { data: prescriptions, error } = await this.client
      .from("split_exercises")
      .select(prescriptionColumns)
      .eq("split_id", row.id)
      .order("position", { ascending: true });
    if (error) throw mapPostgrestError(error);

    const exerciseIds = prescriptions.map((item) => item.exercise_id);
    let exercises: ExerciseRow[] = [];
    if (exerciseIds.length > 0) {
      const result = await this.client
        .from("exercises")
        .select("id, name, measurement_type")
        .in("id", exerciseIds);
      if (result.error) throw mapPostgrestError(result.error);
      exercises = result.data;
    }

    const exerciseById = new Map(exercises.map((item) => [item.id, item]));
    return {
      ...toProgramSplit(row),
      exercises: prescriptions.map((prescription) => {
        const exercise = exerciseById.get(prescription.exercise_id);
        if (exercise === undefined) {
          throw new ProgramRepositoryError("constraint");
        }
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          measurementType: exercise.measurement_type,
          position: prescription.position,
          plannedSets: prescription.planned_sets,
          minReps: prescription.min_reps,
          maxReps: prescription.max_reps,
        };
      }),
    };
  }
}

type DatabaseFunctions = keyof Database["public"]["Functions"];
type ProgramRpcName = Extract<
  DatabaseFunctions,
  | "create_program"
  | "update_program_name"
  | "set_current_program"
  | "reorder_program_splits"
  | "set_program_next_split"
>;
type SplitRpcName = Extract<
  DatabaseFunctions,
  | "create_split_definition"
  | "update_split_definition"
  | "reorder_split_exercises"
>;
type ProgramRpcArgs<Name extends ProgramRpcName> =
  Database["public"]["Functions"][Name]["Args"];
type SplitRpcArgs<Name extends SplitRpcName> =
  Database["public"]["Functions"][Name]["Args"];

function prescriptionArrays(definition: SplitDefinition) {
  return {
    p_exercise_ids: definition.exercises.map((item) => item.exerciseId),
    p_planned_sets: definition.exercises.map((item) => item.plannedSets),
    p_min_reps: definition.exercises.map((item) => item.minReps),
    p_max_reps: definition.exercises.map((item) => item.maxReps),
  };
}

function toProgramSplit(row: SplitRow): ProgramSplit {
  return {
    id: row.id,
    programId: row.program_id,
    name: row.name,
    position: row.position,
  };
}

function mapPostgrestError(error: PostgrestError): ProgramRepositoryError {
  return new ProgramRepositoryError(mapPostgrestCode(error), {
    cause: error,
  });
}

function mapPostgrestCode(error: PostgrestError): ProgramRepositoryErrorCode {
  const { code } = error;
  if (
    code === "23505" &&
    `${error.message} ${error.details}`.includes(
      "splits_name_per_program_unique",
    )
  ) {
    return "duplicate_name";
  }
  if (code === "PF101" || code === "PGRST116") return "not_found";
  if (code === "PF102") return "invalid_next_split";
  if (code === "PF103") return "unknown_exercise";
  if (code === "PF104") return "last_split";
  if (code === "PF105") return "invalid_order";
  if (code === "PF106" || code.startsWith("22") || code.startsWith("23")) {
    return "constraint";
  }
  return "unexpected";
}

function normalizeRepositoryError(error: unknown): ProgramRepositoryError {
  if (error instanceof ProgramRepositoryError) return error;
  return new ProgramRepositoryError("unavailable", { cause: error });
}
