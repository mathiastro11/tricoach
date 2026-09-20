import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


type Course =
  Pick<
    RaceImportRecord["editions"][number],
    "swim" | "bike" | "run"
  >;


type RaceSeed = {
  slug: string;
  name: string;
  shortName: string;

  location: string;
  country: string;
  countryCode: string;

  series:
    RaceImportRecord["series"];

  format:
    RaceImportRecord["format"];

  date: string;

  emoji: string;

  course: Course;

  characteristics:
    string[];

  sourceName: string;
  sourceUrl: string;

  quality?:
    RaceImportRecord["dataQuality"];

  verifiedFields:
    string[];

  warning?: string;
};


function course(
  options: {
    swimKm?: number;

    swimEnvironment?:
      "Lake" |
      "Sea" |
      "River" |
      "Fjord" |
      "Open water" |
      "Pool" |
      "Unknown";

    bikeKm?: number;

    bikeElevation?: number;

    bikeElevationDisplay?:
      string;

    bikeProfile?:
      "Flat" |
      "Rolling" |
      "Hilly" |
      "Mountainous";

    bikeTechnicality?:
      "Low" |
      "Moderate" |
      "High";

    runKm?: number;

    runElevation?: number;

    runElevationDisplay?:
      string;

    runProfile?:
      "Flat" |
      "Rolling" |
      "Hilly" |
      "Mountainous";

    runSurface?:
      "Road" |
      "Trail" |
      "Mixed";
  }
): Course {

  return {
    swim: {
      distanceKm:
        options.swimKm,

      ...(options.swimEnvironment
        ? {
            environment:
              options.swimEnvironment,
          }
        : {}),
    },

    bike: {
      distanceKm:
        options.bikeKm,

      ...(options.bikeElevation !== undefined
        ? {
            elevationGainM:
              options.bikeElevation,
          }
        : {}),

      ...(options.bikeElevationDisplay
        ? {
            elevationDisplay:
              options.bikeElevationDisplay,
          }
        : {}),

      ...(options.bikeProfile
        ? {
            profile:
              options.bikeProfile,
          }
        : {}),

      ...(options.bikeTechnicality
        ? {
            technicality:
              options.bikeTechnicality,
          }
        : {}),
    },

    run: {
      distanceKm:
        options.runKm,

      ...(options.runElevation !== undefined
        ? {
            elevationGainM:
              options.runElevation,
          }
        : {}),

      ...(options.runElevationDisplay
        ? {
            elevationDisplay:
              options.runElevationDisplay,
          }
        : {}),

      ...(options.runProfile
        ? {
            profile:
              options.runProfile,
          }
        : {}),

      ...(options.runSurface
        ? {
            surface:
              options.runSurface,
          }
        : {}),
    },
  };
}


const RACES:
  RaceSeed[] = [

  // ======================================================
  // NORWAY
  // ======================================================

  {
    slug:
      "jevnakerfull",

    name:
      "JevnakerFULL",

    shortName:
      "JevnakerFULL",

    location:
      "Jevnaker, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Ironman",

    date:
      "2026-08-30",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          3.8,

        swimEnvironment:
          "Lake",

        bikeKm:
          180,

        runKm:
          42,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Norwegian full-distance race",
      "Lake swim",
      "180 km bike",
      "Marathon finish",
      "Small-field racing",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/jevnakerfull/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
    ],
  },


  {
    slug:
      "lunde-triatlon",

    name:
      "Lunde Triatlon",

    shortName:
      "Lunde Triatlon",

    location:
      "Lunde, Telemark, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Sprint",

    date:
      "2026-08-29",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          0.75,

        swimEnvironment:
          "River",

        bikeKm:
          20,

        runKm:
          5,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Telemark Canal swim",
      "Sprint distance",
      "Beginner friendly",
      "Town-centre running",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/lunde-triatlon/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
    ],
  },


  {
    slug:
      "os-triathlon",

    name:
      "Os Triathlon",

    shortName:
      "Os Triathlon",

    location:
      "Os, Vestland, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Sprint",

    date:
      "2026-08-30",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          0.75,

        bikeKm:
          20,

        runKm:
          5,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Sprint triathlon",
      "Beginner friendly",
      "West-coast racing",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/os-triathlon-1/",

    warning:
      "Race is listed as sprint distance; exact environment and elevation remain unverified.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard sprint distances",
    ],
  },


  {
    slug:
      "soon-tryathlon",

    name:
      "Soon Tryathlon",

    shortName:
      "Soon Tryathlon",

    location:
      "Son, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Sprint",

    date:
      "2026-09-05",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          0.75,

        bikeKm:
          20,

        runKm:
          5,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Sprint distance",
      "Beginner friendly",
      "Feel-good race atmosphere",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/soon-tryathlon-2026/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
    ],
  },


  {
    slug:
      "hove-tri",

    name:
      "Hove Tri",

    shortName:
      "Hove Tri",

    location:
      "Hove, Arendal, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Olympic",

    date:
      "2027-06-12",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          1.5,

        swimEnvironment:
          "Sea",

        bikeKm:
          40,

        runKm:
          10,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Norwegian championship venue",
      "Coastal swim",
      "Standard distance",
      "Beginner and elite fields",
    ],

    sourceName:
      "Hove Tri",

    sourceUrl:
      "https://www.hovetri.no/blogg/hove-tri-2027",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard distance",
    ],
  },


  // ======================================================
  // NORTHERN EUROPE
  // ======================================================

  {
    slug:
      "ironman-kalmar",

    name:
      "IRONMAN Kalmar-Sweden",

    shortName:
      "IRONMAN Kalmar",

    location:
      "Kalmar, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    series:
      "IRONMAN",

    format:
      "Ironman",

    date:
      "2026-08-15",

    emoji:
      "🇸🇪",

    course:
      course({
        swimKm:
          3.8,

        swimEnvironment:
          "Sea",

        bikeKm:
          180,

        bikeProfile:
          "Flat",

        bikeTechnicality:
          "Low",

        runKm:
          42.2,

        runProfile:
          "Flat",

        runSurface:
          "Road",
      }),

    characteristics: [
      "Baltic Sea swim",
      "Flat bike",
      "Öland bridge",
      "Wind exposure",
      "Fast long-course racing",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im-kalmar",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
      "course profile",
    ],
  },


  {
    slug:
      "ironman-copenhagen",

    name:
      "IRONMAN Copenhagen",

    shortName:
      "IRONMAN Copenhagen",

    location:
      "Copenhagen, Denmark",

    country:
      "Denmark",

    countryCode:
      "DK",

    series:
      "IRONMAN",

    format:
      "Ironman",

    date:
      "2026-08-16",

    emoji:
      "🇩🇰",

    course:
      course({
        swimKm:
          3.8,

        swimEnvironment:
          "Sea",

        bikeKm:
          180,

        bikeProfile:
          "Rolling",

        bikeTechnicality:
          "Low",

        runKm:
          42.2,

        runProfile:
          "Rolling",

        runSurface:
          "Road",
      }),

    characteristics: [
      "Lagoon swim",
      "Rolling bike",
      "City marathon",
      "Fast long-course course",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im-copenhagen",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
      "course profile",
    ],
  },


  {
    slug:
      "ironman-tallinn",

    name:
      "IRONMAN Tallinn",

    shortName:
      "IRONMAN Tallinn",

    location:
      "Tallinn, Estonia",

    country:
      "Estonia",

    countryCode:
      "EE",

    series:
      "IRONMAN",

    format:
      "Ironman",

    date:
      "2026-08-22",

    emoji:
      "🇪🇪",

    course:
      course({
        swimKm:
          3.8,

        swimEnvironment:
          "Lake",

        bikeKm:
          180,

        runKm:
          42.2,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Northern European racing",
      "Lake swim",
      "City run",
      "Cooler weather possible",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im-tallinn",

    warning:
      "Exact elevation totals intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },


  {
    slug:
      "ironman-703-tallinn",

    name:
      "IRONMAN 70.3 Tallinn",

    shortName:
      "70.3 Tallinn",

    location:
      "Tallinn, Estonia",

    country:
      "Estonia",

    countryCode:
      "EE",

    series:
      "IRONMAN",

    format:
      "70.3",

    date:
      "2026-08-23",

    emoji:
      "🇪🇪",

    course:
      course({
        swimKm:
          1.9,

        swimEnvironment:
          "Lake",

        bikeKm:
          90,

        runKm:
          21.1,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Lake swim",
      "Northern European racing",
      "City half marathon",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im703-tallinn",

    warning:
      "Exact elevation totals intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },


  // ======================================================
  // EUROPE / LATE SEASON
  // ======================================================

  {
    slug:
      "ironman-703-weymouth",

    name:
      "IRONMAN 70.3 Weymouth",

    shortName:
      "70.3 Weymouth",

    location:
      "Weymouth, United Kingdom",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "IRONMAN",

    format:
      "70.3",

    date:
      "2026-09-20",

    emoji:
      "🇬🇧",

    course:
      course({
        swimKm:
          1.9,

        swimEnvironment:
          "Sea",

        bikeKm:
          90,

        runKm:
          21.1,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Sea swim",
      "British coastal racing",
      "Variable weather",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im703-weymouth",

    warning:
      "Elevation data intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },


  {
    slug:
      "ironman-703-porec",

    name:
      "IRONMAN 70.3 Poreč Croatia",

    shortName:
      "70.3 Poreč",

    location:
      "Poreč, Croatia",

    country:
      "Croatia",

    countryCode:
      "HR",

    series:
      "IRONMAN",

    format:
      "70.3",

    date:
      "2026-10-18",

    emoji:
      "🇭🇷",

    course:
      course({
        swimKm:
          1.9,

        swimEnvironment:
          "Sea",

        bikeKm:
          90,

        runKm:
          21.1,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Adriatic Sea swim",
      "Late-season race",
      "Mediterranean climate",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/",

    warning:
      "Detailed course elevation intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },


  {
    slug:
      "ironman-703-agadir",

    name:
      "IRONMAN 70.3 Agadir",

    shortName:
      "70.3 Agadir",

    location:
      "Agadir, Morocco",

    country:
      "Morocco",

    countryCode:
      "MA",

    series:
      "IRONMAN",

    format:
      "70.3",

    date:
      "2026-10-25",

    emoji:
      "🇲🇦",

    course:
      course({
        swimKm:
          1.9,

        swimEnvironment:
          "Sea",

        bikeKm:
          90,

        runKm:
          21.1,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Atlantic swim",
      "Warm-weather racing",
      "Late-season 70.3",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/",

    warning:
      "Detailed elevation data intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },


  {
    slug:
      "ironman-703-costa-navarino",

    name:
      "IRONMAN 70.3 Costa Navarino-Greece",

    shortName:
      "70.3 Costa Navarino",

    location:
      "Costa Navarino, Greece",

    country:
      "Greece",

    countryCode:
      "GR",

    series:
      "IRONMAN",

    format:
      "70.3",

    date:
      "2026-10-25",

    emoji:
      "🇬🇷",

    course:
      course({
        swimKm:
          1.9,

        swimEnvironment:
          "Sea",

        bikeKm:
          90,

        runKm:
          21.1,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Mediterranean swim",
      "Late-season racing",
      "Warm climate",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/",

    warning:
      "Detailed elevation data intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },


  {
    slug:
      "ironman-oman",

    name:
      "IRONMAN Oman",

    shortName:
      "IRONMAN Oman",

    location:
      "Oman",

    country:
      "Oman",

    countryCode:
      "OM",

    series:
      "IRONMAN",

    format:
      "Ironman",

    date:
      "2026-12-05",

    emoji:
      "🇴🇲",

    course:
      course({
        swimKm:
          3.8,

        swimEnvironment:
          "Sea",

        bikeKm:
          180,

        runKm:
          42.2,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Warm-weather long course",
      "Sea swim",
      "Late-season race",
      "Heat adaptation important",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/",

    warning:
      "Detailed course elevation intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },


  {
    slug:
      "ironman-703-oman",

    name:
      "IRONMAN 70.3 Oman",

    shortName:
      "70.3 Oman",

    location:
      "Oman",

    country:
      "Oman",

    countryCode:
      "OM",

    series:
      "IRONMAN",

    format:
      "70.3",

    date:
      "2026-12-05",

    emoji:
      "🇴🇲",

    course:
      course({
        swimKm:
          1.9,

        swimEnvironment:
          "Sea",

        bikeKm:
          90,

        runKm:
          21.1,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Warm-weather 70.3",
      "Sea swim",
      "Heat adaptation",
      "Late-season race",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/",

    warning:
      "Detailed course elevation intentionally left blank.",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
    ],
  },
];


export const RACE_EXPANSION_V2:
  RaceImportRecord[] =
    RACES.map(
      (race) => {

        const year =
          Number(
            race.date.slice(
              0,
              4
            )
          );

        const quality =
          race.quality ??
          "Partial";


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
            race.series,

          format:
            race.format,

          emoji:
            race.emoji,

          characteristics:
            race.characteristics,

          dataQuality:
            quality,

          notes:
            "TriCoach researched race profile. Unknown course details are intentionally left blank.",

          editions: [
            {
              year:
                0,

              ...race.course,

              dataQuality:
                quality,

              verifiedFields:
                race.verifiedFields,

              ...(race.warning
                ? {
                    dataWarning:
                      race.warning,
                  }
                : {}),
            },

            {
              year,

              date:
                race.date,

              ...race.course,

              dataQuality:
                quality,

              verifiedFields:
                race.verifiedFields,

              ...(race.warning
                ? {
                    dataWarning:
                      race.warning,
                  }
                : {}),
            },
          ],

          sources: [
            {
              name:
                race.sourceName,

              url:
                race.sourceUrl,

              type:
                race.sourceName ===
                  "Norges Triatlonforbund"
                  ? "Federation"
                  : "Official",

              verifiedAt:
                "2026-08-26",

              supportsFields:
                race.verifiedFields,
            },
          ],
        };
      }
    );
