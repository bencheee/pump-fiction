SET local check_function_bodies = off;

ALTER TABLE "public"."active_workout_commands"
  DROP CONSTRAINT "active_workout_commands_workout_id_fkey";

ALTER TYPE "public"."active_workout_command_operation" ADD VALUE 'update_set' AFTER 'resume_timer';

