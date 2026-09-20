import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";

import {
  fullDistanceCourse,
  middleDistanceCourse,
} from "@/lib/race-standard-distance";


type SimpleRace = {
  slug: string;
  name: string;
  shortName: string;

  location: string;
  country: string;
  countryCode: string;

  series:
    | "IRONMAN"
    | "Challenge";

  format:
    | "Ironman"
    | "70.3";

  date: string;

  emoji: string;

  bikeProfile?:
    "Flat"
    | "Rolling"
    | "Hilly"
    | "Mountainous";

  runProfile?:
    "Flat"
    | "Rolling"
    | "Hilly"
    | "Mountainous";

  swimEnvironment?:
    "Lake"
    | "Sea"
    | "River"
    | "Open water";

  characteristics?: string[];

  sourceUrl: string;
};


const SIMPLE_RACES:
  SimpleRace[] = [

  // ======================================================
  // IRONMAN FULL
  // ======================================================

  {
    slug: "ironman-hamburg",
    name: "IRONMAN Hamburg European Championship",
    shortName: "IRONMAN Hamburg",
    location: "Hamburg, Germany",
    country: "Germany",
    countryCode: "DE",
    series: "IRONMAN",
    format: "Ironman",
    date: "2026-06-07",
    emoji: "🇩🇪",
    bikeProfile: "Flat",
    runProfile: "Flat",
    characteristics: [
      "City racing",
      "Fast course",
      "Urban marathon",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im-hamburg",
  },

  {
    slug: "ironman-frankfurt",
    name: "Mainova IRONMAN Frankfurt European Championship",
    shortName: "IRONMAN Frankfurt",
    location: "Frankfurt, Germany",
    country: "Germany",
    countryCode: "DE",
    series: "IRONMAN",
    format: "Ironman",
    date: "2026-06-28",
    emoji: "🇩🇪",
    bikeProfile: "Rolling",
    runProfile: "Flat",
    characteristics: [
      "European Championship",
      "Long-course fueling",
      "City marathon",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im-frankfurt",
  },

  {
    slug: "ironman-vitoria-gasteiz",
    name: "IRONMAN Vitoria-Gasteiz",
    shortName: "IRONMAN Vitoria-Gasteiz",
    location: "Vitoria-Gasteiz, Spain",
    country: "Spain",
    countryCode: "ES",
    series: "IRONMAN",
    format: "Ironman",
    date: "2026-07-12",
    emoji: "🇪🇸",
    bikeProfile: "Rolling",
    runProfile: "Flat",
    characteristics: [
      "Lake swim",
      "Rolling bike",
      "Fast city run",
    ],
    swimEnvironment: "Lake",
    sourceUrl:
      "https://www.ironman.com/races/im-vitoria-gasteiz",
  },

  {
    slug: "ironman-vichy",
    name: "IRONMAN Vichy",
    shortName: "IRONMAN Vichy",
    location: "Vichy, France",
    country: "France",
    countryCode: "FR",
    series: "IRONMAN",
    format: "Ironman",
    date: "2026-08-23",
    emoji: "🇫🇷",
    bikeProfile: "Hilly",
    runProfile: "Flat",
    characteristics: [
      "French long-course racing",
      "Hilly bike",
      "Long-course fueling",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im-vichy",
  },

  {
    slug: "ironman-calella-barcelona",
    name: "IRONMAN Calella-Barcelona",
    shortName: "IRONMAN Barcelona",
    location: "Calella, Spain",
    country: "Spain",
    countryCode: "ES",
    series: "IRONMAN",
    format: "Ironman",
    date: "2026-10-04",
    emoji: "🇪🇸",
    swimEnvironment: "Sea",
    bikeProfile: "Rolling",
    runProfile: "Flat",
    characteristics: [
      "Mediterranean swim",
      "Fast racing",
      "Coastal course",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im-barcelona",
  },


  // ======================================================
  // IRONMAN 70.3
  // ======================================================

  {
    slug: "ironman-703-valencia",
    name: "IRONMAN 70.3 Valencia",
    shortName: "70.3 Valencia",
    location: "Valencia, Spain",
    country: "Spain",
    countryCode: "ES",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-04-19",
    emoji: "🇪🇸",
    runProfile: "Flat",
    characteristics: [
      "City racing",
      "Fast run",
      "Early-season race",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-valencia",
  },

  {
    slug: "ironman-703-mallorca",
    name: "Zafiro IRONMAN 70.3 Alcudia-Mallorca",
    shortName: "70.3 Mallorca",
    location: "Alcúdia, Mallorca, Spain",
    country: "Spain",
    countryCode: "ES",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-05-09",
    emoji: "🇪🇸",
    swimEnvironment: "Sea",
    bikeProfile: "Hilly",
    runProfile: "Flat",
    characteristics: [
      "Mediterranean swim",
      "Mallorca climbing",
      "Large race field",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-mallorca",
  },

  {
    slug: "ironman-703-aix",
    name: "IRONMAN 70.3 Aix-en-Provence",
    shortName: "70.3 Aix-en-Provence",
    location: "Aix-en-Provence, France",
    country: "France",
    countryCode: "FR",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-05-17",
    emoji: "🇫🇷",
    bikeProfile: "Hilly",
    characteristics: [
      "Hilly bike",
      "Provence",
      "Warm-weather racing",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-aix-en-provence",
  },

  {
    slug: "ironman-703-elsinore",
    name: "IRONMAN 70.3 Elsinore",
    shortName: "70.3 Elsinore",
    location: "Helsingør, Denmark",
    country: "Denmark",
    countryCode: "DK",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-06-21",
    emoji: "🇩🇰",
    bikeProfile: "Rolling",
    runProfile: "Flat",
    characteristics: [
      "Fast Scandinavian racing",
      "Rolling bike",
      "Flat run",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-elsinore",
  },

  {
    slug: "ironman-703-swansea",
    name: "IRONMAN 70.3 Swansea",
    shortName: "70.3 Swansea",
    location: "Swansea, Wales",
    country: "United Kingdom",
    countryCode: "GB",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-07-12",
    emoji: "🇬🇧",
    bikeProfile: "Hilly",
    characteristics: [
      "Coastal racing",
      "Hilly bike",
      "Exposed conditions",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-swansea",
  },

  {
    slug: "ironman-703-vitoria-gasteiz",
    name: "IRONMAN 70.3 Vitoria-Gasteiz",
    shortName: "70.3 Vitoria-Gasteiz",
    location: "Vitoria-Gasteiz, Spain",
    country: "Spain",
    countryCode: "ES",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-07-12",
    emoji: "🇪🇸",
    swimEnvironment: "Lake",
    bikeProfile: "Rolling",
    runProfile: "Flat",
    characteristics: [
      "Lake swim",
      "Rolling bike",
      "Fast city run",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-vitoria-gasteiz",
  },

  {
    slug: "ironman-703-vichy",
    name: "IRONMAN 70.3 Vichy",
    shortName: "70.3 Vichy",
    location: "Vichy, France",
    country: "France",
    countryCode: "FR",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-08-23",
    emoji: "🇫🇷",
    bikeProfile: "Hilly",
    runProfile: "Flat",
    characteristics: [
      "Hilly bike",
      "French summer racing",
      "Flat run",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-vichy",
  },

  {
    slug: "ironman-703-zell-am-see",
    name: "IRONMAN 70.3 Zell am See-Kaprun",
    shortName: "70.3 Zell am See",
    location: "Zell am See, Austria",
    country: "Austria",
    countryCode: "AT",
    series: "IRONMAN",
    format: "70.3",
    date: "2026-08-30",
    emoji: "🇦🇹",
    swimEnvironment: "Lake",
    bikeProfile: "Mountainous",
    characteristics: [
      "Alpine lake swim",
      "Mountain climbing",
      "Alpine racing",
    ],
    sourceUrl:
      "https://www.ironman.com/races/im703-zell-am-see",
  },


  // ======================================================
  // CHALLENGE
  // ======================================================

  {
    slug: "challenge-roth",
    name: "DATEV Challenge Roth",
    shortName: "Challenge Roth",
    location: "Roth, Germany",
    country: "Germany",
    countryCode: "DE",
    series: "Challenge",
    format: "Ironman",
    date: "2026-07-05",
    emoji: "🇩🇪",
    swimEnvironment: "River",
    bikeProfile: "Rolling",
    runProfile: "Flat",
    characteristics: [
      "Iconic long-distance race",
      "Huge spectator support",
      "Fast course",
    ],
    sourceUrl:
      "https://www.challenge-family.com/challenge-family/races/challenge-roth/",
  },

  {
    slug: "challenge-almere",
    name: "Challenge Almere-Amsterdam",
    shortName: "Challenge Almere",
    location: "Almere, Netherlands",
    country: "Netherlands",
    countryCode: "NL",
    series: "Challenge",
    format: "Ironman",
    date: "2026-09-12",
    emoji: "🇳🇱",
    bikeProfile: "Flat",
    runProfile: "Flat",
    characteristics: [
      "Very flat course",
      "Wind exposure",
      "Fast long-distance racing",
      "Below sea level",
    ],
    sourceUrl:
      "https://www.challenge-family.com/challenge-family/races/challenge-almere-amsterdam/",
  },


  {
    slug: "challenge-sanremo",
    name: "Challenge Sanremo",
    shortName: "Challenge Sanremo",
    location: "Sanremo, Italy",
    country: "Italy",
    countryCode: "IT",
    series: "Challenge",
    format: "70.3",
    date: "2026-10-04",
    emoji: "🇮🇹",
    bikeProfile: "Hilly",
    characteristics: [
      "Italian Riviera",
      "Hilly bike",
      "Coastal racing",
    ],
    sourceUrl:
      "https://www.challenge-family.com/",
  },

  {
    slug: "challenge-peguera-mallorca",
    name: "Challenge Peguera Mallorca",
    shortName: "Challenge Mallorca",
    location: "Peguera, Mallorca, Spain",
    country: "Spain",
    countryCode: "ES",
    series: "Challenge",
    format: "70.3",
    date: "2026-10-17",
    emoji: "🇪🇸",
    swimEnvironment: "Sea",
    bikeProfile: "Hilly",
    characteristics: [
      "Mediterranean swim",
      "Mallorca terrain",
      "Late-season racing",
    ],
    sourceUrl:
      "https://www.challenge-family.com/",
  },

  {
    slug: "challenge-barcelona",
    name: "Challenge Barcelona",
    shortName: "Challenge Barcelona",
    location: "Barcelona, Spain",
    country: "Spain",
    countryCode: "ES",
    series: "Challenge",
    format: "70.3",
    date: "2026-10-25",
    emoji: "🇪🇸",
    swimEnvironment: "Sea",
    characteristics: [
      "Mediterranean racing",
      "City race",
      "Late-season goal",
    ],
    sourceUrl:
      "https://www.challenge-family.com/",
  },
];


export const CURATED_2026_RACES:
  RaceImportRecord[] =
    SIMPLE_RACES.map(
      (race) => {

        const course =
          race.format === "Ironman"
            ? fullDistanceCourse({
                swim: {
                  environment:
                    race.swimEnvironment,
                },
                bike: {
                  profile:
                    race.bikeProfile,
                },
                run: {
                  profile:
                    race.runProfile,
                  surface: "Road",
                },
              })
            : middleDistanceCourse({
                swim: {
                  environment:
                    race.swimEnvironment,
                },
                bike: {
                  profile:
                    race.bikeProfile,
                },
                run: {
                  profile:
                    race.runProfile,
                  surface: "Road",
                },
              });


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
            race.characteristics ??
            [],

          /*
            This is intentional.

            The race/date/standard distance
            information is useful and curated,
            while not every course detail has
            been exhaustively verified.
          */
          dataQuality:
            "Partial",

          notes:
            "Curated TriCoach race profile. Athlete can edit race details.",

          editions: [
            {
              year:
                2026,

              date:
                race.date,

              ...course,

              dataQuality:
                "Partial",

              verifiedFields: [
                "race identity",
                "race_date",
                "standard course distances",
              ],

              dataWarning:
                "Course characteristics may be approximate and can be edited by the athlete.",
            },
          ],

          sources: [
            {
              name:
                race.series ===
                  "IRONMAN"
                  ? "IRONMAN"
                  : "Challenge Family",

              url:
                race.sourceUrl,

              type:
                "Official",

              verifiedAt:
                "2026-08-17",

              supportsFields: [
                "race identity",
                "race_date",
              ],
            },
          ],
        };
      }
    );
