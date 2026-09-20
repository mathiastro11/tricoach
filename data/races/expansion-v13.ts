import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-01";


export const RACE_EXPANSION_V13:
  RaceImportRecord[] = [

  // ======================================================
  // IRONMAN TALLINN
  // ======================================================

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

    emoji:
      "🇪🇪",

    characteristics: [
      "Baltic race setting",
      "Fast flat bike",
      "Fast flat run",
      "Cool northern conditions",
      "Wind exposure",
      "PB-friendly long course",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 full-distance race is Saturday 7 August. Tallinn's race weekend runs 7–8 August 2027, with the 70.3 held the following day.",

    editions: [
      {
        year:
          2027,

        date:
          "2027-08-07",

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
        ],
      },
    ],

    sources: [
      {
        name:
          "Visit Estonia",

        url:
          "https://puhkaeestis.ee/et/ironman-tallinn-ironman-703-tallinn",

        type:
          "Trusted third party",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "2027 event weekend",
          "race identity",
          "location",
        ],
      },

      {
        name:
          "SPOFERAN IRONMAN Tallinn 2027",

        url:
          "https://spoferan.com/en/events/ironman-tallinn-2027",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
        ],
      },

      {
        name:
          "IRONMAN Tallinn",

        url:
          "https://www.ironman.com/races/im-tallinn",

        type:
          "Official",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "course character",
          "swim",
          "bike",
          "run",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 TALLINN
  // ======================================================

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

    emoji:
      "🇪🇪",

    characteristics: [
      "Baltic race setting",
      "Fast flat bike",
      "Fast flat run",
      "Cool northern conditions",
      "Wind exposure",
      "PB-friendly middle distance",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 IRONMAN 70.3 Tallinn is Sunday 8 August, one day after the full-distance race.",

    editions: [
      {
        year:
          2027,

        date:
          "2027-08-08",

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
        ],
      },
    ],

    sources: [
      {
        name:
          "Visit Estonia",

        url:
          "https://puhkaeestis.ee/et/ironman-tallinn-ironman-703-tallinn",

        type:
          "Trusted third party",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "2027 event weekend",
          "race identity",
          "location",
        ],
      },

      {
        name:
          "SPOFERAN IRONMAN 70.3 Tallinn 2027",

        url:
          "https://spoferan.com/events/ironman-703-tallinn-2027",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Tallinn",

        url:
          "https://www.ironman.com/races/im703-tallinn",

        type:
          "Official",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "swim environment",
          "bike profile",
          "run profile",
          "water temperature",
        ],
      },
    ],
  },


  // ======================================================
  // SUPERTRI CHICAGO OLYMPIC
  // ======================================================

  {
    slug:
      "chicago-triathlon-olympic",

    name:
      "Supertri Chicago Triathlon Olympic",

    shortName:
      "Chicago Triathlon",

    location:
      "Chicago, Illinois, USA",

    country:
      "United States",

    countryCode:
      "US",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇺🇸",

    characteristics: [
      "One of the world's largest city triathlons",
      "Lake Michigan swim",
      "Chicago skyline",
      "Closed urban roads",
      "Lake Shore Drive bike",
      "Grant Park finish",
      "Large beginner and age-group field",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 Supertri Chicago runs 21–22 August. Olympic and Sprint races are held Sunday 22 August.",

    editions: [
      {
        year:
          2027,

        date:
          "2027-08-22",

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
        ],
      },
    ],

    sources: [
      {
        name:
          "Supertri Chicago",

        url:
          "https://supertri.com/chicago/",

        type:
          "Organizer",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "2027 event weekend",
          "race identity",
          "swim environment",
          "course character",
        ],
      },

      {
        name:
          "ACTIVE Supertri Chicago 2027",

        url:
          "https://origin-a3.active.com/chicago-il/triathlon/supertri-chicago-2027",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "Olympic race day",
          "race formats",
        ],
      },
    ],
  },


  // ======================================================
  // HOVE TRI
  // ======================================================

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

    emoji:
      "🇳🇴",

    characteristics: [
      "Norwegian championship venue",
      "Salt-water swim",
      "1.6 km swim",
      "39 km road bike",
      "Relatively flat bike course",
      "10 km forest-floor run",
      "Non-drafting long course",
      "Coastal race setting",
    ],

    dataQuality:
      "Verified",

    notes:
      "Corrected 2027 long-course profile. Hove's normal-distance race is 1.6 km swim, 39 km bike and 10 km run rather than assumed standard 1.5/40/10 distances.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.6,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            39,

          profile:
            "Flat",
        },

        run: {
          distanceKm:
            10,

          surface:
            "Trail",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run surface",
          "course character",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-06-12",

        swim: {
          distanceKm:
            1.6,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            39,

          profile:
            "Flat",
        },

        run: {
          distanceKm:
            10,

          surface:
            "Trail",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "bike profile",
          "run surface",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Hove Tri 2027",

        url:
          "https://www.hovetri.no/race/nm2027",

        type:
          "Organizer",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "course character",
        ],
      },

      {
        name:
          "Hove Tri Lang løype",

        url:
          "https://www.hovetri.no/race/lang",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run surface",
          "course character",
        ],
      },
    ],
  },


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

    characteristics: [
      "Lac de Peyrolles swim",
      "Provence countryside",
      "Hilly bike",
      "Technical Sainte-Victoire roads",
      "Rolling city run",
      "Warm-weather racing",
      "La Rotonde finish",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current course profile verified directly from IRONMAN. No 2027 edition date is stored until the organizer publishes one.",

    editions: [
      {
        year:
          0,

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

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "bike technicality",
          "run profile",
          "run surface",
          "course character",
        ],

        dataWarning:
          "The 2027 race date has not yet been officially confirmed.",
      },
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

    characteristics: [
      "Allier River swim",
      "Calm open-water start",
      "Rolling Auvergne bike",
      "Montagne Bourbonnaise",
      "Flat fast run",
      "Lakeside city running",
      "Warm summer conditions",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current course environment and terrain verified from IRONMAN. Exact elevation and 2027 date remain intentionally unstored.",

    editions: [
      {
        year:
          0,

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

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
          "run surface",
          "course character",
        ],

        dataWarning:
          "Exact course elevation and the 2027 race date are intentionally omitted until verified.",
      },
    ],

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

    characteristics: [
      "Allier River swim",
      "Auvergne countryside",
      "Hilly long-course bike",
      "Flat city run",
      "Warm summer conditions",
      "Strong spectator support",
      "Long-course fueling",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current full-distance course character verified directly from IRONMAN. No 2027 race date or exact elevation total is stored yet.",

    editions: [
      {
        year:
          0,

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

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "water temperature",
          "bike profile",
          "run profile",
          "run surface",
          "course character",
        ],

        dataWarning:
          "Exact elevation totals and the 2027 race date are intentionally omitted until verified.",
      },
    ],

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

    dataQuality:
      "Verified",

    notes:
      "Current race profile verified directly from IRONMAN. Nice is confirmed to continue beyond 2026, but an exact 2027 race date is not stored until formally published.",

    editions: [
      {
        year:
          0,

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

        dataQuality:
          "Verified",

        verifiedFields: [
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

        dataWarning:
          "Exact total elevation and the 2027 race date remain intentionally omitted until verified.",
      },
    ],

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
    ],
  },
];
