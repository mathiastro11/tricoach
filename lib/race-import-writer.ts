import {
  createAdminClient,
} from "@/lib/supabase-admin";

import {
  normalizeRaceImport,
  validateRaceImport,
  type RaceImportRecord,
} from "@/lib/race-ingestion";


export type RaceImportResult = {
  ok: boolean;

  slug: string;

  raceId?: string;

  editionsWritten: number;

  sourcesWritten: number;

  warnings: string[];

  errors: string[];
};


export async function upsertRaceImport(
  input: RaceImportRecord
): Promise<RaceImportResult> {

  const race =
    normalizeRaceImport(
      input
    );

  const validation =
    validateRaceImport(
      race
    );


  if (!validation.valid) {
    return {
      ok: false,

      slug:
        race.slug,

      editionsWritten:
        0,

      sourcesWritten:
        0,

      warnings:
        validation.warnings,

      errors:
        validation.errors,
    };
  }


  /*
    Privileged import client.

    This is deliberately separate from the
    normal read-only server/browser clients.

    SUPABASE_SECRET_KEY must never reach
    client-side code.
  */
  const supabase =
    createAdminClient();


  /*
    -------------------------------------------------------
    RACE IDENTITY
    -------------------------------------------------------
  */

  const {
    data:
      raceRow,

    error:
      raceError,
  } =
    await supabase
      .from("races")
      .upsert(
        {
          slug:
            race.slug,

          name:
            race.name,

          short_name:
            race.shortName,

          location:
            race.location ??
            null,

          country:
            race.country,

          country_code:
            race.countryCode,

          series:
            race.series,

          format:
            race.format,

          emoji:
            race.emoji ??
            null,

          data_quality:
            race.dataQuality,

          characteristics:
            race.characteristics,

          notes:
            race.notes ??
            null,
        },
        {
          onConflict:
            "slug",
        }
      )
      .select("id")
      .single();


  if (
    raceError ||
    !raceRow
  ) {
    return {
      ok: false,

      slug:
        race.slug,

      editionsWritten:
        0,

      sourcesWritten:
        0,

      warnings:
        validation.warnings,

      errors: [
        raceError
          ?.message ??
        "Race upsert returned no row.",
      ],
    };
  }


  const raceId =
    raceRow.id as string;


  let editionsWritten =
    0;

  let sourcesWritten =
    0;


  /*
    -------------------------------------------------------
    EDITIONS
    -------------------------------------------------------
  */

  const editionIds =
    new Map<
      number,
      string
    >();


  for (
    const edition
    of race.editions
  ) {

    /*
      year = 0 is the dedicated
      reusable course-profile row.

      If year is omitted but a date
      exists, derive the year from it.
    */

    const editionYear =
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
      );


    const {
      data:
        editionRow,

      error:
        editionError,
    } =
      await supabase
        .from(
          "race_editions"
        )
        .upsert(
          {
            race_id:
              raceId,

            race_date:
              edition.date ??
              null,

            edition_year:
              editionYear,

            swim:
              edition.swim ??
              null,

            bike:
              edition.bike ??
              null,

            run:
              edition.run ??
              null,

            data_quality:
              edition.dataQuality,

            verified_fields:
              edition
                .verifiedFields,

            data_warning:
              edition.dataWarning ??
              null,
          },
          {
            onConflict:
              "race_id,edition_year",
          }
        )
        .select("id")
        .single();


    if (
      editionError ||
      !editionRow
    ) {
      return {
        ok: false,

        slug:
          race.slug,

        raceId,

        editionsWritten,

        sourcesWritten,

        warnings:
          validation.warnings,

        errors: [
          editionError
            ?.message ??
          `Could not write edition ${editionYear}.`,
        ],
      };
    }


    editionIds.set(
      editionYear,
      editionRow.id as string
    );

    editionsWritten += 1;
  }


  /*
    -------------------------------------------------------
    SOURCES

    Sources are refreshed for this race so stale provenance
    does not accumulate when an importer is rerun.
    -------------------------------------------------------
  */

  const {
    error:
      deleteSourcesError,
  } =
    await supabase
      .from("race_sources")
      .delete()
      .eq(
        "race_id",
        raceId
      );


  if (deleteSourcesError) {
    return {
      ok: false,

      slug:
        race.slug,

      raceId,

      editionsWritten,

      sourcesWritten,

      warnings:
        validation.warnings,

      errors: [
        deleteSourcesError.message,
      ],
    };
  }


  for (
    const source
    of race.sources
  ) {

    if (
      source.editionYear !==
        undefined &&
      !editionIds.has(
        source.editionYear
      )
    ) {
      return {
        ok: false,

        slug:
          race.slug,

        raceId,

        editionsWritten,

        sourcesWritten,

        warnings:
          validation.warnings,

        errors: [
          `Source "${source.name}" could not be linked to edition ${source.editionYear}.`,
        ],
      };
    }


    const {
      error:
        sourceError,
    } =
      await supabase
        .from("race_sources")
        .insert({
          race_id:
            raceId,

          /*
            Source records currently describe either
            the whole race or the imported data set.

            Edition-specific source linkage can be
            added to RaceImportSource later without
            changing the database model.
          */

          race_edition_id:
            source.editionYear !==
              undefined
              ? (
                  editionIds.get(
                    source.editionYear
                  ) ??
                  null
                )
              : null,

          source_name:
            source.name,

          source_url:
            source.url ??
            null,

          source_type:
            source.type,

          supports_fields:
            source.supportsFields,

          last_verified_at:
            source.verifiedAt ??
            null,
        });


    if (sourceError) {
      return {
        ok: false,

        slug:
          race.slug,

        raceId,

        editionsWritten,

        sourcesWritten,

        warnings:
          validation.warnings,

        errors: [
          sourceError.message,
        ],
      };
    }


    sourcesWritten += 1;
  }


  return {
    ok: true,

    slug:
      race.slug,

    raceId,

    editionsWritten,

    sourcesWritten,

    warnings:
      validation.warnings,

    errors: [],
  };
}
