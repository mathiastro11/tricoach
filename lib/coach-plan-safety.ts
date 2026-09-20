import {
  attachWeekDates,
} from "@/lib/training";

import {
  validateCanonicalWorkoutSession,
} from "@/lib/canonical-workout-validation";

import {
  validatePlanAgainstResolvedAvailability,
} from "@/lib/training-availability";

import type {
  Athlete,
  TrainingAvailability,
  TrainingPlan,
  TrainingPlanDay,
} from "@/types/training";


type CoachCanonicalValidationResult = {
  valid: boolean;
  errors: string[];
};


function comparableSession(
  session: TrainingPlanDay
) {

  /*
    Only fields that define the actual training prescription
    belong here.

    Exclude:
    - date / week identity
    - session metadata
    - performanceTarget
    - coachAdjustment

    Benchmark prescription is allowed to change performanceTarget
    without turning an otherwise unchanged legacy session into a
    "modified" workout.
  */
  return {
    sport:
      session.sport,

    title:
      session.title,

    durationMinutes:
      session.durationMinutes,

    intensity:
      session.intensity,

    purpose:
      session.purpose,

    details:
      session.details ?? [],

    workoutStructure:
      session.workoutStructure,

    strengthStructure:
      session.strengthStructure,
  };
}


function prescriptionsAreIdentical(
  current:
    TrainingPlanDay,
  proposed:
    TrainingPlanDay
) {

  return (
    JSON.stringify(
      comparableSession(
        current
      )
    ) ===
    JSON.stringify(
      comparableSession(
        proposed
      )
    )
  );
}


function findExistingPrimary(
  proposed:
    TrainingPlanDay,
  current:
    TrainingPlan
) {

  if (
    proposed.sessionId
  ) {

    const byId =
      current.days.find(
        (session) =>
          session.sessionId ===
          proposed.sessionId
      );

    if (byId) {
      return byId;
    }
  }


  /*
    Primary plan slots are unique by weekday.
    This fallback supports legacy plans without sessionId.
  */
  return current.days.find(
    (session) =>
      session.day ===
      proposed.day
  );
}


function findExistingSecondary(
  proposed:
    TrainingPlanDay,
  current:
    TrainingPlan
) {

  const existing =
    current.additionalSessions ??
    [];


  if (
    proposed.sessionId
  ) {

    const byId =
      existing.find(
        (session) =>
          session.sessionId ===
          proposed.sessionId
      );

    if (byId) {
      return byId;
    }
  }


  /*
    Conservative legacy fallback.

    Never guess between multiple same-looking secondary
    sessions. A unique day + sport + title match is required.
  */
  const matches =
    existing.filter(
      (session) =>
        session.day ===
          proposed.day &&
        session.sport ===
          proposed.sport &&
        session.title ===
          proposed.title
    );


  return matches.length ===
    1
      ? matches[0]
      : undefined;
}


function legacyStructureMayPassThrough(
  existing:
    TrainingPlanDay | undefined,
  proposed:
    TrainingPlanDay
) {

  if (
    !existing
  ) {
    return false;
  }


  if (
    !prescriptionsAreIdentical(
      existing,
      proposed
    )
  ) {
    return false;
  }


  /*
    An unchanged stored workout may predate canonical
    migration.

    It is allowed to remain exactly as-is. This is NOT a
    blanket exemption for malformed AI output.
  */
  const legacyEndurance =
    (
      proposed.sport ===
        "Swim" ||
      proposed.sport ===
        "Bike" ||
      proposed.sport ===
        "Run"
    ) &&
    (
      !Array.isArray(
        proposed.workoutStructure
      ) ||
      proposed.workoutStructure.length ===
        0
    );


  const legacyStrength =
    proposed.sport ===
      "Strength" &&
    (
      proposed.strengthStructure ===
        null ||
      proposed.strengthStructure ===
        undefined
    );


  return (
    legacyEndurance ||
    legacyStrength
  );
}


export function validateCoachCanonicalChanges({
  currentPlan,
  proposedPlan,
}: {
  currentPlan:
    TrainingPlan | null | undefined;

  proposedPlan:
    TrainingPlan;
}): CoachCanonicalValidationResult {

  const errors:
    string[] = [];


  proposedPlan.days.forEach(
    (
      proposed,
      index
    ) => {

      const existing =
        currentPlan
          ? findExistingPrimary(
              proposed,
              currentPlan
            )
          : undefined;


      if (
        legacyStructureMayPassThrough(
          existing,
          proposed
        )
      ) {
        return;
      }


      const validation =
        validateCanonicalWorkoutSession(
          proposed,
          {
            index,
            secondary:
              false,
          }
        );


      if (
        !validation.valid
      ) {

        errors.push(
          ...validation.errors
            .map(
              (error) =>
                `Primary Coach change: ${error}`
            )
        );
      }
    }
  );


  (
    proposedPlan
      .additionalSessions ??
    []
  ).forEach(
    (
      proposed,
      index
    ) => {

      const existing =
        currentPlan
          ? findExistingSecondary(
              proposed,
              currentPlan
            )
          : undefined;


      if (
        legacyStructureMayPassThrough(
          existing,
          proposed
        )
      ) {
        return;
      }


      const validation =
        validateCanonicalWorkoutSession(
          proposed,
          {
            index,
            secondary:
              true,
          }
        );


      if (
        !validation.valid
      ) {

        errors.push(
          ...validation.errors
            .map(
              (error) =>
                `Secondary Coach change: ${error}`
            )
        );
      }
    }
  );


  return {
    valid:
      errors.length === 0,

    errors,
  };
}


export function prepareCoachPlanForReturn({
  proposedPlan,
  currentPlan,
}: {
  proposedPlan:
    TrainingPlan;

  currentPlan:
    TrainingPlan | null | undefined;
}) {

  /*
    Coach always edits the currently active calendar week.

    Never trust dates returned by the model. If the active
    plan has an authoritative weekStart, stamp every proposed
    primary/secondary session from that week identity.
  */
  if (
    currentPlan?.weekStart
  ) {

    return attachWeekDates({
      ...proposedPlan,

      weekStart:
        currentPlan.weekStart,

      weekNumber:
        currentPlan.weekNumber,

      days:
        proposedPlan.days.map(
          (session) => ({
            ...session,
            date:
              undefined,
          })
        ),

      additionalSessions:
        (
          proposedPlan
            .additionalSessions ??
          []
        ).map(
          (session) => ({
            ...session,
            date:
              undefined,
          })
        ),
    });
  }


  /*
    Legacy fallback:
    preserve dates from matching primary weekdays when an old
    plan has no weekStart.
  */
  const primaryDateByDay =
    new Map(
      (
        currentPlan?.days ??
        []
      )
        .filter(
          (session) =>
            !!session.date
        )
        .map(
          (session) => [
            session.day,
            session.date,
          ] as const
        )
    );


  return {
    ...proposedPlan,

    days:
      proposedPlan.days.map(
        (session) => ({
          ...session,

          date:
            session.date ??
            primaryDateByDay.get(
              session.day
            ),
        })
      ),

    additionalSessions:
      (
        proposedPlan
          .additionalSessions ??
        []
      ).map(
        (session) => ({
          ...session,

          date:
            session.date ??
            primaryDateByDay.get(
              session.day
            ),
        })
      ),
  };
}


export function validateCoachPlanAvailability({
  plan,
  athlete,
  availability,
}: {
  plan:
    TrainingPlan;

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
