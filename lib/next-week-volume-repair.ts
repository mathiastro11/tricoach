import type {
  TrainingPlan,
} from "@/types/training";


export type NextWeekVolumeRepair = {
  plan: TrainingPlan;
  fullyApplied: boolean;
  appliedRepairs: {
    day: string;
    sport: string;
    minutes: number;
  }[];
};


export function repairNextWeekVolumeShortfall({
  plan,
  missingMinutes,
  longestSessionMinutes,
}: {
  plan: TrainingPlan;
  missingMinutes: number;
  longestSessionMinutes?:
    number | null;
}): NextWeekVolumeRepair {

  const repairedPlan =
    structuredClone(plan);


  const maxSessionMinutesRaw =
    Number(
      longestSessionMinutes
    );


  const maxSessionMinutes =
    Number.isFinite(
      maxSessionMinutesRaw
    ) &&
    maxSessionMinutesRaw > 0
      ? maxSessionMinutesRaw
      : Infinity;


  const candidateSessions = [
    ...repairedPlan.days,

    ...(
      repairedPlan
        .additionalSessions ??
      []
    ),
  ]
    .filter(
      (session) =>
        (
          session.sport ===
            "Bike" ||
          session.sport ===
            "Swim"
        ) &&
        session.durationMinutes >
          0 &&
        session.durationMinutes <
          maxSessionMinutes
    )
    .map(
      (session) => ({
        session,

        headroom:
          Math.max(
            0,
            maxSessionMinutes -
            session.durationMinutes
          ),
      })
    )
    .filter(
      (candidate) =>
        candidate.headroom > 0
    )
    .sort(
      (
        a,
        b
      ) =>
        b.headroom -
        a.headroom
    );


  let remainingMinutes =
    Math.max(
      0,
      Math.ceil(
        missingMinutes
      )
    );


  const appliedRepairs:
    NextWeekVolumeRepair[
      "appliedRepairs"
    ] = [];


  for (
    const candidate
    of candidateSessions
  ) {

    if (
      remainingMinutes <= 0
    ) {
      break;
    }


    /*
      Keep every individual extension modest.

      A weekly shortfall is distributed across safe
      Bike / Swim sessions instead of being dumped
      into one workout.
    */
    const perSessionCap =
      Math.min(
        30,
        candidate.headroom
      );


    const addMinutes =
      Math.min(
        remainingMinutes,
        perSessionCap
      );


    if (
      addMinutes <= 0
    ) {
      continue;
    }


    const repairTarget =
      candidate.session;


    repairTarget.durationMinutes +=
      addMinutes;


    repairTarget.workoutStructure = [
      ...(
        repairTarget
          .workoutStructure ??
        []
      ),

      {
        sport:
          repairTarget.sport ===
            "Swim"
            ? "Swim"
            : "Bike",

        kind:
          "segment",

        phase:
          "Main",

        label:
          "Easy aerobic extension",

        repeatCount:
          1,

        workDurationSeconds:
          addMinutes *
          60,

        workDistanceMeters:
          null,

        workIntensity:
          "Easy, RPE 2-3",

        workInstruction:
          repairTarget.sport ===
            "Swim"
            ? "Continue with relaxed aerobic swimming and smooth technique."
            : "Continue at relaxed aerobic endurance effort.",

        recoveryDurationSeconds:
          null,

        recoveryDistanceMeters:
          null,

        recoveryIntensity:
          null,

        recoveryInstruction:
          null,
      },
    ];


    repairTarget.details = [
      ...repairTarget.details,

      repairTarget.sport ===
        "Swim"
        ? `${addMinutes} min relaxed aerobic extension with smooth technique.`
        : `${addMinutes} min relaxed aerobic endurance extension, RPE 2-3.`,
    ];


    appliedRepairs.push({
      day:
        repairTarget.day,

      sport:
        repairTarget.sport,

      minutes:
        addMinutes,
    });


    remainingMinutes -=
      addMinutes;
  }


  const repairedTotalMinutes =
    [
      ...repairedPlan.days,

      ...(
        repairedPlan
          .additionalSessions ??
        []
      ),
    ].reduce(
      (
        total,
        session
      ) =>
        total +
        (
          session.sport ===
            "Rest"
            ? 0
            : Number(
                session
                  .durationMinutes
              ) || 0
        ),
      0
    );


  repairedPlan.totalHours =
    Number(
      (
        repairedTotalMinutes /
        60
      ).toFixed(
        2
      )
    );


  return {
    plan:
      repairedPlan,

    fullyApplied:
      remainingMinutes === 0,

    appliedRepairs,
  };
}
