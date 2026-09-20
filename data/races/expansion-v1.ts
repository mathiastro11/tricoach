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


function fullCourse(
  options: {
    swimEnvironment?:
      "Lake" |
      "Sea" |
      "River" |
      "Fjord" |
      "Open water";

    swimKm?: number;

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

    waterTemp?: number;

    wetsuitLikely?: boolean;
  } = {}
): Course {

  return {
    swim: {
      distanceKm:
        options.swimKm ?? 3.8,

      ...(options.swimEnvironment
        ? {
            environment:
              options.swimEnvironment,
          }
        : {}),

      ...(options.waterTemp !== undefined
        ? {
            expectedWaterTempC:
              options.waterTemp,
          }
        : {}),

      ...(options.wetsuitLikely !== undefined
        ? {
            wetsuitLikely:
              options.wetsuitLikely,
          }
        : {}),
    },

    bike: {
      distanceKm:
        options.bikeKm ?? 180,

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
        options.runKm ?? 42.2,

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

      surface:
        options.runSurface ?? "Road",
    },
  };
}


function middleCourse(
  options: {
    swimEnvironment?:
      "Lake" |
      "Sea" |
      "River" |
      "Fjord" |
      "Open water";

    swimKm?: number;

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
  } = {}
): Course {

  return {
    swim: {
      distanceKm:
        options.swimKm ?? 1.9,

      ...(options.swimEnvironment
        ? {
            environment:
              options.swimEnvironment,
          }
        : {}),
    },

    bike: {
      distanceKm:
        options.bikeKm ?? 90,

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
        options.runKm ?? 21.1,

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

      surface:
        options.runSurface ?? "Road",
    },
  };
}


const RACES:
  RaceSeed[] = [

  {
    slug:
      "norseman",

    name:
      "Zalaris Norseman Xtreme Triathlon",

    shortName:
      "Norseman",

    location:
      "Eidfjord → Gausta, Norway",

    country:
      "Norway",

    countryCode:
      "NO",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2027-08-07",

    emoji:
      "🇳🇴",

    course:
      fullCourse({
        swimEnvironment:
          "Fjord",

        wetsuitLikely:
          true,

        bikeElevation:
          2762,

        bikeElevationDisplay:
          "2,762 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runKm:
          42,

        runElevation:
          1800,

        runElevationDisplay:
          "1,800 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Mixed",
      }),

    characteristics: [
      "Cold fjord swim",
      "Extreme mountain course",
      "Long sustained climbing",
      "Technical descending",
      "Gaustatoppen finish",
      "Support-team logistics",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/norseman/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
    ],
  },


  {
    slug:
      "swedeman",

    name:
      "Swedeman Xtreme Triathlon",

    shortName:
      "Swedeman",

    location:
      "Åre, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2027-07-10",

    emoji:
      "🇸🇪",

    course:
      fullCourse({
        swimEnvironment:
          "Lake",

        waterTemp:
          13,

        wetsuitLikely:
          true,

        bikeKm:
          205,

        bikeElevation:
          2377,

        bikeElevationDisplay:
          "2,377 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runKm:
          43,

        runElevation:
          1700,

        runElevationDisplay:
          "1,700 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "Cold-water swim",
      "205 km bike",
      "Repeated climbing",
      "Åreskutan mountain run",
      "99% trail run",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/swedeman",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
      "water temperature",
    ],
  },


  {
    slug:
      "celtman",

    name:
      "CELTMAN! Extreme Scottish Triathlon",

    shortName:
      "CELTMAN!",

    location:
      "Torridon, Scotland",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2027-06-12",

    emoji:
      "🏴󠁧󠁢󠁳󠁣󠁴󠁿",

    course:
      fullCourse({
        swimEnvironment:
          "Sea",

        swimKm:
          3.4,

        bikeKm:
          200,

        bikeElevation:
          2187,

        bikeElevationDisplay:
          "2,187 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runKm:
          42,

        runElevation:
          1582,

        runElevationDisplay:
          "1,582 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "Cold Atlantic swim",
      "200 km bike",
      "Scottish Highlands",
      "Mountain trail run",
      "Technical terrain",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/celtman",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
    ],
  },


  {
    slug:
      "himalayan-xtri",

    name:
      "Himalayan XTRI",

    shortName:
      "Himalayan",

    location:
      "Nepal",

    country:
      "Nepal",

    countryCode:
      "NP",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2027-05-08",

    emoji:
      "🇳🇵",

    course:
      fullCourse({
        swimEnvironment:
          "Lake",

        bikeKm:
          176,

        bikeElevation:
          3600,

        bikeElevationDisplay:
          "3,600 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runKm:
          42.4,

        runElevation:
          3000,

        runElevationDisplay:
          "3,000 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "Night swim",
      "High altitude",
      "3,600 m bike climbing",
      "3,000 m run climbing",
      "Remote mountain terrain",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/himalayan",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
    ],
  },


  {
    slug:
      "chibchi-fisha",

    name:
      "Chibchi Fisha Xtreme Colombia",

    shortName:
      "Chibchi Fisha",

    location:
      "Lake Tota / Colombian Andes",

    country:
      "Colombia",

    countryCode:
      "CO",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2027-01-30",

    emoji:
      "🇨🇴",

    course:
      fullCourse({
        swimEnvironment:
          "Lake",

        swimKm:
          3,

        bikeKm:
          185,

        bikeElevation:
          3200,

        bikeElevationDisplay:
          "3,200 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runKm:
          43,

        runElevation:
          2000,

        runElevationDisplay:
          "2,000 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "High-altitude swim",
      "Cold water",
      "Colombian Andes",
      "3,200 m bike climbing",
      "2,000 m run climbing",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/chibchi",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
    ],
  },


  {
    slug:
      "icon-xtri",

    name:
      "ICON Livigno Xtreme Triathlon",

    shortName:
      "ICON",

    location:
      "Livigno, Italy",

    country:
      "Italy",

    countryCode:
      "IT",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2026-09-04",

    emoji:
      "🇮🇹",

    course:
      fullCourse({
        swimEnvironment:
          "Lake",

        bikeKm:
          195,

        bikeElevation:
          5000,

        bikeElevationDisplay:
          "5,000 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runElevation:
          1500,

        runElevationDisplay:
          "1,500 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "High-altitude swim",
      "5,000 m bike climbing",
      "Alpine passes",
      "High-altitude finish",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/icon",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
    ],
  },


  {
    slug:
      "janosik-xtri",

    name:
      "Jánošík Xtreme Triathlon",

    shortName:
      "Jánošík",

    location:
      "Orava / Terchová, Slovakia",

    country:
      "Slovakia",

    countryCode:
      "SK",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2026-09-05",

    emoji:
      "🇸🇰",

    course:
      fullCourse({
        swimEnvironment:
          "Lake",

        bikeKm:
          185,

        bikeElevation:
          2600,

        bikeElevationDisplay:
          "2,600 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runKm:
          42,

        runElevation:
          3200,

        runElevationDisplay:
          "3,200 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "Midnight swim",
      "Eight major bike climbs",
      "Steep gradients",
      "Extreme mountain run",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/janosik/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
    ],
  },


  {
    slug:
      "blacklake-xtri",

    name:
      "Blacklake Xtreme Triathlon",

    shortName:
      "Blacklake",

    location:
      "Montenegro",

    country:
      "Montenegro",

    countryCode:
      "ME",

    series:
      "XTRI",

    format:
      "Ironman",

    date:
      "2026-09-12",

    emoji:
      "🇲🇪",

    course:
      fullCourse({
        swimEnvironment:
          "Lake",

        bikeElevation:
          2439,

        bikeElevationDisplay:
          "2,439 m",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runElevation:
          862,

        runElevationDisplay:
          "862 m",

        runProfile:
          "Mountainous",

        runSurface:
          "Trail",
      }),

    characteristics: [
      "Mountain lake swim",
      "2,439 m bike climbing",
      "Mountain trail run",
    ],

    sourceName:
      "XTRI World Tour",

    sourceUrl:
      "https://www.xtriworldtour.com/blacklake",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "run elevation",
    ],
  },


  {
    slug:
      "ironman-wales",

    name:
      "IRONMAN Wales",

    shortName:
      "IRONMAN Wales",

    location:
      "Tenby, Wales",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "IRONMAN",

    format:
      "Ironman",

    date:
      "2026-09-13",

    emoji:
      "🏴",

    course:
      fullCourse({
        swimEnvironment:
          "Sea",

        bikeProfile:
          "Hilly",

        bikeTechnicality:
          "High",

        runProfile:
          "Hilly",
      }),

    characteristics: [
      "Ocean swim",
      "Hilly coastal bike",
      "Hilly marathon",
      "Exposed weather",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im-wales",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
      "swim environment",
      "bike profile",
      "run profile",
    ],
  },


  {
    slug:
      "ironman-italy-emilia-romagna",

    name:
      "IRONMAN Italy Emilia-Romagna",

    shortName:
      "IRONMAN Italy",

    location:
      "Cervia, Italy",

    country:
      "Italy",

    countryCode:
      "IT",

    series:
      "IRONMAN",

    format:
      "Ironman",

    date:
      "2026-09-19",

    emoji:
      "🇮🇹",

    course:
      fullCourse({
        swimEnvironment:
          "Sea",

        bikeProfile:
          "Flat",

        bikeTechnicality:
          "Low",

        runProfile:
          "Flat",
      }),

    characteristics: [
      "Adriatic Sea swim",
      "Flat bike",
      "Flat run",
      "Fast course",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im-emilia-romagna",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
      "swim environment",
      "bike profile",
      "run profile",
    ],
  },


  {
    slug:
      "ironman-portugal-cascais",

    name:
      "IRONMAN Portugal-Cascais",

    shortName:
      "IRONMAN Cascais",

    location:
      "Cascais, Portugal",

    country:
      "Portugal",

    countryCode:
      "PT",

    series:
      "IRONMAN",

    format:
      "Ironman",

    date:
      "2026-10-17",

    emoji:
      "🇵🇹",

    course:
      fullCourse({
        swimEnvironment:
          "Sea",

        bikeProfile:
          "Rolling",

        bikeTechnicality:
          "Moderate",

        runProfile:
          "Rolling",
      }),

    characteristics: [
      "Sheltered Atlantic swim",
      "Rolling bike",
      "Rolling coastal run",
      "Atlantic exposure",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im-cascais",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
      "swim environment",
      "bike profile",
      "run profile",
    ],
  },


  {
    slug:
      "ironman-703-zell-am-see",

    name:
      "IRONMAN 70.3 Zell am See-Kaprun",

    shortName:
      "70.3 Zell am See",

    location:
      "Zell am See, Austria",

    country:
      "Austria",

    countryCode:
      "AT",

    series:
      "IRONMAN",

    format:
      "70.3",

    date:
      "2026-08-30",

    emoji:
      "🇦🇹",

    course:
      middleCourse({
        swimEnvironment:
          "Lake",

        bikeProfile:
          "Mountainous",

        bikeTechnicality:
          "High",

        runProfile:
          "Flat",
      }),

    characteristics: [
      "Alpine lake swim",
      "Mountain climbing",
      "Technical descending",
      "Flat lakeside run",
    ],

    sourceName:
      "IRONMAN",

    sourceUrl:
      "https://www.ironman.com/races/im703-zell-am-see",

    verifiedFields: [
      "race identity",
      "race_date",
      "standard course distances",
      "swim environment",
      "bike profile",
      "run profile",
    ],
  },


  {
    slug:
      "challenge-almere",

    name:
      "Challenge Almere-Amsterdam",

    shortName:
      "Challenge Almere",

    location:
      "Almere, Netherlands",

    country:
      "Netherlands",

    countryCode:
      "NL",

    series:
      "Challenge",

    format:
      "Ironman",

    date:
      "2026-09-12",

    emoji:
      "🇳🇱",

    course:
      fullCourse({
        swimEnvironment:
          "Lake",

        bikeProfile:
          "Flat",

        bikeTechnicality:
          "Low",

        runProfile:
          "Flat",
      }),

    characteristics: [
      "Very flat course",
      "Wind exposure",
      "Fast long-distance racing",
      "Below sea level",
    ],

    sourceName:
      "Challenge Family",

    sourceUrl:
      "https://www.challenge-family.com/challenge-family/races/challenge-almere-amsterdam/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "swim environment",
      "bike profile",
      "run profile",
    ],
  },


  {
    slug:
      "challenge-sanremo",

    name:
      "Challenge Sanremo",

    shortName:
      "Challenge Sanremo",

    location:
      "Sanremo, Italy",

    country:
      "Italy",

    countryCode:
      "IT",

    series:
      "Challenge",

    format:
      "70.3",

    date:
      "2026-10-04",

    emoji:
      "🇮🇹",

    course:
      middleCourse({
        swimEnvironment:
          "Sea",

        bikeElevation:
          1600,

        bikeElevationDisplay:
          "1,600+ m",

        bikeProfile:
          "Hilly",

        bikeTechnicality:
          "High",

        runKm:
          21,

        runProfile:
          "Flat",
      }),

    characteristics: [
      "Mediterranean swim",
      "1,600+ m bike climbing",
      "Major sustained climb",
      "Technical descending",
      "Flat coastal run",
    ],

    sourceName:
      "Challenge Family",

    sourceUrl:
      "https://www.challenge-family.com/challenge-family/races/challenge-sanremo/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike elevation",
      "bike profile",
      "run profile",
    ],
  },


  {
    slug:
      "challenge-vieux-boucau",

    name:
      "Challenge Vieux Boucau",

    shortName:
      "Challenge Vieux Boucau",

    location:
      "Vieux-Boucau-les-Bains, France",

    country:
      "France",

    countryCode:
      "FR",

    series:
      "Challenge",

    format:
      "70.3",

    date:
      "2026-10-10",

    emoji:
      "🇫🇷",

    course:
      middleCourse({
        swimEnvironment:
          "Lake",

        runKm:
          21,

        bikeProfile:
          "Flat",

        bikeTechnicality:
          "Low",

        runProfile:
          "Flat",
      }),

    characteristics: [
      "Sheltered lake swim",
      "Fast flat bike",
      "Flat run",
      "Coastal racing",
    ],

    sourceName:
      "Challenge Family",

    sourceUrl:
      "https://www.challenge-family.com/challenge-family/races/challenge-vieux-boucau/",

    quality:
      "Verified",

    verifiedFields: [
      "race identity",
      "race_date",
      "course distances",
      "bike profile",
      "run profile",
    ],
  },
];


export const RACE_EXPANSION_V1:
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
          race.quality ?? "Partial";


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
            "TriCoach researched race profile. Unknown course data is intentionally left blank.",

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
                "Official",

              verifiedAt:
                "2026-08-26",

              supportsFields:
                race.verifiedFields,
            },
          ],
        };
      }
    );
