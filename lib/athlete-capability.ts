import type {
  Athlete,
  AthleteCapabilityProfile,
  AthleteExperience,
  DisciplineLevel,
  PerformanceTier,
} from "@/types/training";


export const TRIATHLON_EXPERIENCE_OPTIONS:
  readonly AthleteExperience[] = [
    "Beginner",
    "Intermediate",
    "Experienced",
    "Advanced",
  ];


export const DISCIPLINE_LEVEL_OPTIONS:
  readonly DisciplineLevel[] = [
    "Beginner",
    "Developing",
    "Confident",
    "Advanced",
    "Elite",
  ];


export const PERFORMANCE_TIER_OPTIONS:
  readonly PerformanceTier[] = [
    "Recreational",
    "Competitive",
    "Elite",
    "Professional",
  ];


function included<
  T extends string
>(
  values: readonly T[],
  value: unknown
): value is T {

  return (
    typeof value === "string" &&
    values.includes(
      value as T
    )
  );
}


export function normalizeAthleteExperience(
  value: unknown,
  fallback:
    AthleteExperience =
      "Beginner"
): AthleteExperience {

  return included(
    TRIATHLON_EXPERIENCE_OPTIONS,
    value
  )
    ? value
    : fallback;
}


export function normalizeDisciplineLevel(
  value: unknown,
  fallback:
    DisciplineLevel =
      "Beginner"
): DisciplineLevel {

  return included(
    DISCIPLINE_LEVEL_OPTIONS,
    value
  )
    ? value
    : fallback;
}


export function normalizePerformanceTier(
  value: unknown,
  fallback:
    PerformanceTier =
      "Recreational"
): PerformanceTier {

  return included(
    PERFORMANCE_TIER_OPTIONS,
    value
  )
    ? value
    : fallback;
}


export function buildAthleteCapabilityProfile(
  athlete:
    Pick<
      Athlete,
      | "experience"
      | "swimLevel"
      | "bikeLevel"
      | "runLevel"
      | "performanceTier"
    >
): AthleteCapabilityProfile {

  return {
    version:
      1,

    experience:
      normalizeAthleteExperience(
        athlete.experience
      ),

    swimLevel:
      normalizeDisciplineLevel(
        athlete.swimLevel
      ),

    bikeLevel:
      normalizeDisciplineLevel(
        athlete.bikeLevel
      ),

    runLevel:
      normalizeDisciplineLevel(
        athlete.runLevel
      ),

    performanceTier:
      normalizePerformanceTier(
        athlete.performanceTier
      ),
  };
}


type LegacyCapabilityFallback = {
  experience?: unknown;

  swimLevel?: unknown;
  bikeLevel?: unknown;
  runLevel?: unknown;
};


export function resolveAthleteCapabilityProfile(
  raw: unknown,
  fallback:
    LegacyCapabilityFallback = {}
): AthleteCapabilityProfile {

  const record =
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw)
      ? raw as Record<
          string,
          unknown
        >
      : {};


  return {
    version:
      1,

    experience:
      normalizeAthleteExperience(
        record.experience,
        normalizeAthleteExperience(
          fallback.experience
        )
      ),

    swimLevel:
      normalizeDisciplineLevel(
        record.swimLevel,
        normalizeDisciplineLevel(
          fallback.swimLevel
        )
      ),

    bikeLevel:
      normalizeDisciplineLevel(
        record.bikeLevel,
        normalizeDisciplineLevel(
          fallback.bikeLevel
        )
      ),

    runLevel:
      normalizeDisciplineLevel(
        record.runLevel,
        normalizeDisciplineLevel(
          fallback.runLevel
        )
      ),

    performanceTier:
      normalizePerformanceTier(
        record.performanceTier
      ),
  };
}


/*
  Keep the old Supabase columns backwards-compatible.

  Exact high-performance values live in capability_profile.
*/
export function toLegacyExperience(
  value:
    AthleteExperience
) {

  return value ===
    "Advanced"
      ? "Experienced"
      : value;
}


export function toLegacyDisciplineLevel(
  value:
    DisciplineLevel
) {

  return (
    value === "Advanced" ||
    value === "Elite"
  )
    ? "Confident"
    : value;
}
