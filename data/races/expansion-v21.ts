import type {
  RaceImportRecord,
  RaceImportSource,
} from "@/lib/race-ingestion";

import type {
  RaceDataQuality,
} from "@/lib/race-catalog";


type Course =
  Pick<
    RaceImportRecord["editions"][number],
    "swim" | "bike" | "run"
  >;


type Seed = {
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

  emoji: string;

  date: string;

  dataQuality:
    RaceDataQuality;

  characteristics:
    string[];

  notes: string;

  profile: Course;

  profileDataQuality:
    RaceDataQuality;

  profileVerifiedFields:
    string[];

  profileWarning?:
    string;

  sources:
    RaceImportSource[];
};


const VERIFIED_AT =
  "2026-09-03";


const RACES:
  Seed[] = [

  // ======================================================
  // IRONMAN 70.3 AIX-EN-PROVENCE
  // ======================================================

  {
    slug:
      "ironman-703-aix",

    name:
      "IRONMAN 70.3 Aix-en-Provence",

    shortName:
      "70.3 Aix-en-Provence",

    location:
      "Aix-en-Provence, France",

    country:
      "France",

    countryCode:
      "FR",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇫🇷",

    date:
      "2027-05-23",

    dataQuality:
      "Verified",

    characteristics: [
      "Lac de Peyrolles swim",
      "Provence countryside",
      "Hilly bike",
      "Technical Sainte-Victoire roads",
      "Rolling city run",
      "Warm-weather racing",
      "La Rotonde finish",
    ],

    notes:
      "2027 race date verified for 23 May 2027. Existing reusable course profile remains separate so TriCoach does not assume every course detail is edition-specific.",

    profile: {
      swim: {
        distanceKm:
          1.9,

        environment:
          "Lake",

        expectedWaterTempC:
          19,
      },

      bike: {
        distanceKm:
          90,

        profile:
          "Hilly",

        technicality:
          "High",
      },

      run: {
        distanceKm:
          21.1,

        profile:
          "Rolling",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "bike technicality",
      "run profile",
      "run surface",
      "course character",
    ],

    sources: [
      {
        name:
          "IRONMAN 70.3 Aix-en-Provence Course",

        url:
          "https://www.ironman.com/races/im703-aix-en-provence/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "bike technicality",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "TriSonen Terminliste",

        url:
          "https://www.trisonen.no/terminliste",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 VICHY
  // ======================================================

  {
    slug:
      "ironman-703-vichy",

    name:
      "IRONMAN 70.3 Vichy",

    shortName:
      "70.3 Vichy",

    location:
      "Vichy, France",

    country:
      "France",

    countryCode:
      "FR",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇫🇷",

    date:
      "2027-08-22",

    dataQuality:
      "Verified",

    characteristics: [
      "Allier River swim",
      "Calm open-water start",
      "Rolling Auvergne bike",
      "Montagne Bourbonnaise",
      "Flat fast run",
      "Lakeside city running",
      "Warm summer conditions",
    ],

    notes:
      "2027 race date verified for 22 August 2027. Exact course elevation remains intentionally unstored.",

    profile: {
      swim: {
        distanceKm:
          1.9,

        environment:
          "River",

        expectedWaterTempC:
          25,
      },

      bike: {
        distanceKm:
          90,

        profile:
          "Rolling",
      },

      run: {
        distanceKm:
          21.1,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],

    profileWarning:
      "Exact course elevation is intentionally omitted until a verified organizer total is available.",

    sources: [
      {
        name:
          "IRONMAN 70.3 Vichy Course",

        url:
          "https://www.ironman.com/races/im703-vichy/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "Nirvana Europe — IRONMAN 70.3 Vichy",

        url:
          "https://nirvanaeurope.com/book-event/?eventid=IMEU7VIC",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN VICHY
  // ======================================================

  {
    slug:
      "ironman-vichy",

    name:
      "IRONMAN Vichy",

    shortName:
      "IRONMAN Vichy",

    location:
      "Vichy, France",

    country:
      "France",

    countryCode:
      "FR",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇫🇷",

    date:
      "2027-08-22",

    dataQuality:
      "Verified",

    characteristics: [
      "Allier River swim",
      "Auvergne countryside",
      "Hilly long-course bike",
      "Flat city run",
      "Warm summer conditions",
      "Strong spectator support",
      "Long-course fueling",
    ],

    notes:
      "2027 race date verified for 22 August 2027. Exact elevation totals remain intentionally unstored.",

    profile: {
      swim: {
        distanceKm:
          3.8,

        environment:
          "River",

        expectedWaterTempC:
          22,
      },

      bike: {
        distanceKm:
          180,

        profile:
          "Hilly",
      },

      run: {
        distanceKm:
          42.2,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "run profile",
      "run surface",
      "course character",
    ],

    profileWarning:
      "Exact elevation totals are intentionally omitted until verified.",

    sources: [
      {
        name:
          "IRONMAN Vichy",

        url:
          "https://www.ironman.com/races/im-vichy",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "Nirvana Europe — IRONMAN Vichy",

        url:
          "https://nirvanaeurope.com/book-event/?eventid=IMEUVICH",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },


  // ======================================================
  // LUNDE TRIATLON
  // ======================================================

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

    emoji:
      "🇳🇴",

    date:
      "2027-08-28",

    dataQuality:
      "Verified",

    characteristics: [
      "Telemark Canal swim",
      "Sprint distance",
      "Beginner friendly",
      "Town-centre running",
    ],

    notes:
      "2027 race date verified for 28 August 2027. Existing course profile is retained; unknown course details remain intentionally blank.",

    profile: {
      swim: {
        distanceKm:
          0.75,

        environment:
          "River",
      },

      bike: {
        distanceKm:
          20,
      },

      run: {
        distanceKm:
          5,

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
    ],

    sources: [
      {
        name:
          "Norges Triatlonforbund — Lunde Triatlon 2026",

        url:
          "https://www.triatlonforbundet.no/terminliste/terminliste-2026/lunde-triatlon/",

        type:
          "Official",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "course distances",
        ],
      },

      {
        name:
          "TriSonen Terminliste",

        url:
          "https://www.trisonen.no/terminliste",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 NICE
  // ======================================================

  {
    slug:
      "ironman-703-nice",

    name:
      "IRONMAN 70.3 Nice",

    shortName:
      "70.3 Nice",

    location:
      "Nice, France",

    country:
      "France",

    countryCode:
      "FR",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇫🇷",

    date:
      "2027-09-12",

    dataQuality:
      "Verified",

    characteristics: [
      "Mediterranean Sea swim",
      "Col de Vence",
      "Hilly bike course",
      "Long sustained climbing",
      "Technical descending",
      "Flat Promenade des Anglais run",
      "Heat exposure",
      "Mountain-to-sea racing",
    ],

    notes:
      "2027 race date verified for 12 September 2027. Exact total elevation remains intentionally unstored.",

    profile: {
      swim: {
        distanceKm:
          1.9,

        environment:
          "Sea",

        expectedWaterTempC:
          23,
      },

      bike: {
        distanceKm:
          90,

        profile:
          "Hilly",

        technicality:
          "High",
      },

      run: {
        distanceKm:
          21.1,

        profile:
          "Flat",

        surface:
          "Road",
      },
    },

    profileDataQuality:
      "Verified",

    profileVerifiedFields: [
      "course distances",
      "swim environment",
      "water temperature",
      "bike profile",
      "bike technicality",
      "run profile",
      "run surface",
      "major bike climb",
      "course character",
    ],

    profileWarning:
      "Exact total elevation is intentionally omitted until a verified organizer total is available.",

    sources: [
      {
        name:
          "IRONMAN 70.3 Nice Course",

        url:
          "https://www.ironman.com/races/im703-nice/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
          "Col de Vence",
          "course character",
        ],
      },

      {
        name:
          "TriSonen Terminliste",

        url:
          "https://www.trisonen.no/terminliste",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },
];


export const RACE_EXPANSION_V21:
  RaceImportRecord[] =
    RACES.map(
      (race) => {

        const editions:
          RaceImportRecord["editions"] =
          [];


        editions.push({
          year:
            0,

          ...race.profile,

          dataQuality:
            race.profileDataQuality,

          verifiedFields:
            race.profileVerifiedFields,

          dataWarning:
            race.profileWarning,
        });


        editions.push({
          year:
            2027,

          date:
            race.date,

          dataQuality:
            "Verified",

          verifiedFields: [
            "race_date",
          ],
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
            race.characteristics,

          dataQuality:
            race.dataQuality,

          notes:
            race.notes,

          editions,

          sources:
            race.sources,
        };
      }
    );
