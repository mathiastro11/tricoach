import type {
  RaceCatalogEntry,
  RaceDataQuality,
  RaceSeries,
} from "@/lib/race-catalog";


export type RaceSourceType =
  | "Official"
  | "Organizer"
  | "Federation"
  | "Trusted third party"
  | "Other";


export type RaceImportSource = {
  name: string;

  url?: string;

  type: RaceSourceType;

  /*
    Optional link to a specific imported edition.

    0 means the reusable course-profile row.

    undefined means the source applies to the
    race identity as a whole.
  */
  editionYear?: number;

  verifiedAt?: string;

  supportsFields:
    string[];
};


export type RaceImportEdition = {
  year?: number;

  date?: string;

  swim?:
    RaceCatalogEntry["swim"];

  bike?:
    RaceCatalogEntry["bike"];

  run?:
    RaceCatalogEntry["run"];

  dataQuality:
    RaceDataQuality;

  verifiedFields:
    string[];

  dataWarning?: string;
};


export type RaceImportRecord = {
  slug: string;

  name: string;
  shortName: string;

  location?: string;

  country: string;
  countryCode: string;

  series: RaceSeries;

  format:
    RaceCatalogEntry["format"];

  emoji?: string;

  characteristics:
    string[];

  dataQuality:
    RaceDataQuality;

  notes?: string;

  editions:
    RaceImportEdition[];

  sources:
    RaceImportSource[];
};


export type RaceImportValidation = {
  valid: boolean;

  errors:
    string[];

  warnings:
    string[];
};


function isIsoDate(
  value: string
) {
  return /^\d{4}-\d{2}-\d{2}$/
    .test(value);
}


function isCountryCode(
  value: string
) {
  return /^[A-Z]{2}$/
    .test(value);
}


function hasPositiveDistance(
  value:
    number | null | undefined
) {
  return (
    value === undefined ||
    value === null ||
    value > 0
  );
}


function hasValidElevation(
  value:
    number | null | undefined
) {
  return (
    value === undefined ||
    value === null ||
    value >= 0
  );
}


export function validateRaceImport(
  race: RaceImportRecord
): RaceImportValidation {

  const errors:
    string[] = [];

  const warnings:
    string[] = [];


  if (!race.slug.trim()) {
    errors.push(
      "Race slug is required."
    );
  }


  if (
    !/^[a-z0-9-]+$/.test(
      race.slug
    )
  ) {
    errors.push(
      `Invalid slug: ${race.slug}`
    );
  }


  if (!race.name.trim()) {
    errors.push(
      "Race name is required."
    );
  }


  if (!race.shortName.trim()) {
    errors.push(
      "Race short name is required."
    );
  }


  if (!race.country.trim()) {
    errors.push(
      "Country is required."
    );
  }


  if (
    !isCountryCode(
      race.countryCode
    )
  ) {
    errors.push(
      `Invalid country code: ${race.countryCode}`
    );
  }


  if (
    race.sources.length === 0
  ) {
    warnings.push(
      `${race.slug}: no provenance source supplied.`
    );
  }


  for (
    const edition
    of race.editions
  ) {

    if (
      edition.date &&
      !isIsoDate(
        edition.date
      )
    ) {
      errors.push(
        `${race.slug}: invalid edition date ${edition.date}.`
      );
    }


    if (
      edition.year !== undefined &&
      edition.year !== 0 &&
      (
        edition.year < 2000 ||
        edition.year > 2100
      )
    ) {
      errors.push(
        `${race.slug}: suspicious edition year ${edition.year}.`
      );
    }


    if (
      edition.date &&
      edition.year &&
      edition.year !== 0 &&
      Number(
        edition.date.slice(
          0,
          4
        )
      ) !== edition.year
    ) {
      errors.push(
        `${race.slug}: edition year does not match race date.`
      );
    }


    if (
      !hasPositiveDistance(
        edition.swim
          ?.distanceKm
      )
    ) {
      errors.push(
        `${race.slug}: invalid swim distance.`
      );
    }


    if (
      !hasPositiveDistance(
        edition.bike
          ?.distanceKm
      )
    ) {
      errors.push(
        `${race.slug}: invalid bike distance.`
      );
    }


    if (
      !hasPositiveDistance(
        edition.run
          ?.distanceKm
      )
    ) {
      errors.push(
        `${race.slug}: invalid run distance.`
      );
    }


    if (
      !hasValidElevation(
        edition.bike
          ?.elevationGainM
      )
    ) {
      errors.push(
        `${race.slug}: invalid bike elevation.`
      );
    }


    if (
      !hasValidElevation(
        edition.run
          ?.elevationGainM
      )
    ) {
      errors.push(
        `${race.slug}: invalid run elevation.`
      );
    }


    if (
      edition.dataQuality ===
        "Verified" &&
      edition.verifiedFields
        .length === 0
    ) {
      warnings.push(
        `${race.slug}: edition is Verified but has no verifiedFields.`
      );
    }
  }


  const availableEditionYears =
    new Set(
      race.editions.map(
        (edition) =>
          edition.year ??
          (
            edition.date
              ? Number(
                  edition.date.slice(
                    0,
                    4
                  )
                )
              : 0
          )
      )
    );


  for (
    const source
    of race.sources
  ) {

    if (
      source.editionYear !==
        undefined &&
      !availableEditionYears.has(
        source.editionYear
      )
    ) {
      errors.push(
        `${race.slug}: source "${source.name}" references edition ${source.editionYear}, but that edition is not part of the import.`
      );
    }
  }


  if (
    race.dataQuality ===
      "Verified" &&
    race.sources.length === 0
  ) {
    warnings.push(
      `${race.slug}: race is marked Verified without a source.`
    );
  }


  return {
    valid:
      errors.length === 0,

    errors,

    warnings,
  };
}


export function normalizeRaceImport(
  race: RaceImportRecord
): RaceImportRecord {

  return {
    ...race,

    slug:
      race.slug
        .trim()
        .toLowerCase(),

    name:
      race.name.trim(),

    shortName:
      race.shortName.trim(),

    location:
      race.location
        ?.trim(),

    country:
      race.country.trim(),

    countryCode:
      race.countryCode
        .trim()
        .toUpperCase(),

    characteristics:
      Array.from(
        new Set(
          race.characteristics
            .map(
              (value) =>
                value.trim()
            )
            .filter(Boolean)
        )
      ),

    editions:
      race.editions.map(
        (edition) => ({
          ...edition,

          verifiedFields:
            Array.from(
              new Set(
                edition
                  .verifiedFields
                  .map(
                    (value) =>
                      value.trim()
                  )
                  .filter(Boolean)
              )
            ),
        })
      ),

    sources:
      race.sources.map(
        (source) => ({
          ...source,

          name:
            source.name.trim(),

          url:
            source.url
              ?.trim(),

          supportsFields:
            Array.from(
              new Set(
                source
                  .supportsFields
                  .map(
                    (value) =>
                      value.trim()
                  )
                  .filter(Boolean)
              )
            ),
        })
      ),
  };
}
