import {
  attachWeekDates,
  getISOWeekNumber,
  toISODate,
} from "@/lib/training";

import {
  validateCanonicalGeneratedPlan,
} from "@/lib/canonical-workout-validation";

import {
  validatePlanAgainstResolvedAvailability,
} from "@/lib/training-availability";

import type {
  Athlete,
  TrainingAvailability,
  TrainingPlan,
} from "@/types/training";


/*
  ========================================================
  NEXT WEEK — AUTHORITATIVE SERVER SAFETY
  ========================================================

  A generated upcoming week must receive its calendar
  identity on the server before Calendar availability can
  be treated as a real hard constraint.

  Never trust dates produced by the model.
*/
export function prepareGeneratedNextWeekPlan({
  plan,
  weekStart,
}: {
  plan: TrainingPlan;
  weekStart: Date;
}) {

  const datedPlan =
    attachWeekDates({
      ...plan,

      weekStart:
        toISODate(
          weekStart
        ),

      weekNumber:
        getISOWeekNumber(
          weekStart
        ),

      days:
        plan.days.map(
          (day) => ({
            ...day,
            date:
              undefined,
          })
        ),

      additionalSessions:
        (
          plan.additionalSessions ??
          []
        ).map(
          (session) => ({
            ...session,
            date:
              undefined,
          })
        ),
    });


  const canonical =
    validateCanonicalGeneratedPlan(
      datedPlan
    );


  return {
    plan:
      datedPlan,

    canonical,
  };
}


/*
  Run AFTER deterministic race-week finalization.

  Race Day and post-race Recovery are server-owned states
  with duration 0. The availability engine therefore checks
  the actual structured training that remains around them,
  while Calendar overrides remain authoritative.
*/
export function validateFinalNextWeekAvailability({
  plan,
  athlete,
  availability,
}: {
  plan: TrainingPlan;

  athlete:
    | Pick<
        Athlete,
        | "weeklyAvailability"
        | "availableDays"
      >
    | null
    | undefined;

  availability:
    TrainingAvailability[];
}) {

  return validatePlanAgainstResolvedAvailability({
    plan,
    athlete,
    availability,
  });
}
