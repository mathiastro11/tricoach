import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-02";


export const RACE_EXPANSION_V17:
  RaceImportRecord[] = [

  // ======================================================
  // TØNSBERGDYSTEN
  // ======================================================

  {
    slug:
      "tonsbergdysten",

    name:
      "Tønsbergdysten",

    shortName:
      "Tønsbergdysten",

    location:
      "Ringshaug, Tønsberg, Norway",

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

    dataQuality:
      "Verified",

    characteristics: [
      "Ringshaugstranda swim",
      "Sheltered Oslofjord bay",
      "Road bike",
      "Mixed trail and asphalt run",
      "Coastal course",
      "Beginner-friendly sprint",
    ],

    notes:
      "2026 Sprint is 750 m swim, 20 km bike and 5 km run. The swim is in a sheltered bay at Ringshaugstranda in the Oslofjord, and the run combines trail and asphalt.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            0.75,

          environment:
            "Fjord",
        },

        bike: {
          distanceKm:
            20,
        },

        run: {
          distanceKm:
            5,

          surface:
            "Mixed",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "run surface",
          "course character",
        ],

        dataWarning:
          "Exact bike/run elevation and terrain profile classifications are intentionally unstored.",
      },

      {
        year:
          2026,

        date:
          "2026-09-20",

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
          "Tønsberg Triathlonklubb",

        url:
          "https://www.tonsbergtri.no/next/p/27068/-",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "course distances",
          "swim environment",
          "run surface",
          "course character",
        ],
      },

      {
        name:
          "Norges Triatlonforbund",

        url:
          "https://triatlonforbundet.no/terminliste/terminliste-2026/toensbergdysten/",

        type:
          "Federation",

        editionYear:
          2026,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "Sprint category",
          "course distances",
        ],
      },
    ],
  },


  // ======================================================
  // BRANDEFANT
  // ======================================================

  {
    slug:
      "brandefant-triathlon",

    name:
      "Brandefant Triathlon Race",

    shortName:
      "Brandefant",

    location:
      "Imingfjell, Uvdal, Norway",

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

    dataQuality:
      "Verified",

    characteristics: [
      "Olympic+ mountain triathlon",
      "Sønstevatn lake swim at 1,060 m",
      "40 km gravel bike",
      "12.5 km mountain run",
      "Mixed gravel and trail run",
      "Run reaches approximately 1,370 m altitude",
      "More than 1,000 m climbing across the full race",
      "Hardangervidda terrain",
    ],

    notes:
      "Organizer course is 1.5 km swim, 40 km gravel bike and 12.5 km mountain run. The organizer states more than 1,000 m climbing across the full 55 km race. TriCoach no longer assigns that total climbing figure to the bike discipline alone.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            40,
        },

        run: {
          distanceKm:
            12.5,

          profile:
            "Mountainous",

          surface:
            "Mixed",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "bike surface character",
          "run profile",
          "run surface",
          "total course elevation character",
        ],

        dataWarning:
          "The organizer publishes more than 1,000 m total climbing for the complete race, but does not split that figure between bike and run. Discipline-specific elevation is therefore intentionally blank.",
      },

      {
        year:
          2026,

        date:
          "2026-08-08",

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
          "Brandefant Triathlon Race",

        url:
          "https://brandefant.no/",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "course distances",
          "swim environment",
          "bike surface character",
          "run profile",
          "run surface",
          "total course elevation character",
        ],
      },

      {
        name:
          "Norges Triatlonforbund",

        url:
          "https://www.triatlonforbundet.no/terminliste/terminliste-2026/brandefant-triathlon-race-2026/",

        type:
          "Federation",

        editionYear:
          2026,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "race identity",
          "Olympic+ course character",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 SWANSEA
  // ======================================================

  {
    slug:
      "ironman-703-swansea",

    name:
      "IRONMAN 70.3 Swansea",

    shortName:
      "70.3 Swansea",

    location:
      "Swansea, Wales",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇬🇧",

    dataQuality:
      "Verified",

    characteristics: [
      "Prince of Wales Dock swim",
      "Sea swim",
      "Gower Peninsula bike",
      "Hilly coastal cycling",
      "Exposed coastal conditions",
      "Flat waterfront run",
      "Welsh weather variability",
    ],

    notes:
      "2027 race date is 11 July. IRONMAN classifies the course as Sea swim, Hilly bike and Flat run. Exact elevation totals remain intentionally omitted.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            90,

          profile:
            "Hilly",
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
          "bike profile",
          "run profile",
          "run surface",
          "course character",
        ],

        dataWarning:
          "Exact bike and run elevation totals remain intentionally unstored.",
      },

      {
        year:
          2027,

        date:
          "2027-07-11",

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
          "IRONMAN 70.3 Swansea",

        url:
          "https://www.ironman.com/races/im703-swansea",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "Visit Swansea Bay",

        url:
          "https://www.visitswanseabay.com/summer-sport/ironman/",

        type:
          "Trusted third party",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
          "course route",
        ],
      },
    ],
  },


  // ======================================================
  // CHALLENGE PEGUERA MALLORCA
  // ======================================================

  {
    slug:
      "challenge-peguera-mallorca",

    name:
      "Challenge Peguera Mallorca",

    shortName:
      "Challenge Mallorca",

    location:
      "Peguera, Mallorca, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "Challenge",

    format:
      "70.3",

    emoji:
      "🇪🇸",

    dataQuality:
      "Verified",

    characteristics: [
      "Torà Beach Mediterranean swim",
      "Technical bike course",
      "Rolling and hilly bike sections",
      "Approximately 960 m bike climbing",
      "Fast descending sections",
      "Peguera boulevard run",
      "Mixed urban running surfaces",
    ],

    notes:
      "2026 race is 17 October. Current organizer course information describes a technical bike with rolling and hilly sections. Published elevation is approximately 480 m per 45 km lap, or about 960 m across the 90 km bike. The run uses concrete, asphalt and non-slip tiled sections.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            90,

          elevationGainM:
            960,

          elevationDisplay:
            "~960 m",

          profile:
            "Hilly",
        },

        run: {
          distanceKm:
            21.1,

          surface:
            "Mixed",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "swim environment",
          "bike elevation",
          "bike profile",
          "run surface",
          "course character",
        ],

        dataWarning:
          "Exact run elevation and a categorical run profile remain intentionally unstored.",
      },

      {
        year:
          2026,

        date:
          "2026-10-17",

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
          "Challenge Mallorca Course",

        url:
          "https://challenge-mallorca.com/courses/",

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

      {
        name:
          "Challenge Mallorca Circuit",

        url:
          "https://challenge-mallorca.com/circuitos/?lang=es",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "bike elevation",
          "bike profile",
          "course character",
        ],
      },

      {
        name:
          "Challenge Family",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-peguera-mallorca/",

        type:
          "Organizer",

        editionYear:
          2026,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "course distances",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN BARCELONA
  // ======================================================

  {
    slug:
      "ironman-calella-barcelona",

    name:
      "IRONMAN Calella-Barcelona",

    shortName:
      "IRONMAN Barcelona",

    location:
      "Calella, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇪🇸",

    dataQuality:
      "Verified",

    characteristics: [
      "Mediterranean sea swim",
      "Flat fast bike course",
      "Flat run",
      "Coastal racing",
      "Personal-best potential",
      "Late-season European IRONMAN",
    ],

    notes:
      "IRONMAN officially classifies the Calella-Barcelona course as Ocean swim, Flat bike and Flat run. The previous TriCoach Rolling bike classification has been corrected.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            180,

          profile:
            "Flat",
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
          "bike profile",
          "run profile",
          "run surface",
          "course character",
        ],

        dataWarning:
          "Exact bike and run elevation totals remain intentionally unstored.",
      },

      {
        year:
          2026,

        date:
          "2026-10-04",

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
          "IRONMAN Calella-Barcelona",

        url:
          "https://www.ironman.com/races/im-barcelona",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN Calella-Barcelona 2026",

        url:
          "https://www.ironman.com/races/im-barcelona",

        type:
          "Official",

        editionYear:
          2026,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
        ],
      },
    ],
  },
];
