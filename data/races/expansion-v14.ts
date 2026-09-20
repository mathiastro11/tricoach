import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-01";


export const RACE_EXPANSION_V14:
  RaceImportRecord[] = [

  // ======================================================
  // IRONMAN VITORIA-GASTEIZ
  // ======================================================

  {
    slug:
      "ironman-vitoria-gasteiz",

    name:
      "IRONMAN Vitoria-Gasteiz",

    shortName:
      "IRONMAN Vitoria-Gasteiz",

    location:
      "Vitoria-Gasteiz, Spain",

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

    characteristics: [
      "Ullíbarri-Gamboa lake swim",
      "Rolling Basque bike",
      "Fast bike course",
      "Flat city marathon",
      "Basque countryside",
      "Strong spectator support",
      "First-timer friendly long course",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 race date is 11 July. Current course profile is verified from IRONMAN. Exact elevation totals are intentionally omitted because available published and GPX-derived values differ.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Lake",

          expectedWaterTempC:
            21,
        },

        bike: {
          distanceKm:
            180.2,

          profile:
            "Rolling",

          technicality:
            "Moderate",
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
          "Exact bike and run elevation totals remain intentionally unstored until a stable current source is available.",
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
          "IRONMAN Vitoria-Gasteiz Course",

        url:
          "https://www.ironman.com/races/im-vitoria/course",

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
          "Nirvana IRONMAN Vitoria-Gasteiz",

        url:
          "https://nirvanaeurope.com/book-event/?eventid=IMEUVIT",

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

      {
        name:
          "TriSonen 2027 calendar",

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
  // IRONMAN 70.3 OMAN
  // ======================================================

  {
    slug:
      "ironman-703-oman",

    name:
      "IRONMAN 70.3 Oman",

    shortName:
      "70.3 Oman",

    location:
      "Muscat, Oman",

    country:
      "Oman",

    countryCode:
      "OM",

    series:
      "IRONMAN",

    format:
      "70.3",

    emoji:
      "🇴🇲",

    characteristics: [
      "Qurum Beach sea swim",
      "Warm clear water",
      "Rolling Muscat bike",
      "Flat fast run",
      "Urban coastal racing",
      "Warm-weather racing",
      "Middle East Championship",
    ],

    dataQuality:
      "Verified",

    notes:
      "Corrected edition history: the 2026 race was 14 February, not 5 December. The next edition is 6 February 2027.",

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
            22,
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
          "Exact elevation totals are intentionally omitted until verified from a stable course source.",
      },

      {
        year:
          2026,

        date:
          "2026-02-14",

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",

          expectedWaterTempC:
            22,
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
          "race_date",
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-02-06",

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
          "IRONMAN 70.3 Oman Course",

        url:
          "https://www.ironman.com/races/im703-oman/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "swim environment",
          "bike profile",
          "run profile",
          "water temperature",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Oman 2026 Schedule",

        url:
          "https://www.ironman.com/races/im703-oman/schedule",

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

      {
        name:
          "IRONMAN 70.3 Oman",

        url:
          "https://www.ironman.com/races/im703-oman",

        type:
          "Official",

        editionYear:
          2027,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "race identity",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN OMAN
  // ======================================================

  {
    slug:
      "ironman-oman",

    name:
      "IRONMAN Oman",

    shortName:
      "IRONMAN Oman",

    location:
      "Muscat, Oman",

    country:
      "Oman",

    countryCode:
      "OM",

    series:
      "IRONMAN",

    format:
      "Ironman",

    emoji:
      "🇴🇲",

    characteristics: [
      "Qurum Beach sea swim",
      "Warm Gulf of Oman water",
      "Rolling Muscat bike",
      "Coastal and urban bike course",
      "Flat fast run",
      "Inaugural full-distance race",
      "Warm-weather long course",
    ],

    dataQuality:
      "Verified",

    notes:
      "The inaugural full-distance IRONMAN Oman takes place 5 December 2026. Current course profile is verified directly from IRONMAN.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          expectedWaterTempC:
            24,
        },

        bike: {
          distanceKm:
            180,

          profile:
            "Rolling",
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
          "Exact elevation totals are intentionally omitted until verified.",
      },

      {
        year:
          2026,

        date:
          "2026-12-05",

        swim: {
          distanceKm:
            3.8,

          environment:
            "Sea",

          expectedWaterTempC:
            24,
        },

        bike: {
          distanceKm:
            180,

          profile:
            "Rolling",
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
          "race_date",
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN Oman Course",

        url:
          "https://www.ironman.com/races/im-oman/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN Oman",

        url:
          "https://www.ironman.com/races/im-oman",

        type:
          "Official",

        editionYear:
          2026,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race_date",
          "race identity",
          "water temperature",
        ],
      },
    ],
  },


  // ======================================================
  // IRONMAN 70.3 AGADIR
  // ======================================================

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

    emoji:
      "🇲🇦",

    characteristics: [
      "Sheltered Atlantic bay swim",
      "Calm clear water",
      "Rolling inland bike",
      "Hills and plateaus",
      "Taghazout coastline",
      "Flat Atlantic promenade run",
      "Warm late-season racing",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current course terrain verified directly from IRONMAN. Exact elevation remains intentionally omitted.",

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
            21,
        },

        bike: {
          distanceKm:
            90,

          profile:
            "Rolling",

          technicality:
            "Moderate",
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
          "Exact elevation totals are intentionally omitted until verified.",
      },

      {
        year:
          2026,

        date:
          "2026-10-25",

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",

          expectedWaterTempC:
            21,
        },

        bike: {
          distanceKm:
            90,

          profile:
            "Rolling",

          technicality:
            "Moderate",
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
          "race_date",
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN 70.3 Agadir Course",

        url:
          "https://www.ironman.com/races/im703-agadir/course",

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
          "IRONMAN 70.3 Agadir",

        url:
          "https://www.ironman.com/races/im703-agadir",

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


  // ======================================================
  // IRONMAN 70.3 COSTA NAVARINO
  // ======================================================

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

    emoji:
      "🇬🇷",

    characteristics: [
      "Protected Gialova Bay swim",
      "23°C typical water",
      "Rolling coastal bike",
      "857 m bike climbing",
      "Olive-grove roads",
      "Flat lagoon run",
      "36 m run climbing",
      "Mediterranean late-season racing",
    ],

    dataQuality:
      "Verified",

    notes:
      "Course elevation is published directly by IRONMAN: 857 m bike and 36 m run.",

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

          elevationGainM:
            857,

          elevationDisplay:
            "857 m",

          profile:
            "Rolling",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            36,

          elevationDisplay:
            "36 m",

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
          "bike elevation",
          "bike profile",
          "run elevation",
          "run profile",
          "run surface",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-10-25",

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

          elevationGainM:
            857,

          elevationDisplay:
            "857 m",

          profile:
            "Rolling",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            36,

          elevationDisplay:
            "36 m",

          profile:
            "Flat",

          surface:
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "bike elevation",
          "bike profile",
          "run elevation",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN 70.3 Costa Navarino Course",

        url:
          "https://www.ironman.com/races/im703-greece/course",

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
          "bike elevation",
          "bike profile",
          "run elevation",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Costa Navarino Registration",

        url:
          "https://www.ironman.com/races/im703-greece/register",

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


  // ======================================================
  // IRONMAN 70.3 POREC
  // ======================================================

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

    emoji:
      "🇭🇷",

    characteristics: [
      "Protected Adriatic cove swim",
      "Rolling Istrian bike",
      "600 m bike climbing",
      "Vineyards and olive groves",
      "Fast highway section",
      "Rolling coastal run",
      "150 m run climbing",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current IRONMAN course page publishes 600 m bike elevation and 150 m run elevation.",

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
            600,

          elevationDisplay:
            "600 m",

          profile:
            "Rolling",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            150,

          elevationDisplay:
            "150 m",

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
          "bike elevation",
          "bike profile",
          "run elevation",
          "run profile",
          "run surface",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-10-18",

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
            600,

          elevationDisplay:
            "600 m",

          profile:
            "Rolling",
        },

        run: {
          distanceKm:
            21.1,

          elevationGainM:
            150,

          elevationDisplay:
            "150 m",

          profile:
            "Rolling",

          surface:
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "bike elevation",
          "bike profile",
          "run elevation",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN 70.3 Poreč Course",

        url:
          "https://www.ironman.com/races/im703-croatia/course",

        type:
          "Official",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "bike elevation",
          "bike profile",
          "run elevation",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "IRONMAN 70.3 Poreč Registration",

        url:
          "https://www.ironman.com/races/im703-croatia/register",

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


  // ======================================================
  // IRONMAN 70.3 WEYMOUTH
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

    emoji:
      "🇬🇧",

    characteristics: [
      "Jurassic Coast sea swim",
      "17°C typical water",
      "Rolling Dorset bike",
      "Rural countryside",
      "Flat seaside run",
      "Coastal wind exposure",
      "First-timer friendly",
    ],

    dataQuality:
      "Verified",

    notes:
      "Current terrain and course character verified directly from IRONMAN. Exact elevation totals remain intentionally omitted.",

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
            17,
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
          "Exact bike and run elevation totals are intentionally omitted until verified from a stable source.",
      },

      {
        year:
          2026,

        date:
          "2026-09-20",

        swim: {
          distanceKm:
            1.9,

          environment:
            "Sea",

          expectedWaterTempC:
            17,
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
          "race_date",
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
        ],
      },
    ],

    sources: [
      {
        name:
          "IRONMAN 70.3 Weymouth Course",

        url:
          "https://www.ironman.com/races/im703-weymouth/course",

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
          "IRONMAN 70.3 Weymouth Schedule",

        url:
          "https://www.ironman.com/races/im703-weymouth/schedule",

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
