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

  {
    slug:
      "trondheim-triatlon",

    name:
      "Trondheim Triatlon",

    shortName:
      "Trondheim Triatlon",

    location:
      "Trondheim, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Olympic",

    date:
      "2026-08-22",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          2.4,

        swimEnvironment:
          "Sea",

        bikeKm:
          50,

        bikeProfile:
          "Rolling",

        bikeTechnicality:
          "Moderate",

        runKm:
          12,

        runProfile:
          "Rolling",

        runSurface:
          "Road",
      }),

    characteristics: [
      "Munkholmen swim start",
      "Open-water sea swim",
      "Byneset bike course",
      "Longer-than-standard format",
      "Urban finish in Ilsvika",
      "Coastal weather exposure",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://triatlonforbundet.no/terminliste/terminliste-2026/trondheim-triatlon-2026/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "swim distance",
      "bike distance",
      "run distance",
      "course character",
    ],

    warning:
      "Organizer description lists the primary course as approximately 2.4 km swim, 50 km bike and 12 km run, although federation tables also show standard/sprint categories.",
  },


  {
    slug:
      "oslo-triatlon",

    name:
      "Oslo Triatlon",

    shortName:
      "Oslo Triatlon",

    location:
      "Sognsvann, Oslo, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Olympic",

    date:
      "2026-08-08",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          1.5,

        swimEnvironment:
          "Lake",

        bikeKm:
          40,

        runKm:
          10,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Norway's oldest major triathlon",
      "Sognsvann lake swim",
      "Standard distance",
      "Large participant field",
      "Beginner and experienced athletes",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/oslo-triatlon/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
    ],
  },


  {
    slug:
      "finnskogen-triathlon",

    name:
      "Finnskogen Triathlon",

    shortName:
      "Finnskogen Triathlon",

    location:
      "Kongsvinger / Finnskogen, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Sprint",

    date:
      "2026-08-01",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          0.75,

        swimEnvironment:
          "Lake",

        bikeKm:
          20,

        runKm:
          5,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Sprint distance",
      "Inclusive local race",
      "Norwegian championship event",
      "Scenic Finnskogen setting",
      "Beginner friendly",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/finnskogen-triathlon/",

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
      "brandefant-triathlon",

    name:
      "Brandefant Triathlon Race",

    shortName:
      "Brandefant",

    location:
      "Uvdal / Imingfjell, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Olympic",

    date:
      "2026-08-08",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          1.5,

        swimEnvironment:
          "Lake",

        bikeKm:
          40,

        bikeElevation:
          1000,

        bikeElevationDisplay:
          "1,000+ m total course climbing",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runKm:
          10,

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "High-altitude mountain lake swim",
      "Swim around 1,060 m altitude",
      "Gravel bike sections",
      "Mountain running",
      "1,000+ m total climbing",
      "Hardangervidda terrain",
      "Technical off-road character",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/brandefant-triathlon-race-2026/",

    quality:
      "Partial",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "total course elevation",
      "course surface character",
    ],

    warning:
      "The organizer states more than 1,000 m total climbing across the race; the split between bike and run is not published, so 1,000 m is stored only as a practical course signal.",
  },


  {
    slug:
      "haugesund-triatlon",

    name:
      "Haugesund Triatlon",

    shortName:
      "Haugesund Triatlon",

    location:
      "Haugesund, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Sprint",

    date:
      "2026-08-16",

    emoji:
      "🇳🇴",

    course:
      course({
        swimKm:
          0.75,

        swimEnvironment:
          "Sea",

        bikeKm:
          20,

        runKm:
          5,

        runSurface:
          "Road",
      }),

    characteristics: [
      "Sea swim",
      "Coastal bike course",
      "Sprint distance",
      "West-coast weather exposure",
      "Beginner friendly",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/haugesund-triatlon-2026/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
    ],
  },


  {
    slug:
      "tonsbergdysten",

    name:
      "Tønsbergdysten",

    shortName:
      "Tønsbergdysten",

    location:
      "Tønsberg, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "Independent",

    format:
      "Sprint",

    date:
      "2026-09-20",

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
      "Low-threshold local race",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/",

    quality:
      "Partial",

    verifiedFields: [
      "race identity",
      "race_date",
      "sprint category",
    ],

    warning:
      "Federation calendar lists both sprint and normal categories; this entry represents the sprint option.",
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
      "Sprint distance",
      "West-coast setting",
      "Beginner friendly",
      "Long-running local event",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/os-triathlon/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "sprint category",
    ],
  },
];


export const RACE_EXPANSION_V3:
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
            "TriCoach researched Norwegian race profile. Unknown course details are intentionally left blank.",

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
                "Federation",

              verifiedAt:
                "2026-08-26",

              supportsFields:
                race.verifiedFields,
            },
          ],
        };
      }
    );
