import type {
  RaceImportRecord,
} from "@/lib/race-ingestion";

import {
  upsertRaceImport,
  type RaceImportResult,
} from "@/lib/race-import-writer";


export type RaceBatchImportResult = {
  ok: boolean;

  total: number;
  imported: number;
  failed: number;

  warnings: number;

  results:
    RaceImportResult[];
};


export async function importRaceBatch(
  races: RaceImportRecord[]
): Promise<RaceBatchImportResult> {

  const results:
    RaceImportResult[] = [];


  /*
    Import sequentially for now.

    This keeps database load predictable and
    makes failures easier to inspect.

    We can add controlled concurrency later
    when the catalog becomes much larger.
  */

  for (const race of races) {

    try {

      const result =
        await upsertRaceImport(
          race
        );

      results.push(
        result
      );

    } catch (error) {

      results.push({
        ok: false,

        slug:
          race.slug,

        editionsWritten:
          0,

        sourcesWritten:
          0,

        warnings: [],

        errors: [
          error instanceof Error
            ? error.message
            : "Unknown import error.",
        ],
      });
    }
  }


  const imported =
    results.filter(
      (result) =>
        result.ok
    ).length;


  const failed =
    results.length -
    imported;


  const warnings =
    results.reduce(
      (
        total,
        result
      ) =>
        total +
        result.warnings.length,
      0
    );


  return {
    ok:
      failed === 0,

    total:
      results.length,

    imported,

    failed,

    warnings,

    results,
  };
}
