import type {
  GoalChangeDecision,
} from "@/lib/goal-change";

import type {
  TargetRace,
  TrainingPlan,
  WorkoutFeedback,
} from "@/types/training";


type GoalChangeWeekContext = {
  decision:
    GoalChangeDecision;

  previousRace?:
    TargetRace;

  nextRace:
    TargetRace;

  plan:
    TrainingPlan;

  feedback:
    WorkoutFeedback[];

  todayIso:
    string;
};


export type GoalChangeWeekResult = {
  shouldReview:
    boolean;

  reason:
    string;

  protectedSessionIds:
    string[];

  protectedDates:
    string[];

  preservedManualSessions:
    number;
};


export function analyzeCurrentWeekForGoalChange({
  decision,
  plan,
  feedback,
  todayIso,
}: GoalChangeWeekContext):
  GoalChangeWeekResult {

  /*
    Only meaningful goal changes should
    trigger current-week review.
  */
  if (
    decision.action !==
      "ADAPT_CURRENT_AND_FUTURE" &&
    decision.action !==
      "REBUILD_ROADMAP"
  ) {
    return {
      shouldReview: false,

      reason:
        "Current week does not require review.",

      protectedSessionIds:
        [],

      protectedDates:
        [],

      preservedManualSessions:
        (
          plan.additionalSessions ??
          []
        ).filter(
          (session) =>
            session.sessionSource !== "coach"
        ).length,
    };
  }


  const completedFeedback =
    feedback.filter(
      (entry) =>
        entry.status ===
          "Completed" ||
        entry.status ===
          "Modified"
    );


  const protectedSessionIds =
    completedFeedback
      .map(
        (entry) =>
          entry.sessionId
      )
      .filter(
        (
          id
        ): id is string =>
          Boolean(id)
      );


  const protectedDates =
    completedFeedback
      .map(
        (entry) =>
          entry.date
      )
      .filter(
        (
          date
        ): date is string =>
          Boolean(date)
      );


  /*
    Anything scheduled before today is also
    protected even if feedback is incomplete.
  */
  for (
    const day
    of plan.days
  ) {
    if (
      day.date &&
      day.date < todayIso
    ) {
      protectedDates.push(
        day.date
      );

      if (day.sessionId) {
        protectedSessionIds.push(
          day.sessionId
        );
      }
    }
  }


  return {
    shouldReview: true,

    reason:
      "The target race changed enough that the remaining planned sessions may benefit from race-specific adjustment.",

    protectedSessionIds:
      Array.from(
        new Set(
          protectedSessionIds
        )
      ),

    protectedDates:
      Array.from(
        new Set(
          protectedDates
        )
      ),

    preservedManualSessions:
      (
        plan.additionalSessions ??
        []
      ).filter(
        (session) =>
          session.sessionSource !== "coach"
      ).length,
  };
}
