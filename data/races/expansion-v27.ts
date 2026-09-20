import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-06";


export const RACE_EXPANSION_V27:
  RaceImportRecord[] = [

    // ====================================================
    // SINGAPORE T100 — 100 KM
    // ====================================================

    {
      slug:
        "singapore-t100-100km",

      name:
        "Singapore T100 Triathlon 100km",

      shortName:
        "Singapore T100",

      location:
        "Marina Bay, Singapore",

      country:
        "Singapore",

      countryCode:
        "SG",

      series:
        "Independent",

      format:
        "Other",

      emoji:
        "🇸🇬",

      characteristics: [
        "T100 World Tour",
        "100 km triathlon",
        "Marina Bay",
        "Hot and humid",
        "Reservoir swim",
        "Undulating bike",
        "Flat run",
        "Major city race",
        "Professional and age-group racing",
      ],

      dataQuality:
        "Verified",

      notes:
        "Singapore T100 uses the standard T100 100 km format: 2 km swim, 80 km bike and 18 km run. The swim is held in Marina Bay reservoir, the bike is officially described as undulating and the run as flat. Typical water temperature is 25–28°C. The 2027 event weekend is confirmed for 10–11 April, but the exact 100 km race day is not stored until officially finalized.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              2,

            environment:
              "Open water",

            expectedWaterTempC:
              27,

            wetsuitLikely:
              false,
          },

          bike: {
            distanceKm:
              80,

            profile:
              "Rolling",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              18,

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
            "event format",
          ],
        },
      ],

      sources: [
        {
          name:
            "Singapore T100 — Participate",

          url:
            "https://t100triathlon.com/singapore/participate/",

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
            "event format",
            "2027 event weekend",
          ],
        },
      ],
    },


    // ====================================================
    // LONDON T100 — 100 KM
    // ====================================================

    {
      slug:
        "london-t100-100km",

      name:
        "London T100 Triathlon 100km",

      shortName:
        "London T100",

      location:
        "Royal Victoria Dock, London, United Kingdom",

      country:
        "United Kingdom",

      countryCode:
        "GB",

      series:
        "Independent",

      format:
        "Other",

      emoji:
        "🇬🇧",

      characteristics: [
        "T100 World Tour",
        "100 km triathlon",
        "Royal Victoria Dock",
        "Freshwater swim",
        "Flat bike",
        "Flat run",
        "Major city race",
        "Large participant field",
        "Professional and age-group racing",
      ],

      dataQuality:
        "Verified",

      notes:
        "London T100 uses the standard 2 km swim, 80 km bike and 18 km run format. The organizer classifies the freshwater swim, bike as flat and run as flat, with typical water temperature of 18–24°C. The 2027 event weekend is confirmed for 21–22 August, but the exact 100 km start day remains marked TBC by the organizer and is therefore not stored as a race date.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              2,

            environment:
              "Open water",

            expectedWaterTempC:
              21,

            wetsuitLikely:
              true,
          },

          bike: {
            distanceKm:
              80,

            profile:
              "Flat",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              18,

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
            "wetsuit conditions",
            "bike profile",
            "run profile",
            "event format",
          ],
        },
      ],

      sources: [
        {
          name:
            "London T100 — Participate",

          url:
            "https://t100triathlon.com/london/participate/",

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
            "event format",
            "2027 event weekend",
          ],
        },
      ],
    },


    // ====================================================
    // DUBAI T100 — 100 KM
    // ====================================================

    {
      slug:
        "dubai-t100-100km",

      name:
        "Dubai T100 Triathlon 100km",

      shortName:
        "Dubai T100",

      location:
        "Al Mamzar, Dubai, United Arab Emirates",

      country:
        "United Arab Emirates",

      countryCode:
        "AE",

      series:
        "Independent",

      format:
        "Other",

      emoji:
        "🇦🇪",

      characteristics: [
        "T100 World Tour",
        "100 km triathlon",
        "Ocean swim",
        "Rolling bike",
        "Flat run",
        "Hot conditions",
        "Dubai destination race",
        "Professional and age-group racing",
        "Heat management",
      ],

      dataQuality:
        "Verified",

      notes:
        "Dubai T100 is held at Al Mamzar and uses the standard T100 2 km swim, 80 km bike and 18 km run. The organizer classifies the swim as ocean, bike as rolling and run as flat, with average water temperature of 28–29°C and air temperatures commonly around 25–31°C. The 2026 event runs 13–15 November; no exact 100 km race day is stored without a race-specific published date.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              2,

            environment:
              "Sea",

            expectedWaterTempC:
              29,

            wetsuitLikely:
              false,
          },

          bike: {
            distanceKm:
              80,

            profile:
              "Rolling",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              18,

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
            "event format",
            "event location",
          ],
        },
      ],

      sources: [
        {
          name:
            "Dubai T100 — Participate",

          url:
            "https://t100triathlon.com/dubai/participate/",

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
            "event format",
            "2026 event weekend",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN SOUTH AFRICA
    // ====================================================

    {
      slug:
        "ironman-south-africa",

      name:
        "ISUZU IRONMAN South Africa",

      shortName:
        "IRONMAN South Africa",

      location:
        "Gqeberha, South Africa",

      country:
        "South Africa",

      countryCode:
        "ZA",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇿🇦",

      characteristics: [
        "Africa's flagship full-distance IRONMAN",
        "Nelson Mandela Bay",
        "Bay swim",
        "Rolling bike",
        "Rolling marathon",
        "Coastal conditions",
        "Championship race",
        "20+ years of history",
        "Strong spectator support",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN South Africa is described by IRONMAN as Africa's only full-distance IRONMAN and entered its 21st year in 2026. The official profile classifies the swim as bay, bike as rolling and run as rolling, with average water temperature around 19°C.",

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
              19,

            wetsuitLikely:
              true,
          },

          bike: {
            distanceKm:
              180,

            profile:
              "Rolling",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              42.2,

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
            "run profile",
            "race character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-04-19",

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
            "IRONMAN South Africa — Course",

          url:
            "https://www.ironman.com/races/im-south-africa/course",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "swim environment",
            "water temperature",
            "bike profile",
            "run profile",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN South Africa — Event Schedule",

          url:
            "https://www.ironman.com/races/im-south-africa/schedule",

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


    // ====================================================
    // CHALLENGE XIAMEN
    // ====================================================

    {
      slug:
        "challenge-xiamen",

      name:
        "Challenge Xiamen",

      shortName:
        "Challenge Xiamen",

      location:
        "Xiamen, China",

      country:
        "China",

      countryCode:
        "CN",

      series:
        "Challenge",

      format:
        "70.3",

      emoji:
        "🇨🇳",

      characteristics: [
        "Major Chinese middle-distance race",
        "Coastal swim",
        "Huandong Romantic Coast",
        "Traffic-free course",
        "Flat bike",
        "Flat run",
        "Fast course",
        "Olympic and sprint festival",
        "Late-season racing",
      ],

      dataQuality:
        "Verified",

      notes:
        "Challenge Xiamen takes place on Xiamen's Huandong Romantic Coast. The official middle-distance event is 1.9 km swim, 90 km bike and 21.1 km run. Challenge Family describes the cycling and running sections as fast and flat and located on a dedicated high-level marathon course without traffic.",

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
              "Flat",

            technicality:
              "Low",
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
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-11-07",

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
            "Challenge Family — Challenge Xiamen",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-xiamen/",

          type:
            "Official",

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race identity",
            "course distances",
            "course character",
            "bike profile",
            "run profile",
          ],
        },

        {
          name:
            "Challenge Xiamen — 2026",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-xiamen/",

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


    // ====================================================
    // CHALLENGE FLORIANÓPOLIS — NOVEMBER
    // ====================================================

    {
      slug:
        "challenge-florianopolis",

      name:
        "Challenge Florianópolis",

      shortName:
        "Challenge Florianópolis",

      location:
        "Florianópolis, Santa Catarina, Brazil",

      country:
        "Brazil",

      countryCode:
        "BR",

      series:
        "Challenge",

      format:
        "70.3",

      emoji:
        "🇧🇷",

      characteristics: [
        "Brazilian destination race",
        "Jurerê Internacional",
        "Ocean swim",
        "Flat bike",
        "Flat run",
        "Fast course",
        "Atlantic coastline",
        "Middle and sprint festival",
        "Personal-best potential",
      ],

      dataQuality:
        "Verified",

      notes:
        "Challenge Florianópolis is raced around Jurerê Internacional on Brazil's 'Magic Island'. Challenge Family lists the middle-distance format as a one-lap 1.9 km swim, 90 km bike and 21.1 km run. The organizer describes it as a fast, scenic course with calm ocean swimming, a flat and fast bike route and a coastal run.",

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
              "Flat",

            technicality:
              "Low",
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
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-11-29",

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
            "Challenge Family — Challenge Florianópolis",

          url:
            "https://challengefamily.com/races/challenge-florianopolis-november/",

          type:
            "Official",

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
            "Challenge Family — 2026 Middle Distance Calendar",

          url:
            "https://www.challenge-family.com/challenge-family/race/middle-distance/",

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


    // ====================================================
    // IRONMAN NEW ZEALAND
    // ====================================================

    {
      slug:
        "ironman-new-zealand",

      name:
        "ANZCO Foods IRONMAN New Zealand",

      shortName:
        "IRONMAN New Zealand",

      location:
        "Taupō, New Zealand",

      country:
        "New Zealand",

      countryCode:
        "NZ",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇳🇿",

      characteristics: [
        "Longest-running IRONMAN outside Kona",
        "Legendary bucket-list race",
        "Lake Taupō swim",
        "Clear freshwater",
        "Rolling rural bike course",
        "Flat lakefront marathon",
        "Strong local community",
        "Iconic New Zealand scenery",
        "Long-course heritage",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN New Zealand is the longest-running IRONMAN outside Kona. The race begins with a 3.8 km swim in Lake Taupō, followed by a two-lap 180 km rolling bike and a 42.2 km lakefront run. IRONMAN lists average water temperature around 18–19°C.",

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
              19,

            wetsuitLikely:
              true,
          },

          bike: {
            distanceKm:
              180,

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
            "race heritage",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-03-07",

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
            "IRONMAN New Zealand — Course",

          url:
            "https://www.ironman.com/races/im-new-zealand/course",

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
            "race heritage",
          ],
        },

        {
          name:
            "IRONMAN New Zealand — 2026 Schedule",

          url:
            "https://www.ironman.com/races/im-new-zealand/schedule",

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


    // ====================================================
    // IRONMAN TEXAS
    // ====================================================

    {
      slug:
        "ironman-texas",

      name:
        "Memorial Hermann IRONMAN Texas North American Championship",

      shortName:
        "IRONMAN Texas",

      location:
        "The Woodlands, Texas, USA",

      country:
        "United States",

      countryCode:
        "US",

      series:
        "IRONMAN",

      format:
        "Ironman",

      emoji:
        "🇺🇸",

      characteristics: [
        "North American Championship",
        "Lake Woodlands swim",
        "Flat fast bike",
        "Hardy Toll Road",
        "Rolling run",
        "Major professional field",
        "Large age-group field",
        "Warm conditions",
        "High spectator support",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN Texas is the North American Championship and one of the major full-distance races in the United States. The swim is 3.8 km in Lake Woodlands, followed by a flat and fast 180 km bike with much of the course closed to traffic and a rolling 42.2 km run. IRONMAN lists average water temperature around 23°C.",

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
              23,
          },

          bike: {
            distanceKm:
              180,

            profile:
              "Flat",

            technicality:
              "Low",
          },

          run: {
            distanceKm:
              42.2,

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
            "run profile",
            "championship status",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-04-18",

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
            "IRONMAN Texas — Course",

          url:
            "https://www.ironman.com/races/im-texas/course",

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
            "championship status",
          ],
        },

        {
          name:
            "IRONMAN Texas — 2026",

          url:
            "https://www.ironman.com/races/im-texas",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "championship status",
          ],
        },
      ],
    },
  ];
