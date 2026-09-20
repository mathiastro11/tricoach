import type {
  TrainingPlanDay,
  WorkoutFeedback,
} from "@/types/training";


export function workoutMatchesFeedback(
  workout: TrainingPlanDay,
  feedback: WorkoutFeedback
) {
  /*
    Modern records:
    sessionId is the canonical planned ↔ completed link.
  */
  if (
    workout.sessionId &&
    feedback.sessionId
  ) {
    return (
      workout.sessionId ===
      feedback.sessionId
    );
  }


  /*
    Legacy feedback may predate session IDs while the restored
    plan has since been normalized with ensurePlanSessionIds().

    Do not reject that feedback merely because only the planned
    workout now has an ID.

    Use a deliberately strict fallback so multiple sessions on
    the same date cannot accidentally complete each other.
  */
  if (
    workout.date &&
    feedback.date
  ) {
    return (
      workout.date === feedback.date &&
      workout.sport === feedback.sport &&
      workout.title === feedback.title
    );
  }


  /*
    Oldest fallback for historical records without dates.
    Still require discipline + title in addition to weekday.
  */
  return (
    feedback.day.slice(0, 3) ===
      workout.day.slice(0, 3) &&
    workout.sport ===
      feedback.sport &&
    workout.title ===
      feedback.title
  );
}


export function findWorkoutFeedback(
  workout: TrainingPlanDay,
  history: WorkoutFeedback[]
) {
  return history
    .slice()
    .reverse()
    .find(
      (feedback) =>
        workoutMatchesFeedback(
          workout,
          feedback
        )
    );
}
