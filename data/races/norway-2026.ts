import {
  basicRaceToImport,
  type BasicRaceInput,
} from "@/lib/basic-race-import";


export const NORWAY_2026_INPUT:
  BasicRaceInput[] = [

  // ------------------------------------------------------
  // FINNSKOGEN
  // ------------------------------------------------------



  // ------------------------------------------------------
  // OSLO
  // ------------------------------------------------------

  {
    slug: "oslo-triatlon-sprint",

    name: "Oslo Triatlon Sprint",
    shortName: "Oslo Triatlon",

    location: "Oslo, Norway",

    country: "Norway",
    countryCode: "NO",

    format: "Sprint",

    date: "2026-08-08",

    emoji: "🇳🇴",

    swimKm: 0.75,
    bikeKm: 20,
    runKm: 5,

    swimEnvironment: "Lake",

    distanceSources: {
      swim: "federation",
      bike: "federation",
      run: "federation",
    },

    characteristics: [
      "Large Norwegian triathlon",
      "Suitable for first-time athletes",
      "Sprint distance",
    ],

    sourceName:
      "Norges Triatlonforbund",

    sourceUrl:
      "https://www.triatlonforbundet.no/terminliste/terminliste-2026/oslo-triatlon/",

    verifiedAt:
      "2026-08-17",
  },

  

  // ------------------------------------------------------
  // HAUGESUND
  // ------------------------------------------------------



  // ------------------------------------------------------
  // LUNDE
  // ------------------------------------------------------



  // ------------------------------------------------------
  // JEVNAKER FULL
  // ------------------------------------------------------



  // ------------------------------------------------------
  // OS TRIATHLON
  // ------------------------------------------------------



  // ------------------------------------------------------
  // SOON
  // ------------------------------------------------------

];


export const NORWAY_2026_RACES =
  NORWAY_2026_INPUT.map(
    basicRaceToImport
  );
