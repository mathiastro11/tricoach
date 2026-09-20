import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export type XtriRaceSnapshot = {
  slug: string;

  name: string;
  shortName: string;

  location: string;

  country: string;
  countryCode: string;

  date?: string;
  year?: number;

  status:
    | "Official"
    | "Prospect";

  swim: {
    distanceKm: number;

    environment?:
      "Pool"
      | "Lake"
      | "Sea"
      | "Fjord"
      | "River"
      | "Open water"
      | "Unknown";

    expectedWaterTempC?:
      number;

    wetsuitLikely?:
      boolean;
  };

  bike: {
    distanceKm: number;

    elevationGainM?:
      number | null;

    elevationDisplay?:
      string;

    profile?:
      "Flat"
      | "Rolling"
      | "Hilly"
      | "Mountainous";

    technicality?:
      "Low"
      | "Moderate"
      | "High";
  };

  run: {
    distanceKm: number;

    elevationGainM?:
      number | null;

    elevationDisplay?:
      string;

    profile?:
      "Flat"
      | "Rolling"
      | "Hilly"
      | "Mountainous";

    surface?:
      "Road"
      | "Trail"
      | "Mixed";
  };

  characteristics:
    string[];

  emoji?: string;

  sourceUrl: string;

  verifiedAt: string;
};


export function xtriSnapshotToImport(
  race: XtriRaceSnapshot
): RaceImportRecord {

  const importEditionYear =
    race.date
      ? (
          race.year ??
          Number(
            race.date.slice(
              0,
              4
            )
          )
        )
      : 0;


  const verifiedFields = [
    "race identity",
    "course distances",
  ];


  if (
    race.bike
      .elevationGainM !==
      undefined
  ) {
    verifiedFields.push(
      "bike.elevationGainM"
    );
  }


  if (
    race.run
      .elevationGainM !==
      undefined
  ) {
    verifiedFields.push(
      "run.elevationGainM"
    );
  }


  if (
    race.swim.environment
  ) {
    verifiedFields.push(
      "swim.environment"
    );
  }


  if (race.date) {
    verifiedFields.push(
      "race_date"
    );
  }


  return {
    slug:
      race.slug,

    name:
      race.name,

    shortName:
      race.shortName,

    location:
      race.location,

    country:
      race.country,

    countryCode:
      race.countryCode,

    series:
      "XTRI",

    format:
      "Ironman",

    emoji:
      race.emoji,

    characteristics:
      [
        ...race.characteristics,

        race.status ===
          "Prospect"
          ? "XTRI Prospect Race"
          : "XTRI World Tour",
      ],

    dataQuality:
      "Verified",

    notes:
      race.status ===
        "Prospect"
        ? "Official XTRI Prospect Race."
        : "Official XTRI World Tour race.",

    editions: [
      {
        /*
          Known date = real edition.

          Known year but no confirmed date =
          course profile only.

          We deliberately do NOT invent
          a race date.
        */

        year:
          importEditionYear,

        date:
          race.date,

        swim:
          race.swim,

        bike:
          race.bike,

        run:
          race.run,

        dataQuality:
          "Verified",

        verifiedFields,

        dataWarning:
          !race.date &&
          race.year
            ? `Race is expected in ${race.year}, but an exact date is not currently stored as verified.`
            : undefined,
      },
    ],

    sources: [
      {
        name:
          "XTRI World Tour",

        url:
          race.sourceUrl,

        type:
          "Official",

        editionYear:
          importEditionYear,

        verifiedAt:
          race.verifiedAt,

        supportsFields:
          verifiedFields,
      },
    ],
  };
}
