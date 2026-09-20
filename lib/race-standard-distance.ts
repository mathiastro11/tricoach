import type {
  RaceImportEdition,
} from "@/lib/race-ingestion";


type CourseOverrides = {
  swim?:
    Partial<
      NonNullable<
        RaceImportEdition["swim"]
      >
    >;

  bike?:
    Partial<
      NonNullable<
        RaceImportEdition["bike"]
      >
    >;

  run?:
    Partial<
      NonNullable<
        RaceImportEdition["run"]
      >
    >;
};


export function fullDistanceCourse(
  overrides:
    CourseOverrides = {}
) {
  return {
    swim: {
      distanceKm: 3.8,
      ...overrides.swim,
    },

    bike: {
      distanceKm: 180,
      ...overrides.bike,
    },

    run: {
      distanceKm: 42.2,
      ...overrides.run,
    },
  };
}


export function middleDistanceCourse(
  overrides:
    CourseOverrides = {}
) {
  return {
    swim: {
      distanceKm: 1.9,
      ...overrides.swim,
    },

    bike: {
      distanceKm: 90,
      ...overrides.bike,
    },

    run: {
      distanceKm: 21.1,
      ...overrides.run,
    },
  };
}


export function olympicDistanceCourse(
  overrides:
    CourseOverrides = {}
) {
  return {
    swim: {
      distanceKm: 1.5,
      ...overrides.swim,
    },

    bike: {
      distanceKm: 40,
      ...overrides.bike,
    },

    run: {
      distanceKm: 10,
      ...overrides.run,
    },
  };
}


export function sprintDistanceCourse(
  overrides:
    CourseOverrides = {}
) {
  return {
    swim: {
      distanceKm: 0.75,
      ...overrides.swim,
    },

    bike: {
      distanceKm: 20,
      ...overrides.bike,
    },

    run: {
      distanceKm: 5,
      ...overrides.run,
    },
  };
}
