import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V11:
  RaceImportRecord[] = [

  // ======================================================
  // NEW YORK CITY
  // ======================================================

  {
    slug:
      "big-apple-triathlon-olympic",

    name:
      "Big Apple Triathlon Olympic",

    shortName:
      "Big Apple Triathlon",

    location:
      "New York City, New York, USA",

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
      "New York City triathlon",
      "Hudson River swim",
      "West Side Highway bike",
      "Central Park run and finish",
      "Major mass-participation city event",
      "Rolling urban bike course",
      "Iconic landmark racing",
      "USAT sanctioned",
    ],

    dataQuality:
      "Verified",

    notes:
      "2026 Big Apple Triathlon is the major Manhattan city triathlon, with Olympic, Sprint, relay and aquabike formats.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "River",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            39.9,

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            10,

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
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-10-10",

        swim: {
          distanceKm:
            1.5,

          environment:
            "River",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            39.9,

          profile:
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            10,

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
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Big Apple Triathlon",

        url:
          "https://bigappletriathlon.com/info",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "course character",
        ],
      },

      {
        name:
          "Big Apple Triathlon",

        url:
          "https://bigappletriathlon.com/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "participant capacity",
          "course character",
          "race formats",
        ],
      },
    ],
  },


  // ======================================================
  // BOSTON
  // ======================================================

  {
    slug:
      "boston-triathlon-olympic",

    name:
      "Boston Triathlon Olympic",

    shortName:
      "Boston Triathlon",

    location:
      "Boston, Massachusetts, USA",

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
      "Boston's signature city triathlon",
      "Dorchester Bay swim",
      "Boston city-street bike course",
      "South Boston shoreline run",
      "Olympic and sprint distances",
      "Large urban age-group event",
    ],

    dataQuality:
      "Verified",

    notes:
      "Boston's 2026 Olympic course uses a shortened 35 km bike segment rather than a standard 40 km bike.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "Sea",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            35,

          profile:
            "Rolling",

          technicality:
            "Moderate",
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
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-08-23",

        swim: {
          distanceKm:
            1.5,

          environment:
            "Sea",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            35,

          profile:
            "Rolling",

          technicality:
            "Moderate",
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
          "race_date",
          "course distances",
          "swim environment",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Boston Triathlon",

        url:
          "https://bostontri.com/event/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "swim environment",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // STOCKHOLM
  // ======================================================

  {
    slug:
      "stockholm-triathlon-olympic",

    name:
      "STHLM Stockholm Triathlon Olympic",

    shortName:
      "Stockholm Triathlon",

    location:
      "Stockholm, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇸🇪",

    characteristics: [
      "Royal National City Park",
      "Djurgården race venue",
      "Lappis Beach swim",
      "Olympic recreational race",
      "Non-drafting Olympic bike",
      "Mixed gravel and asphalt run",
      "Accessible Nordic city race",
    ],

    dataQuality:
      "Verified",

    notes:
      "Olympic public race is the Motion-Lång non-drafting category. A 2027 Stockholm Triathlon weekend is already planned for 7–8 August.",

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
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            10,

          profile:
            "Rolling",

          surface:
            "Mixed",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "event format",
          "course character",
          "run surface",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-08-09",

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
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            10,

          profile:
            "Rolling",

          surface:
            "Mixed",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "event format",
          "course character",
          "run surface",
        ],
      },
    ],

    sources: [
      {
        name:
          "STHLM Stockholm Triathlon",

        url:
          "https://www.sthlmtriathlon.se/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "event format",
          "course character",
        ],
      },

      {
        name:
          "STHLM Triathlon Registration",

        url:
          "https://mittlopp.se/Anmalan/Arrangemangsgrupp/sthlm2026",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "course distances",
          "non-drafting format",
          "race_date",
        ],
      },

      {
        name:
          "STHLM Triathlon 2027",

        url:
          "https://www.sthlmtriathlon.se/foranmalan/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "2027 event weekend",
        ],
      },
    ],
  },


  // ======================================================
  // VALENCIA
  // ======================================================

  {
    slug:
      "mtri-valencia-olympic",

    name:
      "MTRI Valencia Olympic",

    shortName:
      "Valencia Triathlon",

    location:
      "Valencia, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇪🇸",

    characteristics: [
      "Major Mediterranean city triathlon",
      "Sea swim",
      "Very flat Valencia terrain",
      "Fast urban racing",
      "Large Spanish age-group field",
      "Olympic category",
      "Warm-water summer race",
    ],

    dataQuality:
      "Verified",

    notes:
      "The actual 2026 Olympic course measured 1.5 km swim, 36 km bike and 9.699 km run. TriCoach stores the published race distances rather than assuming standard 40/10 values.",

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
            36,

          profile:
            "Flat",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            9.699,

          profile:
            "Flat",

          surface:
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "course distances",
          "course character",
          "race category",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-06-28",

        swim: {
          distanceKm:
            1.5,

          environment:
            "Sea",

          expectedWaterTempC:
            24.1,
        },

        bike: {
          distanceKm:
            36,

          profile:
            "Flat",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            9.699,

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
          "water temperature",
          "race category",
        ],
      },
    ],

    sources: [
      {
        name:
          "Federació de Triatló de la Comunitat Valenciana",

        url:
          "https://resultados.triatlocv.org/results/260545/general",

        type:
          "Federation",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "water temperature",
          "race category",
          "participant count",
        ],
      },

      {
        name:
          "Visit Valencia",

        url:
          "https://www.visitvalencia.com/en/what-to-do-valencia/sporting-activities/sports-companies/triathlon",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "event identity",
          "city triathlon history",
          "course character",
        ],
      },
    ],
  },


  // ======================================================
  // MONTREAL
  // ======================================================

  {
    slug:
      "challenge-esprit-montreal-olympic",

    name:
      "SAIL Challenge Esprit Montréal Olympic",

    shortName:
      "Esprit Montréal",

    location:
      "Montréal, Québec, Canada",

    country:
      "Canada",

    countryCode:
      "CA",

    series:
      "Challenge",

    format:
      "Olympic",

    emoji:
      "🇨🇦",

    characteristics: [
      "Historic Montréal triathlon",
      "More than 3,000 athletes",
      "1976 Olympic Basin swim",
      "Circuit Gilles-Villeneuve bike",
      "Extremely flat course",
      "F1 circuit racing",
      "Olympic, Sprint and Middle distances",
      "PB-friendly city event",
    ],

    dataQuality:
      "Verified",

    notes:
      "Challenge Esprit Montréal is one of Canada's major triathlon festivals and offers Olympic, Sprint and Middle-distance racing.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "Open water",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            40,

          profile:
            "Flat",

          technicality:
            "Low",
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
          "event format",
          "bike profile",
          "run profile",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-09-13",

        swim: {
          distanceKm:
            1.5,

          environment:
            "Open water",

          wetsuitLikely:
            true,
        },

        bike: {
          distanceKm:
            40,

          profile:
            "Flat",

          technicality:
            "Low",
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
          "race_date",
          "course distances",
          "event format",
          "bike profile",
          "run profile",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "SAIL Challenge Esprit Montréal",

        url:
          "https://challenge-espritmontreal.com/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "event dates",
          "course distances",
          "race formats",
        ],
      },

      {
        name:
          "Challenge Family · Montréal",

        url:
          "https://www.challenge-family.com/challenge-family/races/challenge-montreal/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "participant scale",
          "race formats",
          "course character",
        ],
      },

      {
        name:
          "Parc Jean-Drapeau",

        url:
          "https://www.parcjeandrapeau.com/en/challenge-esprit-montreal-triathlon-athletes-olympic-basin-circuit-gilles-villeneuve/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "event dates",
          "bike profile",
          "run profile",
          "venue",
        ],
      },
    ],
  },
];
