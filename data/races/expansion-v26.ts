import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


const VERIFIED_AT =
  "2026-09-06";


export const RACE_EXPANSION_V26:
  RaceImportRecord[] = [

    // ====================================================
    // IRONMAN 70.3 ALCÚDIA-MALLORCA
    // ====================================================

    {
      slug:
        "ironman-703-mallorca",

      name:
        "IRONMAN 70.3 Alcúdia-Mallorca",

      shortName:
        "70.3 Mallorca",

      location:
        "Alcúdia, Mallorca, Spain",

      country:
        "Spain",

      countryCode:
        "ES",

      series:
        "IRONMAN",

      format:
        "70.3",

      emoji:
        "🇪🇸",

      characteristics: [
        "One of the world's largest IRONMAN 70.3 races",
        "Mediterranean bay swim",
        "Serra de Tramuntana cycling",
        "Hilly bike course",
        "Long sustained climb",
        "Fast descending",
        "Flat coastal run",
        "Large age-group field",
        "Major European destination race",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN describes Alcúdia-Mallorca as one of the largest IRONMAN 70.3 events in the world. The swim is 1.9 km in Alcúdia Bay, the bike is 90 km with approximately 800 m of elevation gain through the Serra de Tramuntana, and the run is a flat three-loop 21.1 km course along the bay. Average water temperature is listed near 18°C.",

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
              18,

            wetsuitLikely:
              true,
          },

          bike: {
            distanceKm:
              90,

            elevationGainM:
              800,

            elevationDisplay:
              "~800 m",

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
            "bike elevation",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-05-09",

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
            "IRONMAN 70.3 Alcúdia-Mallorca — Course",

          url:
            "https://www.ironman.com/races/im703-mallorca/course",

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
            "run profile",
            "course character",
          ],
        },

        {
          name:
            "IRONMAN 70.3 Alcúdia-Mallorca",

          url:
            "https://www.ironman.com/races/im703-mallorca",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "event scale",
            "race identity",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN 70.3 OREGON
    // ====================================================

    {
      slug:
        "ironman-703-oregon",

      name:
        "IRONMAN 70.3 Oregon",

      shortName:
        "70.3 Oregon",

      location:
        "Salem, Oregon, USA",

      country:
        "United States",

      countryCode:
        "US",

      series:
        "IRONMAN",

      format:
        "70.3",

      emoji:
        "🇺🇸",

      characteristics: [
        "Popular sold-out 70.3",
        "Fast downriver swim",
        "Willamette River",
        "Flat bike course",
        "Oregon wine country",
        "Flat shaded run",
        "PR-friendly course",
        "First-timer friendly",
        "Fast-course pacing",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN markets Oregon as a fast, PR-friendly course. The race begins with a 1.9 km downstream swim in the Willamette River, followed by a 90 km flat bike through Oregon wine country and a flat 21.1 km run on paved and shaded park trails. The 2026 event sold out.",

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
              22,
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
            "water temperature",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-07-19",

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
            "IRONMAN 70.3 Oregon — Course",

          url:
            "https://www.ironman.com/races/im703-oregon/course",

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
            "IRONMAN 70.3 Oregon — 2026 Registration",

          url:
            "https://www.ironman.com/races/im703-oregon/register",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "sold-out status",
          ],
        },
      ],
    },


    // ====================================================
    // IRONMAN 70.3 NEW YORK
    // ====================================================

    {
      slug:
        "ironman-703-new-york",

      name:
        "Northwell IRONMAN 70.3 New York",

      shortName:
        "70.3 New York",

      location:
        "Jones Beach, New York, USA",

      country:
        "United States",

      countryCode:
        "US",

      series:
        "IRONMAN",

      format:
        "70.3",

      emoji:
        "🇺🇸",

      characteristics: [
        "Major New York-area triathlon",
        "Protected bay swim",
        "Jones Beach State Park",
        "Flat closed bike course",
        "Fast bike course",
        "Flat Atlantic coast run",
        "Beachside racing",
        "PR-friendly course",
        "Large metropolitan catchment",
      ],

      dataQuality:
        "Verified",

      notes:
        "IRONMAN 70.3 New York is based at Jones Beach State Park. The swim takes place in protected Zach's Bay, followed by a flat and fully closed 90 km bike course and a flat 21.1 km run along the Atlantic coast. IRONMAN lists typical water temperature around 18°C.",

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
              18,

            wetsuitLikely:
              true,
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
            "water temperature",
            "bike profile",
            "run profile",
            "run surface",
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-09-26",

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
            "IRONMAN 70.3 New York — Course",

          url:
            "https://www.ironman.com/races/im703-new-york/course",

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
            "IRONMAN 70.3 New York",

          url:
            "https://www.ironman.com/races/im703-new-york",

          type:
            "Official",

          editionYear:
            2026,

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race_date",
            "race identity",
          ],
        },
      ],
    },


    // ====================================================
    // CHALLENGE WĀNAKA
    // ====================================================

    {
      slug:
        "challenge-wanaka",

      name:
        "Challenge Wānaka",

      shortName:
        "Challenge Wānaka",

      location:
        "Wānaka, New Zealand",

      country:
        "New Zealand",

      countryCode:
        "NZ",

      series:
        "Challenge",

      format:
        "70.3",

      emoji:
        "🇳🇿",

      characteristics: [
        "New Zealand's largest triathlon festival",
        "2,500+ participants",
        "Southern Alps backdrop",
        "Lake Wānaka swim",
        "Scenic mountain setting",
        "Honest challenging bike course",
        "Lakefront run",
        "Bucket-list destination race",
        "Strong international field",
      ],

      dataQuality:
        "Verified",

      notes:
        "Challenge Family describes Challenge Wānaka as New Zealand's largest triathlon festival, involving over 2,500 participants and attracting athletes from around the world. The middle-distance race uses a 1.9 km Lake Wānaka swim, 90 km bike and 21 km run in the Southern Alps region.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              1.9,

            environment:
              "Lake",
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
              21,

            profile:
              "Rolling",

            surface:
              "Mixed",
          },

          dataQuality:
            "Verified",

          verifiedFields: [
            "course distances",
            "swim environment",
            "course character",
            "event scale",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-02-21",

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
            "Challenge Family — Challenge Wānaka",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-wanaka/",

          type:
            "Official",

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race identity",
            "course distances",
            "swim environment",
            "event scale",
            "course character",
          ],
        },

        {
          name:
            "Challenge Wānaka — 2026",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-wanaka/",

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
    // CHALLENGE SAMARKAND
    // ====================================================

    {
      slug:
        "challenge-samarkand",

      name:
        "Challenge Samarkand",

      shortName:
        "Challenge Samarkand",

      location:
        "Samarkand, Uzbekistan",

      country:
        "Uzbekistan",

      countryCode:
        "UZ",

      series:
        "Challenge",

      format:
        "70.3",

      emoji:
        "🇺🇿",

      characteristics: [
        "Old Silk Road race",
        "UNESCO World Heritage setting",
        "Purpose-built rowing lake",
        "Mountain-fed freshwater swim",
        "Historic city bike course",
        "Fast flat run",
        "Unique Central Asian destination",
        "International middle-distance racing",
      ],

      dataQuality:
        "Verified",

      notes:
        "Challenge Samarkand combines middle-distance racing with one of the world's most distinctive historic settings. The official middle course is 1.9 km swim in a mountain-fed rowing lake, 86 km bike through Samarkand and 21.5 km run around the Silk Road Samarkand complex.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              1.9,

            environment:
              "Lake",
          },

          bike: {
            distanceKm:
              86,

            profile:
              "Rolling",

            technicality:
              "Moderate",
          },

          run: {
            distanceKm:
              21.5,

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
            "run profile",
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-09-13",

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
            "Challenge Family — Challenge Samarkand",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-samarkand/",

          type:
            "Official",

          verifiedAt:
            VERIFIED_AT,

          supportsFields: [
            "race identity",
            "course distances",
            "swim environment",
            "run profile",
            "course character",
          ],
        },

        {
          name:
            "Challenge Samarkand — 2026",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-samarkand/",

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
    // CHALLENGE CANBERRA
    // ====================================================

    {
      slug:
        "challenge-canberra-middle",

      name:
        "Challenge Canberra Middle Distance",

      shortName:
        "Challenge Canberra",

      location:
        "Canberra, Australia",

      country:
        "Australia",

      countryCode:
        "AU",

      series:
        "Challenge",

      format:
        "70.3",

      emoji:
        "🇦🇺",

      characteristics: [
        "Australian capital-city race",
        "Lake Burley Griffin swim",
        "Closed bike course",
        "National Arboretum climb",
        "Technical bike section",
        "Fast flat roads",
        "Flat lakeside run",
        "Parliament House views",
        "Multi-distance race festival",
      ],

      dataQuality:
        "Verified",

      notes:
        "Challenge Canberra offers several race formats. Basse stores the middle-distance profile as the catalog entry: 1.9 km swim, 90 km bike and 21 km run. The swim is in Lake Burley Griffin, the bike includes a climb into the National Arboretum and a technical section, while the three-lap run is described as fast and flat.",

      editions: [
        {
          year:
            0,

          swim: {
            distanceKm:
              1.9,

            environment:
              "Lake",
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
              21,

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
            "bike technicality",
            "run profile",
            "course character",
          ],
        },

        {
          year:
            2026,

          date:
            "2026-11-22",

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
            "Challenge Family — Challenge Canberra",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-canberra/",

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
            "Challenge Canberra — 2026",

          url:
            "https://www.challenge-family.com/challenge-family/races/challenge-canberra/",

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
