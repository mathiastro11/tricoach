import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";

import {
  getRaceFormatDefaults,
  type StandardRaceFormat,
} from "@/lib/race-format-defaults";


export type BasicRaceInput = {
  slug: string;

  name: string;
  shortName?: string;

  location: string;

  country: string;
  countryCode: string;

  format:
    StandardRaceFormat;

  date?: string;

  series?:
    | "IRONMAN"
    | "Challenge"
    | "XTRI"
    | "Independent";

  emoji?: string;

  swimEnvironment?:
    | "Pool"
    | "Lake"
    | "Sea"
    | "Fjord"
    | "River"
    | "Open water"
    | "Unknown";

  bikeProfile?:
    | "Flat"
    | "Rolling"
    | "Hilly"
    | "Mountainous"
    | "Mixed"
    | "Unknown";

  runProfile?:
    | "Flat"
    | "Rolling"
    | "Hilly"
    | "Mountainous"
    | "Mixed"
    | "Unknown";

  runSurface?:
    | "Road"
    | "Trail"
    | "Mixed"
    | "Unknown";

  /*
    Optional overrides for races that do not
    use standard format distances.
  */
  swimKm?: number;
  bikeKm?: number;
  runKm?: number;

  bikeElevationM?: number;
  runElevationM?: number;

  characteristics?: string[];

  sourceName?: string;
  sourceUrl?: string;

  distanceSources?: {
    swim?:
      | "organizer"
      | "federation"
      | "standard-default";

    bike?:
      | "organizer"
      | "federation"
      | "standard-default";

    run?:
      | "organizer"
      | "federation"
      | "standard-default";
  };

  verifiedAt?: string;
};


export function basicRaceToImport(
  race:
    BasicRaceInput
): RaceImportRecord {

  const defaults =
    getRaceFormatDefaults(
      race.format
    );

  if (!defaults) {
    throw new Error(
      `${race.slug}: no standard defaults for ${race.format}.`
    );
  }


  const swimKm =
    race.swimKm ??
    defaults.swimKm;

  const bikeKm =
    race.bikeKm ??
    defaults.bikeKm;

  const runKm =
    race.runKm ??
    defaults.runKm;


  const distanceSources = {
    swim:
      race.distanceSources?.swim ??
      (
        race.swimKm !== undefined
          ? "organizer"
          : "standard-default"
      ),

    bike:
      race.distanceSources?.bike ??
      (
        race.bikeKm !== undefined
          ? "organizer"
          : "standard-default"
      ),

    run:
      race.distanceSources?.run ??
      (
        race.runKm !== undefined
          ? "organizer"
          : "standard-default"
      ),
  };


  const verifiedFields = [
    "race identity",
    "format",
  ];


  if (race.date) {
    verifiedFields.push(
      "race_date"
    );
  }


  if (
    race.swimKm !==
      undefined ||
    race.bikeKm !==
      undefined ||
    race.runKm !==
      undefined
  ) {
    verifiedFields.push(
      "course distances"
    );
  }


  return {
    slug:
      race.slug,

    name:
      race.name,

    shortName:
      race.shortName ??
      race.name,

    location:
      race.location,

    country:
      race.country,

    countryCode:
      race.countryCode,

    series:
      race.series ??
      "Independent",

    format:
      race.format,

    emoji:
      race.emoji,

    characteristics:
      race.characteristics ??
      [],

    /*
      Basic catalog entries are deliberately
      Partial unless we have separately verified
      the full course profile.
    */
    dataQuality:
      "Partial",

    notes:
      [
        "Basic TriCoach race profile.",
        `Distance sources: swim=${distanceSources.swim}, bike=${distanceSources.bike}, run=${distanceSources.run}.`,
        "Athlete can edit race details.",
      ].join(" "),

    editions: [
      {
        year:
          race.date
            ? Number(
                race.date.slice(
                  0,
                  4
                )
              )
            : 0,

        date:
          race.date,

        swim: {
          distanceKm:
            swimKm,

          environment:
            race.swimEnvironment ??
            "Unknown",
        },

        bike: {
          distanceKm:
            bikeKm,

          elevationGainM:
            race.bikeElevationM ??
            null,

          profile:
            race.bikeProfile ??
            "Unknown",
        },

        run: {
          distanceKm:
            runKm,

          elevationGainM:
            race.runElevationM ??
            null,

          profile:
            race.runProfile ??
            "Unknown",

          surface:
            race.runSurface ??
            "Unknown",
        },

        dataQuality:
          "Partial",

        verifiedFields,

        dataWarning:
          "This is a basic race profile. Some course details may use standard-distance defaults or approximate information. Edit the race if your event differs.",
      },
    ],

    sources:
      race.sourceName ||
      race.sourceUrl
        ? [
            {
              name:
                race.sourceName ??
                "Race organizer",

              url:
                race.sourceUrl,

              type:
                "Organizer",

              verifiedAt:
                race.verifiedAt,

              supportsFields:
                verifiedFields,
            },
          ]
        : [],
  };
}
