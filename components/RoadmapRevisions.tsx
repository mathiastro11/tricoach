"use client";

import type {
  RoadmapRevision,
  SeasonRoadmap,
} from "@/types/training";

type RoadmapRevisionsProps = {
  revisions: RoadmapRevision[];
};

function getRoadmapChanges(
  previous: SeasonRoadmap,
  updated: SeasonRoadmap
) {
  const changes: string[] = [];

  if (previous.totalWeeks !== updated.totalWeeks) {
    const difference =
      updated.totalWeeks - previous.totalWeeks;

    changes.push(
      difference > 0
        ? `Season extended by ${difference} ${
            difference === 1 ? "week" : "weeks"
          }`
        : `Season shortened by ${Math.abs(difference)} ${
            Math.abs(difference) === 1
              ? "week"
              : "weeks"
          }`
    );
  }

  const maxWeeks = Math.max(
    previous.weeks.length,
    updated.weeks.length
  );

  let changedWeeks = 0;
  let loadChanges = 0;
  let phaseChanges = 0;
  let priorityChanges = 0;

  for (let index = 0; index < maxWeeks; index++) {
    const before = previous.weeks[index];
    const after = updated.weeks[index];

    if (!before || !after) {
      changedWeeks += 1;
      continue;
    }

    const changed =
      before.phase !== after.phase ||
      before.focus !== after.focus ||
      before.targetHours !== after.targetHours ||
      before.priorityDiscipline !==
        after.priorityDiscipline;

    if (changed) {
      changedWeeks += 1;
    }

    if (before.targetHours !== after.targetHours) {
      loadChanges += 1;
    }

    if (before.phase !== after.phase) {
      phaseChanges += 1;
    }

    if (
      before.priorityDiscipline !==
      after.priorityDiscipline
    ) {
      priorityChanges += 1;
    }
  }

  if (changedWeeks > 0) {
    changes.push(
      `${changedWeeks} ${
        changedWeeks === 1 ? "week" : "weeks"
      } adjusted`
    );
  }

  if (loadChanges > 0) {
    changes.push(
      `Training load changed in ${loadChanges} ${
        loadChanges === 1 ? "week" : "weeks"
      }`
    );
  }

  if (phaseChanges > 0) {
    changes.push(
      `Phase timing changed in ${phaseChanges} ${
        phaseChanges === 1 ? "week" : "weeks"
      }`
    );
  }

  if (priorityChanges > 0) {
    changes.push(
      `Discipline priority changed in ${priorityChanges} ${
        priorityChanges === 1
          ? "week"
          : "weeks"
      }`
    );
  }

  return changes;
}

export default function RoadmapRevisions({
  revisions,
}: RoadmapRevisionsProps) {
  if (revisions.length === 0) {
    return null;
  }

  return (
    <section className="weekSection">
      <div className="sectionTitle">
        <div>
          <span className="eyebrow">
            PLAN ADAPTATIONS
          </span>

          <h2>
            How your season strategy has evolved
          </h2>
        </div>

        <span>
          {revisions.length}{" "}
          {revisions.length === 1
            ? "adaptation"
            : "adaptations"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gap: "12px",
          marginTop: "1rem",
        }}
      >
        {revisions
          .slice()
          .reverse()
          .slice(0, 5)
          .map((revision, index) => {
            const changes =
              getRoadmapChanges(
                revision.previousRoadmap,
                revision.updatedRoadmap
              );

            return (
              <article
                key={revision.id}
                className="todayCard"
                style={{
                  minHeight: "auto",
                  padding: "1.4rem",
                }}
              >
                <div className="cardHead">
                  <span>
                    {index === 0
                      ? "LATEST ADAPTATION"
                      : "PLAN ADJUSTMENT"}
                  </span>

                  <span>
                    {new Date(
                      revision.createdAt
                    ).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>

                <h2
                  style={{
                    marginTop: "1rem",
                    marginBottom: ".4rem",
                  }}
                >
                  {revision.summary}
                </h2>

                <p
                  style={{
                    maxWidth: "760px",
                  }}
                >
                  {revision.reason}
                </p>

                {changes.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "1rem",
                    }}
                  >
                    {changes.map((change) => (
                      <span
                        key={change}
                        style={{
                          border:
                            "1px solid rgba(255,255,255,.045)",
                          background:
                            "rgba(255,255,255,.014)",
                          borderRadius: "999px",
                          padding:
                            ".45rem .7rem",
                          fontSize: ".72rem",
                          fontWeight: 800,
                        }}
                      >
                        {change}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
}
