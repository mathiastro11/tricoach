import type {
  Athlete,
  RoadmapWeek,
  SeasonRoadmap,
} from "@/types/training";

import {
  getCanonicalTrainingPhase,
  getCanonicalWeeksUntilRace,
} from "@/lib/training-phase";


function toIsoDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    `${date.getMonth() + 1}`
      .padStart(2, "0");

  const day =
    `${date.getDate()}`
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function mondayOfWeek(
  date: Date
) {
  const result =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12
    );

  const day =
    result.getDay();

  const distance =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      distance
  );

  return result;
}


type Phase =
  RoadmapWeek["phase"];


function targetHoursForWeek({
  athlete,
  phase,
  weekIndex,
  totalWeeks,
}: {
  athlete: Athlete;
  phase: Phase;
  weekIndex: number;
  totalWeeks: number;
}) {

  const current =
    Number(
      athlete
        .currentTrainingHours
    ) || 5;

  const available =
    Number(
      athlete.hoursPerWeek
    ) || current;


  /*
    Never make the roadmap promise more
    than the athlete says is available.
  */
  const ceiling =
    Math.max(
      current,
      available
    );


  const progression =
    totalWeeks <= 1
      ? 0
      : (
          weekIndex - 1
        ) /
        (
          totalWeeks - 1
        );


  let target =
    current +
    (
      ceiling -
      current
    ) *
      Math.min(
        1,
        progression *
          1.1
      );


  if (
    phase === "Base"
  ) {
    target *= 0.92;
  }


  if (
    phase === "Peak"
  ) {
    target *= 0.95;
  }


  if (
    phase === "Taper"
  ) {
    const weeksRemaining =
      totalWeeks -
      weekIndex;

    target *=
      weeksRemaining <= 1
        ? 0.55
        : 0.7;
  }


  return Math.max(
    2,
    Math.round(
      Math.min(
        ceiling,
        target
      ) *
        10
    ) / 10
  );
}


function raceDemandObjectives(
  athlete: Athlete
) {

  const race =
    athlete.targetRace;

  const objectives:
    string[] = [];


  if (
    race?.bike?.profile ===
      "Mountainous" ||
    (
      race?.bike
        ?.elevationGainM ??
      0
    ) >= 2000
  ) {
    objectives.push(
      "Build climbing durability progressively"
    );
  }


  if (
    race?.run?.surface ===
      "Trail" ||
    race?.run?.profile ===
      "Mountainous"
  ) {
    objectives.push(
      "Develop race-specific run durability and terrain confidence"
    );
  }


  if (
    race?.swim?.environment &&
    race.swim.environment !==
      "Pool" &&
    race.swim.environment !==
      "Unknown"
  ) {
    objectives.push(
      "Progress open-water confidence and race-specific swim skills"
    );
  }


  if (
    race?.format ===
      "70.3" ||
    race?.format ===
      "Ironman"
  ) {
    objectives.push(
      "Build long-course fueling and endurance durability"
    );
  }


  return objectives;
}


function phaseContent(
  phase: Phase,
  athlete: Athlete
) {

  const weak =
    athlete
      .weakestDiscipline;


  const raceObjectives =
    raceDemandObjectives(
      athlete
    );


  if (
    phase === "Base"
  ) {
    return {
      focus:
        "Aerobic consistency, technique and durable foundations",

      priorityDiscipline:
        weak,

      objectives: [
        "Build consistent weekly training",
        `Develop ${weak.toLowerCase()} without forcing load`,
        "Improve aerobic durability",
      ],
    };
  }


  if (
    phase === "Build"
  ) {
    return {
      focus:
        "Progressive endurance and increasingly race-relevant training",

      priorityDiscipline:
        weak,

      objectives: [
        "Progress sustainable endurance",
        "Introduce controlled race-specific work",
        ...raceObjectives.slice(
          0,
          2
        ),
      ].slice(0, 4),
    };
  }


  if (
    phase === "Peak"
  ) {
    return {
      focus:
        "Race-specific preparation and key-session quality",

      priorityDiscipline:
        raceObjectives.length > 0
          ? "Race specificity"
          : weak,

      objectives: [
        ...raceObjectives,
        "Practice race execution and pacing",
        "Protect recovery around key sessions",
      ].slice(0, 4),
    };
  }


  return {
    focus:
      "Reduce fatigue while preserving race readiness",

    priorityDiscipline:
      "Recovery",

    objectives: [
      "Reduce overall training volume",
      "Preserve short controlled intensity",
      "Arrive at race day fresh",
    ],
  };
}


export function buildInstantSeasonRoadmap(
  athlete: Athlete,
  now = new Date()
): SeasonRoadmap {

  if (
    !athlete.raceDate
  ) {
    throw new Error(
      "Race date is required."
    );
  }


  /*
    Instant and AI-generated season roadmaps must use the
    same calendar and phase engine.

    Resolve this roadmap's authoritative Monday once, then
    derive race distance from that exact calendar anchor.
  */
  const start =
    mondayOfWeek(
      now
    );


  const totalWeeks =
    Math.max(
      1,
      getCanonicalWeeksUntilRace(
        athlete.raceDate,
        start
      ) ?? 1
    );


  const weeks:
    RoadmapWeek[] = [];


  for (
    let weekIndex = 1;
    weekIndex <= totalWeeks;
    weekIndex += 1
  ) {

    const startDate =
      new Date(start);

    startDate.setDate(
      start.getDate() +
        (
          weekIndex - 1
        ) *
          7
    );


    const phase =
      getCanonicalTrainingPhase(
        athlete.raceDate,
        startDate
      );


    const content =
      phaseContent(
        phase,
        athlete
      );


    weeks.push({
      weekIndex,

      startDate:
        toIsoDate(
          startDate
        ),

      phase,

      focus:
        content.focus,

      targetHours:
        targetHoursForWeek({
          athlete,
          phase,
          weekIndex,
          totalWeeks,
        }),

      priorityDiscipline:
        content
          .priorityDiscipline,

      keyObjectives:
        content.objectives,
    });
  }


  const raceName =
    athlete.targetRace
      ?.name ??
    athlete.goal;


  return {
    createdAt:
      new Date()
        .toISOString(),

    raceDate:
      athlete.raceDate,

    raceGoal:
      raceName,

    totalWeeks,

    summary:
      `${totalWeeks}-week progression toward ${raceName}, built around your current training level, availability and race demands.`,

    weeks,
  };
}
