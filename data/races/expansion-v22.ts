import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";


export const RACE_EXPANSION_V22:
  RaceImportRecord[] = [
    {
      slug:
        "finnskogen-triathlon",

      name:
        "Finnskogen Triathlon",

      shortName:
        "Finnskogen Triathlon",

      location:
        "Kongsvinger / Finnskogen, Norway",

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
        "Sprint distance",
        "Inclusive local race",
        "Norwegian championship event",
        "Scenic Finnskogen setting",
        "Beginner friendly",
      ],

      dataQuality:
        "Verified",

      notes:
        "2027 race date verified through a current Norwegian race calendar. Existing course profile is retained; unknown course details remain intentionally blank.",

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
              20,
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
          ],
        },

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
            "Norges Triatlonforbund — Finnskogen Triathlon 2026",

          url:
            "https://www.triatlonforbundet.no/terminliste/terminliste-2026/finnskogen-triathlon/",

          type:
            "Official",

          editionYear:
            0,

          verifiedAt:
            "2026-09-03",

          supportsFields: [
            "race identity",
            "course distances",
          ],
        },

        {
          name:
            "Treni — Løpskalender Norge",

          url:
            "https://treni.no/lop.php",

          type:
            "Trusted third party",

          editionYear:
            2027,

          verifiedAt:
            "2026-09-03",

          supportsFields: [
            "race_date",
          ],
        },
      ],
    },
  ];
