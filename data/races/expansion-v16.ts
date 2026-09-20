import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-01";


export const RACE_EXPANSION_V16:
  RaceImportRecord[] = [

  // ======================================================
  // OSLO TRIATLON SPRINT
  // ======================================================

  {
    slug:
      "oslo-triatlon-sprint",

    name:
      "Oslo Triatlon Sprint",

    shortName:
      "Oslo Triatlon Sprint",

    location:
      "Sognsvann, Oslo, Norway",

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

    characteristics: [
      "Sognsvann lake swim",
      "Maridalen bike course",
      "23 km non-drafting bike",
      "Forest-road run around Sognsvann",
      "Beginner-friendly sprint",
      "Historic Oslo race",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 race date is 14 August. Organizer course information gives 750 m swim, 23 km bike and 5 km run. The run is on forest roads around Sognsvann.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            0.75,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            23,
        },

        run: {
          distanceKm:
            5,

          surface:
            "Trail",
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
          "Bike and run elevation/profile classifications remain intentionally unstored until a stable current source explicitly supports them.",
      },

      {
        year:
          2027,

        date:
          "2027-08-14",

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
          "Oslo Triatlon Sprint",

        url:
          "https://oslotri.com/sprint/",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim environment",
          "run surface",
          "course character",
        ],
      },

      {
        name:
          "Oslo Triatlon",

        url:
          "https://oslotri.com/",

        type:
          "Organizer",

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
  // LONDON SPRINT
  // ======================================================

  {
    slug:
      "london-triathlon-sprint",

    name:
      "London T100 Sprint Triathlon",

    shortName:
      "London Triathlon Sprint",

    location:
      "Royal Victoria Dock, London, United Kingdom",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "Independent",

    format:
      "Sprint",

    emoji:
      "🇬🇧",

    characteristics: [
      "Royal Victoria Dock swim",
      "Freshwater swim",
      "Flat closed-road bike",
      "Flat city run",
      "Classic sprint distance",
      "London city racing",
    ],

    dataQuality:
      "Verified",

    notes:
      "T100 explicitly lists the 2027 Sprint Triathlon for Saturday 21 August. The event describes the swim as freshwater and both bike and run as flat.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            0.75,

          environment:
            "Open water",
        },

        bike: {
          distanceKm:
            20,

          profile:
            "Flat",
        },

        run: {
          distanceKm:
            5,

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
      },

      {
        year:
          2027,

        date:
          "2027-08-21",

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
          "London T100 Triathlon",

        url:
          "https://t100triathlon.com/london/participate/",

        type:
          "Organizer",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "course distances",
          "swim environment",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        name:
          "London T100 Triathlon 2027 Sprint",

        url:
          "https://t100triathlon.com/london/participate/",

        type:
          "Organizer",

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
  // LONDON OLYMPIC
  // ======================================================

  {
    slug:
      "london-t100-olympic",

    name:
      "London T100 Olympic Triathlon",

    shortName:
      "London Triathlon",

    location:
      "Royal Victoria Dock, London, United Kingdom",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇬🇧",

    characteristics: [
      "Royal Victoria Dock swim",
      "Freshwater swim",
      "Flat closed-road bike",
      "Flat city run",
      "Olympic-distance city race",
      "London landmarks",
    ],

    dataQuality:
      "Verified",

    notes:
      "T100 explicitly lists the 2027 Olympic Triathlon for Sunday 22 August. Course terrain remains freshwater / flat / flat.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "Open water",
        },

        bike: {
          distanceKm:
            40,

          profile:
            "Flat",
        },

        run: {
          distanceKm:
            10,

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
      },

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
          "London T100 Triathlon",

        url:
          "https://t100triathlon.com/london/participate/",

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
          "run profile",
          "run surface",
          "course character",
        ],
      },

      {
        name:
          "London T100 Olympic 2027",

        url:
          "https://t100triathlon.com/london/participate/",

        type:
          "Organizer",

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
  // CHALLENGE BARCELONA SPRINT
  // ======================================================

  {
    slug:
      "barcelona-triathlon-sprint",

    name:
      "Challenge Barcelona Triatló Sprint",

    shortName:
      "Barcelona Sprint",

    location:
      "Barcelona, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "Challenge",

    format:
      "Sprint",

    emoji:
      "🇪🇸",

    characteristics: [
      "Mar Bella beach swim",
      "Protected Mediterranean swim",
      "Flat fast coastal bike",
      "Barcelona seafront run",
      "City-centre racing",
      "Classic sprint distance",
    ],

    dataQuality:
      "Verified",

    notes:
      "Challenge Family confirms the Sprint distance as 750 m / 20 km / 5 km and describes the bike course as flat and fast. No 2027 date is stored until formally published.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            0.75,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            20,

          profile:
            "Flat",
        },

        run: {
          distanceKm:
            5,

          surface:
            "Road",
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

        dataWarning:
          "The 2027 race date and exact elevation totals remain intentionally unstored.",
      },
    ],

    sources: [
      {
        name:
          "Challenge Barcelona Triathlon",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-barcelona/",

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
          "bike profile",
          "run surface",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // CHALLENGE BARCELONA OLYMPIC
  // ======================================================

  {
    slug:
      "challenge-barcelona-triatlo-olympic",

    name:
      "Challenge Barcelona Triatló Olympic",

    shortName:
      "Barcelona Triathlon",

    location:
      "Barcelona, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "Challenge",

    format:
      "Olympic",

    emoji:
      "🇪🇸",

    characteristics: [
      "Mar Bella beach swim",
      "Protected Mediterranean swim",
      "Flat fast coastal bike",
      "Barcelona seafront run",
      "City-centre racing",
      "Olympic distance",
    ],

    dataQuality:
      "Verified",

    notes:
      "Course profile upgraded using current Challenge Barcelona course information. Exact elevation totals and a future 2027 race date remain intentionally unstored.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "Sea",
        },

        bike: {
          distanceKm:
            40,

          profile:
            "Flat",
        },

        run: {
          distanceKm:
            10,

          surface:
            "Road",
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
    ],

    sources: [
      {
        name:
          "Challenge Barcelona Triathlon",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-barcelona/",

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
          "bike profile",
          "run surface",
          "course character",
        ],
      },

      {
        name:
          "Barcelona City Council Challenge Barcelona 2026",

        url:
          "https://guia.barcelona.cat/en/agenda/detall/challenge-barcelona-triathlon-2026_99400228908.html",

        type:
          "Trusted third party",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "Olympic course distances",
          "Sprint course distances",
        ],
      },
    ],
  },


  // ======================================================
  // STOCKHOLM SPRINT
  // ======================================================

  {
    slug:
      "stockholm-triathlon-sprint",

    name:
      "STHLM Stockholm Triathlon Sprint",

    shortName:
      "Stockholm Triathlon Sprint",

    location:
      "Djurgården, Stockholm, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    series:
      "Independent",

    format:
      "Sprint",

    emoji:
      "🇸🇪",

    characteristics: [
      "Lappis Beach swim",
      "Royal National City Park",
      "20 km lap-course bike",
      "Mostly gravel run",
      "Some asphalt running",
      "Drafting and non-drafting categories",
      "Nordic city race",
    ],

    dataQuality:
      "Verified",

    notes:
      "Sprint distance is verified as 750 m / 20 km / 5 km. The run is mostly gravel with some asphalt. A 2027 event weekend is planned for 7–8 August, but the exact Sprint race day is not yet stored.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            0.75,

          environment:
            "Open water",
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
          "The exact 2027 Sprint race day and elevation/profile classifications remain intentionally unstored.",
      },
    ],

    sources: [
      {
        name:
          "STHLM Triathlon",

        url:
          "https://www.sthlmtriathlon.se/",

        type:
          "Organizer",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "Sprint category",
          "course venue",
        ],
      },

      {
        name:
          "Wolffwear Stockholm Triathlon",

        url:
          "https://wolffwear.se/en/stockholm-triathlon-2026.html",

        type:
          "Organizer",

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "course distances",
          "swim venue",
          "run surface",
          "course character",
        ],
      },

      {
        name:
          "STHLM Triathlon 2027 pre-registration",

        url:
          "https://www.sthlmtriathlon.se/foranmalan/",

        type:
          "Organizer",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "2027 event weekend",
        ],
      },
    ],
  },


  // ======================================================
  // SUPERTRI CHICAGO SPRINT
  // ======================================================

  {
    slug:
      "chicago-triathlon-sprint",

    name:
      "Supertri Chicago Triathlon Sprint",

    shortName:
      "Chicago Sprint",

    location:
      "Chicago, Illinois, USA",

    country:
      "United States",

    countryCode:
      "US",

    series:
      "Independent",

    format:
      "Sprint",

    emoji:
      "🇺🇸",

    characteristics: [
      "Lake Michigan swim",
      "Monroe Harbor start",
      "Closed Lake Shore Drive",
      "Lower Wacker Drive",
      "McCormick Place Busway",
      "Urban lakefront run",
      "Longer-than-standard Sprint bike",
    ],

    dataQuality:
      "Verified",

    notes:
      "Supertri's current Sprint listing uses 0.47 mile swim, 15 mile bike and 3.1 mile run. TriCoach stores these as approximately 0.75 km / 24.1 km / 5 km. The 2027 event runs 21–22 August, but the exact individual Sprint race day is not yet stored.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            0.75,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            24.1,
        },

        run: {
          distanceKm:
            5,

          surface:
            "Road",
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
          "The exact 2027 individual Sprint race day and course elevation totals remain intentionally unstored.",
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

        editionYear:
          0,

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "race identity",
          "course distances",
          "swim environment",
          "bike route",
          "run route",
          "course character",
        ],
      },

      {
        name:
          "ACTIVE Supertri Chicago 2027",

        url:
          "https://www.active.com/chicago-il/triathlon/supertri-chicago-2027",

        type:
          "Trusted third party",

        verifiedAt:
          VERIFIED_AT,

        supportsFields: [
          "2027 event weekend",
          "Sprint category",
        ],
      },
    ],
  },
];
