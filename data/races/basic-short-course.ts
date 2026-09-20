import {
  basicRaceToImport,
  type BasicRaceInput,
} from "@/lib/basic-race-import";


export const BASIC_SHORT_COURSE_INPUT:
  BasicRaceInput[] = [

  // ======================================================
  // NORWAY
  // ======================================================

  

  

  

  

  // ======================================================
  // SWEDEN
  // ======================================================

  {
    slug:
      "stockholm-triathlon-sprint",

    name:
      "Stockholm Triathlon Sprint",

    shortName:
      "Stockholm Triathlon",

    location:
      "Stockholm, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    format:
      "Sprint",

    emoji:
      "🇸🇪",
  },

  {
    slug:
      "stockholm-triathlon-olympic",

    name:
      "Stockholm Triathlon Olympic",

    shortName:
      "Stockholm Olympic",

    location:
      "Stockholm, Sweden",

    country:
      "Sweden",

    countryCode:
      "SE",

    format:
      "Olympic",

    emoji:
      "🇸🇪",
  },


  // ======================================================
  // DENMARK
  // ======================================================

  

  

  // ======================================================
  // FINLAND
  // ======================================================

  

  

  // ======================================================
  // UK / EUROPE
  // ======================================================

  {
    slug:
      "london-triathlon-sprint",

    name:
      "London Triathlon Sprint",

    shortName:
      "London Triathlon",

    location:
      "London, United Kingdom",

    country:
      "United Kingdom",

    countryCode:
      "GB",

    format:
      "Sprint",

    emoji:
      "🇬🇧",
  },

  

  {
    slug:
      "barcelona-triathlon-sprint",

    name:
      "Barcelona Triathlon Sprint",

    shortName:
      "Barcelona Sprint",

    location:
      "Barcelona, Spain",

    country:
      "Spain",

    countryCode:
      "ES",

    format:
      "Sprint",

    emoji:
      "🇪🇸",

    swimEnvironment:
      "Sea",
  },

  

  // ======================================================
  // GLOBAL
  // ======================================================

  {
    slug:
      "chicago-triathlon-sprint",

    name:
      "Chicago Triathlon Sprint",

    shortName:
      "Chicago Sprint",

    location:
      "Chicago, USA",

    country:
      "United States",

    countryCode:
      "US",

    format:
      "Sprint",

    emoji:
      "🇺🇸",
  },

  {
    slug:
      "chicago-triathlon-olympic",

    name:
      "Chicago Triathlon Olympic",

    shortName:
      "Chicago Olympic",

    location:
      "Chicago, USA",

    country:
      "United States",

    countryCode:
      "US",

    format:
      "Olympic",

    emoji:
      "🇺🇸",
  },

  {
    slug:
      "noosa-triathlon",

    name:
      "Noosa Triathlon",

    shortName:
      "Noosa",

    location:
      "Noosa, Australia",

    country:
      "Australia",

    countryCode:
      "AU",

    format:
      "Olympic",

    emoji:
      "🇦🇺",
  },


];


export const BASIC_SHORT_COURSE_RACES =
  BASIC_SHORT_COURSE_INPUT.map(
    basicRaceToImport
  );
