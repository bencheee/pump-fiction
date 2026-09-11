import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import {
  ExerciseRepositoryError,
  type ExerciseRepository,
  type ExerciseRepositoryErrorCode,
} from "@/features/exercises/application/exercise-repository";
import {
  exerciseLoadModes,
  type Exercise,
  type ExerciseDefinition,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import type { ServerDatabaseClient } from "@/server/database/client";
import type { Tables } from "@/server/database/database.types";

type ExerciseRow = Pick<
  Tables<"exercises">,
  "id" | "name" | "base_type" | "persistent_note"
>;

type ExerciseRowWithMeasurement = ExerciseRow & {
  measurement_type: Exercise["measurementType"];
};

const exerciseColumns =
  "id, name, base_type, measurement_type, persistent_note" as const;

export class SupabaseExerciseRepository implements ExerciseRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async list(): Promise<readonly Exercise[]> {
    try {
      const { data, error } = await this.client
        .from("exercises")
        .select(exerciseColumns)
        .order("name", { ascending: true });

      if (error) throw mapPostgrestError(error);

      return await this.hydrate(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async getById(id: string): Promise<Exercise | null> {
    try {
      const { data, error } = await this.client
        .from("exercises")
        .select(exerciseColumns)
        .eq("id", id)
        .maybeSingle();

      if (error) throw mapPostgrestError(error);
      if (data === null) return null;

      return (await this.hydrate([data]))[0] ?? null;
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async create(definition: ExerciseDefinition): Promise<Exercise> {
    try {
      const { data, error } = await this.client.rpc(
        "create_exercise_definition",
        {
          p_name: definition.name,
          p_base_type: definition.baseType,
          p_measurement_type: definition.measurementType ?? "reps",
          p_persistent_note: definition.persistentNote,
          p_load_modes: [...definition.allowedLoadModes],
        },
      );

      if (error) throw mapPostgrestError(error);
      return await this.requireById(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async update(id: string, definition: ExerciseDefinition): Promise<Exercise> {
    try {
      const { data, error } = await this.client.rpc(
        "update_exercise_definition",
        {
          p_exercise_id: id,
          p_name: definition.name,
          p_base_type: definition.baseType,
          p_measurement_type: definition.measurementType ?? "reps",
          p_persistent_note: definition.persistentNote,
          p_load_modes: [...definition.allowedLoadModes],
        },
      );

      if (error) throw mapPostgrestError(error);
      return await this.requireById(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client.rpc("delete_exercise", {
        p_exercise_id: id,
      });

      if (error) throw mapPostgrestError(error);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  private async requireById(id: string): Promise<Exercise> {
    const exercise = await this.getById(id);
    if (exercise === null) throw new ExerciseRepositoryError("not_found");
    return exercise;
  }

  private async hydrate(
    rows: readonly ExerciseRowWithMeasurement[],
  ): Promise<Exercise[]> {
    if (rows.length === 0) return [];

    const ids = rows.map((row) => row.id);
    const [modesResult, usageResult] = await Promise.all([
      this.client
        .from("exercise_load_modes")
        .select("exercise_id, load_mode")
        .in("exercise_id", ids),
      this.client
        .from("split_exercises")
        .select("exercise_id")
        .in("exercise_id", ids),
    ]);

    if (modesResult.error) throw mapPostgrestError(modesResult.error);
    if (usageResult.error) throw mapPostgrestError(usageResult.error);

    const modesByExercise = new Map<string, ExerciseLoadMode[]>();
    for (const mode of modesResult.data) {
      const modes = modesByExercise.get(mode.exercise_id) ?? [];
      modes.push(mode.load_mode);
      modesByExercise.set(mode.exercise_id, modes);
    }

    const usageByExercise = new Map<string, number>();
    for (const usage of usageResult.data) {
      usageByExercise.set(
        usage.exercise_id,
        (usageByExercise.get(usage.exercise_id) ?? 0) + 1,
      );
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      baseType: row.base_type,
      measurementType: row.measurement_type,
      allowedLoadModes: (modesByExercise.get(row.id) ?? []).sort(
        (left, right) =>
          exerciseLoadModes.indexOf(left) - exerciseLoadModes.indexOf(right),
      ),
      persistentNote: row.persistent_note,
      splitUsageCount: usageByExercise.get(row.id) ?? 0,
    }));
  }
}

function mapPostgrestError(error: PostgrestError): ExerciseRepositoryError {
  return new ExerciseRepositoryError(mapPostgrestCode(error.code), {
    cause: error,
  });
}

function mapPostgrestCode(code: string): ExerciseRepositoryErrorCode {
  if (code === "23505") return "duplicate_name";
  if (code === "PF004" || code === "PF107" || code === "PGRST116")
    return "not_found";
  if (code === "PF003" || code.startsWith("22") || code.startsWith("23")) {
    return "constraint";
  }
  return "unexpected";
}

function normalizeRepositoryError(error: unknown): ExerciseRepositoryError {
  if (error instanceof ExerciseRepositoryError) return error;
  return new ExerciseRepositoryError("unavailable", { cause: error });
}
