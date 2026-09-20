import type {
  TargetRace,
} from "@/types/training";


export type RaceSpecificityPriority = {
  id: string;

  discipline:
    | "Swim"
    | "Bike"
    | "Run"
    | "General";

  priority:
    | "High"
    | "Medium"
    | "Low";

  title: string;

  reason: string;

  /*
    Simple coaching instruction that can be
    passed to plan generation later.
  */
  coachingSignal: string;
};


export type RaceSpecificityProfile = {
  available: boolean;

  raceName?: string;

  format?: TargetRace["format"];

  daysToRace?: number;

  priorities:
    RaceSpecificityPriority[];

  characteristics:
    string[];

  summary:
    string[];
};


function daysUntil(
  date: string
) {
  const target =
    new Date(
      `${date}T12:00:00`
    );

  if (
    Number.isNaN(
      target.getTime()
    )
  ) {
    return undefined;
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  return Math.ceil(
    (
      target.getTime() -
      today.getTime()
    ) /
    86_400_000
  );
}


function addPriority(
  priorities:
    RaceSpecificityPriority[],

  priority:
    RaceSpecificityPriority
) {

  if (
    priorities.some(
      (existing) =>
        existing.id ===
        priority.id
    )
  ) {
    return;
  }

  priorities.push(
    priority
  );
}


export function buildRaceSpecificityProfile(
  race:
    TargetRace |
    null |
    undefined
): RaceSpecificityProfile {

  if (!race) {
    return {
      available: false,

      priorities: [],

      characteristics: [],

      summary: [],
    };
  }


  const priorities:
    RaceSpecificityPriority[] =
      [];


  const characteristics =
    race.characteristics ??
    [];


  const characteristicText =
    characteristics
      .join(" ")
      .toLowerCase();


  const bikeElevation =
    race.bike
      ?.elevationGainM ??
    0;


  const runElevation =
    race.run
      ?.elevationGainM ??
    0;


  // ======================================================
  // BIKE CLIMBING
  // ======================================================

  const mountainousBike =
    race.bike?.profile ===
      "Mountainous" ||
    bikeElevation >= 2000 ||
    characteristicText.includes(
      "mountain"
    ) ||
    characteristicText.includes(
      "climbing"
    );


  if (mountainousBike) {
    addPriority(
      priorities,
      {
        id:
          "bike-climbing-durability",

        discipline:
          "Bike",

        priority:
          bikeElevation >= 2500
            ? "High"
            : "Medium",

        title:
          "Climbing durability",

        reason:
          bikeElevation > 0
            ? `Target race includes approximately ${bikeElevation} m of bike climbing.`
            : "Target race has a strongly mountainous bike profile.",

        coachingSignal:
          "Progressively develop sustained climbing ability and muscular endurance on the bike. Use hills, low-cadence strength-endurance and longer climbing work when appropriate. Do not make every ride mountainous.",
      }
    );
  }


  // ======================================================
  // FLAT / FAST BIKE
  // ======================================================

  if (
    race.bike?.profile ===
      "Flat"
  ) {
    addPriority(
      priorities,
      {
        id:
          "bike-steady-aero",

        discipline:
          "Bike",

        priority:
          "Medium",

        title:
          "Steady race-power durability",

        reason:
          "Target race has a flat bike course where sustained steady output and aerodynamic position matter.",

        coachingSignal:
          "Develop the ability to hold steady race-relevant effort for long periods, including appropriate time in aerodynamic position. Avoid unnecessary climbing specificity.",
      }
    );
  }


  // ======================================================
  // TECHNICAL BIKE
  // ======================================================

  if (
    race.bike?.technicality ===
      "High" ||
    characteristicText.includes(
      "technical descending"
    )
  ) {
    addPriority(
      priorities,
      {
        id:
          "bike-technical",

        discipline:
          "Bike",

        priority:
          "Medium",

        title:
          "Bike handling and descending",

        reason:
          "Target race includes technical or demanding cycling terrain.",

        coachingSignal:
          "Include safe opportunities to build descending confidence, cornering and bike handling. Skill work should complement fitness, not replace key aerobic training.",
      }
    );
  }


  // ======================================================
  // RUN CLIMBING / TRAIL
  // ======================================================

  const mountainousRun =
    race.run?.profile ===
      "Mountainous" ||
    runElevation >= 700;


  const trailRun =
    race.run?.surface ===
      "Trail" ||
    race.run?.surface ===
      "Mixed";


  if (
    mountainousRun ||
    trailRun
  ) {
    addPriority(
      priorities,
      {
        id:
          "run-terrain-durability",

        discipline:
          "Run",

        priority:
          runElevation >= 1200 ||
          race.run?.profile ===
            "Mountainous"
            ? "High"
            : "Medium",

        title:
          "Terrain-specific run durability",

        reason:
          runElevation > 0
            ? `Target run includes approximately ${runElevation} m of climbing and/or demanding terrain.`
            : "Target race includes trail or mountainous running.",

        coachingSignal:
          "Progressively include race-relevant hills and terrain. Build climbing durability and downhill tolerance gradually while protecting overall run consistency.",
      }
    );
  }


  // ======================================================
  // FLAT RUN
  // ======================================================

  if (
    race.run?.profile ===
      "Flat" &&
    race.run?.surface ===
      "Road"
  ) {
    addPriority(
      priorities,
      {
        id:
          "run-steady-efficiency",

        discipline:
          "Run",

        priority:
          "Low",

        title:
          "Steady running efficiency",

        reason:
          "Target race has a relatively flat road run.",

        coachingSignal:
          "Prioritize efficient steady running off the bike and race-duration durability rather than unnecessary hill specificity.",
      }
    );
  }


  // ======================================================
  // OPEN WATER
  // ======================================================

  const openWater =
    race.swim?.environment &&
    race.swim.environment !==
      "Pool";


  if (openWater) {
    addPriority(
      priorities,
      {
        id:
          "open-water",

        discipline:
          "Swim",

        priority:
          "Medium",

        title:
          "Open-water confidence",

        reason:
          `Target race swim environment: ${race.swim?.environment}.`,

        coachingSignal:
          "When conditions and safety allow, gradually include open-water skills such as sighting, continuous swimming, starts and swimming in race equipment. Pool consistency remains the foundation.",
      }
    );
  }


  // ======================================================
  // COLD WATER
  // ======================================================

  const coldWater =
    (
      race.swim
        ?.expectedWaterTempC != null &&
      race.swim
        .expectedWaterTempC <= 16
    ) ||
    characteristicText.includes(
      "cold-water"
    ) ||
    characteristicText.includes(
      "cold water"
    );


  if (coldWater) {
    addPriority(
      priorities,
      {
        id:
          "cold-water",

        discipline:
          "Swim",

        priority:
          "Medium",

        title:
          "Cold-water preparation",

        reason:
          "Target race may involve cold-water swimming.",

        coachingSignal:
          "Introduce cold-water and wetsuit familiarity progressively and safely when appropriate. Never prescribe unsafe cold exposure or treat cold adaptation as a substitute for swim fitness.",
      }
    );
  }


  // ======================================================
  // LONG COURSE
  // ======================================================

  if (
    race.format ===
      "Ironman" ||
    race.format ===
      "70.3"
  ) {

    addPriority(
      priorities,
      {
        id:
          "race-fueling",

        discipline:
          "General",

        priority:
          race.format ===
            "Ironman"
            ? "High"
            : "Medium",

        title:
          "Race fueling",

        reason:
          `${race.format} racing requires practiced fueling and hydration.`,

        coachingSignal:
          "Practice race fueling and hydration during progressively longer key sessions. Avoid introducing an untested fueling strategy on race day.",
      }
    );


    addPriority(
      priorities,
      {
        id:
          "bike-run-durability",

        discipline:
          "General",

        priority:
          "High",

        title:
          "Bike-to-run durability",

        reason:
          "Long-course performance depends on preserving running ability after prolonged cycling.",

        coachingSignal:
          "Use progressively race-relevant long rides and selective brick sessions to develop durability. Bricks should be purposeful rather than added after every ride.",
      }
    );
  }


  // ======================================================
  // EXTREME / REMOTE CHARACTER
  // ======================================================

  if (
    characteristicText.includes(
      "extreme"
    ) ||
    characteristicText.includes(
      "remote"
    ) ||
    characteristicText.includes(
      "support-team"
    )
  ) {
    addPriority(
      priorities,
      {
        id:
          "extreme-course-resilience",

        discipline:
          "General",

        priority:
          "Medium",

        title:
          "Extreme-course resilience",

        reason:
          "Target race includes unusual environmental, terrain or logistical demands.",

        coachingSignal:
          "Prepare progressively for the race's environmental and logistical demands while avoiding unnecessary risk. Fitness remains the primary goal; specificity increases closer to race day.",
      }
    );
  }


  // ======================================================
  // SORT
  // ======================================================

  const priorityOrder = {
    High: 0,
    Medium: 1,
    Low: 2,
  };


  priorities.sort(
    (a, b) =>
      priorityOrder[
        a.priority
      ] -
      priorityOrder[
        b.priority
      ]
  );


  const summary =
    priorities
      .slice(0, 4)
      .map(
        (item) =>
          item.title
      );


  return {
    available: true,

    raceName:
      race.name,

    format:
      race.format,

    daysToRace:
      daysUntil(
        race.date
      ),

    priorities,

    characteristics,

    summary,
  };
}


export function buildRaceSpecificityGuidance(
  race:
    TargetRace |
    null |
    undefined
) {

  const profile =
    buildRaceSpecificityProfile(
      race
    );


  if (
    !profile.available ||
    profile.priorities.length ===
      0
  ) {
    return [
      "No detailed target-race course profile is available.",
      "Use the athlete's general race distance and training needs without inventing race-specific demands.",
    ].join("\n");
  }


  const priorityLines =
    profile.priorities.map(
      (item) =>
        `- ${item.priority.toUpperCase()} · ${item.title}: ${item.coachingSignal}`
    );


  return [
    `TARGET RACE: ${profile.raceName}`,
    `FORMAT: ${profile.format ?? "Unknown"}`,
    profile.daysToRace !==
      undefined
      ? `DAYS TO RACE: ${profile.daysToRace}`
      : "",
    "",
    "RACE-SPECIFIC TRAINING PRIORITIES:",
    ...priorityLines,
    "",
    "IMPORTANT:",
    "- Race specificity should increase progressively as race day approaches.",
    "- Do not force race-specific work into every session.",
    "- Preserve general aerobic development, consistency and recovery.",
    "- Athlete limitations, pain, illness and fatigue override race specificity.",
    "- User-edited race data should be treated as authoritative for that athlete.",
  ]
    .filter(Boolean)
    .join("\n");
}
