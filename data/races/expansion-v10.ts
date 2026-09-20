import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V10:
  RaceImportRecord[] = [

  // ======================================================
  // TORONTO
  // ======================================================

  {
    slug:
      "supertri-toronto-olympic",

    name:
      "Supertri Toronto Olympic",

    shortName:
      "Toronto Triathlon",

    location:
      "Toronto, Ontario, Canada",

    country:
      "Canada",

    countryCode:
      "CA",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇨🇦",

    characteristics: [
      "Major North American city triathlon",
      "Lake Ontario swim",
      "Olympic and sprint race options",
      "Downtown Toronto course",
      "Large age-group field",
      "National championship weekend",
      "Urban closed-road racing",
    ],

    dataQuality:
      "Verified",

    notes:
      "2026 Olympic race starts on 26 July as part of the Supertri Toronto weekend.",

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
          "event format",
          "swim environment",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-07-26",

        swim: {
          distanceKm:
            1.5,

          environment:
            "Lake",
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
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "event format",
          "swim environment",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Supertri Toronto",

        url:
          "https://supertri.com/toronto-triathlon/schedule/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "olympic distance",
          "sprint distance",
          "schedule",
        ],
      },

      {
        name:
          "Triathlon Ontario",

        url:
          "https://www.triathlonontario.com/race/toronto-triathlon-festival",

        type:
          "Federation",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "event scale",
          "event format",
        ],
      },
    ],
  },


  // ======================================================
  // GENEVA
  // ======================================================

  {
    slug:
      "geneva-triathlon-standard",

    name:
      "Genève Triathlon Standard",

    shortName:
      "Geneva Triathlon",

    location:
      "Geneva, Switzerland",

    country:
      "Switzerland",

    countryCode:
      "CH",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇨🇭",

    characteristics: [
      "Lake Geneva swim",
      "Central Geneva race village",
      "Olympic-distance mass participation",
      "330 m bike climbing",
      "Lakeside run",
      "City-centre atmosphere",
      "International field",
    ],

    dataQuality:
      "Verified",

    notes:
      "Standard race data verified directly from Genève Triathlon.",

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

          elevationGainM:
            330,

          elevationDisplay:
            "330 m",

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
          "bike elevation",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-07-04",

        swim: {
          distanceKm:
            1.5,

          environment:
            "Lake",
        },

        bike: {
          distanceKm:
            40,

          elevationGainM:
            330,

          elevationDisplay:
            "330 m",

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
          "bike elevation",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Genève Triathlon",

        url:
          "https://www.genevetriathlon.ch/en/races/standard",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "course distances",
          "bike elevation",
          "swim environment",
        ],
      },
    ],
  },


  // ======================================================
  // LAUSANNE
  // ======================================================

  {
    slug:
      "lausanne-triathlon-olympic",

    name:
      "Triathlon of Lausanne Olympic",

    shortName:
      "Lausanne Triathlon",

    location:
      "Lausanne, Switzerland",

    country:
      "Switzerland",

    countryCode:
      "CH",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇨🇭",

    characteristics: [
      "Lake Geneva swim",
      "Ouchy waterfront",
      "Olympic-distance flagship race",
      "Major Swiss age-group event",
      "Urban lakeside racing",
      "Multiple public race formats",
    ],

    dataQuality:
      "Verified",

    notes:
      "Olympic race format and 2026 event weekend verified through Lausanne Tourism.",

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
          "event format",
          "course character",
        ],
      },

      {
        year:
          2026,

        date:
          "2026-08-30",

        swim: {
          distanceKm:
            1.5,

          environment:
            "Lake",
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
            "Road",
        },

        dataQuality:
          "Verified",

        verifiedFields: [
          "race_date",
          "course distances",
          "swim environment",
          "event format",
          "course character",
        ],

        dataWarning:
          "The organizer weekend is 29–30 August 2026. This profile uses 30 August for the Olympic-distance race.",
      },
    ],

    sources: [
      {
        name:
          "Lausanne Tourism",

        url:
          "https://www.lausanne-tourisme.ch/en/event/triathlon-of-lausanne/triathlon-of-lausanne/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "event dates",
          "course distances",
          "swim environment",
          "event character",
        ],
      },
    ],
  },


  // ======================================================
  // BERLIN
  // ======================================================

  {
    slug:
      "berlin-triathlon-olympic",

    name:
      "S-Bahn Berlin Triathlon Olympic",

    shortName:
      "Berlin Triathlon",

    location:
      "Berlin, Germany",

    country:
      "Germany",

    countryCode:
      "DE",

    series:
      "Independent",

    format:
      "Olympic",

    emoji:
      "🇩🇪",

    characteristics: [
      "Major Berlin city triathlon",
      "River swim",
      "Treptower Park race centre",
      "Olympic and sprint distances",
      "Draft-legal age-group racing",
      "Urban multi-lap bike",
      "Large recreational field",
    ],

    dataQuality:
      "Verified",

    notes:
      "2027 event weekend and Olympic format verified directly from Berlin Triathlon.",

    editions: [
      {
        year:
          0,

        swim: {
          distanceKm:
            1.5,

          environment:
            "River",
        },

        bike: {
          distanceKm:
            40,

          profile:
            "Flat",

          technicality:
            "High",
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
          "draft-legal format",
          "course character",
        ],
      },

      {
        year:
          2027,

        date:
          "2027-06-06",

        swim: {
          distanceKm:
            1.5,

          environment:
            "River",
        },

        bike: {
          distanceKm:
            40,

          profile:
            "Flat",

          technicality:
            "High",
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
          "draft-legal format",
          "course character",
        ],
      },
    ],

    sources: [
      {
        name:
          "Berlin Triathlon",

        url:
          "https://www.berlintriathlon.de/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "event weekend",
          "race formats",
          "course character",
        ],
      },

      {
        name:
          "Berlin Triathlon Schedule",

        url:
          "https://www.berlintriathlon.de/Ausschreibung/Zeitplan/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "race_date",
          "olympic race",
        ],
      },
    ],
  },


  // ======================================================
  // AUCKLAND
  // ======================================================

  {
    slug:
      "auckland-triathlon-festival-sprint",

    name:
      "Auckland Triathlon Festival Sprint",

    shortName:
      "Auckland Triathlon",

    location:
      "Auckland, New Zealand",

    country:
      "New Zealand",

    countryCode:
      "NZ",

    series:
      "Independent",

    format:
      "Sprint",

    emoji:
      "🇳🇿",

    characteristics: [
      "Auckland waterfront race",
      "Wynyard Quarter",
      "Age-group sprint",
      "Oceania elite racing weekend",
      "Large urban multisport festival",
      "Harbour-city atmosphere",
    ],

    dataQuality:
      "Partial",

    notes:
      "Age-group sprint is confirmed as part of the Auckland Triathlon Festival. The 2026 World Triathlon event was rescheduled, so edition handling is deliberately conservative.",

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
            "Rolling",

          technicality:
            "Moderate",
        },

        run: {
          distanceKm:
            5,

          profile:
            "Rolling",

          surface:
            "Road",
        },

        dataQuality:
          "Partial",

        verifiedFields: [
          "event identity",
          "sprint format",
          "location",
          "course character",
        ],

        dataWarning:
          "Exact next age-group race date is intentionally not stored until the organizer publishes a stable schedule.",
      },
    ],

    sources: [
      {
        name:
          "NZ Triathlon Festival",

        url:
          "https://trifestival.kiwi/",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "event identity",
          "age-group race",
          "sprint format",
        ],
      },

      {
        name:
          "World Triathlon Auckland",

        url:
          "https://events.triathlon.org/2026-oceania-triathlon-continental-cup-auckland",

        type:
          "Official",

        verifiedAt:
          "2026-08-26",

        supportsFields: [
          "location",
          "event character",
        ],
      },
    ],
  },
];
