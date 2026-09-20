import type {
  TrainingPlan,
  TrainingPlanDay,
  WorkoutFeedback,
} from "@/types/training";

import {
  workoutMatchesFeedback,
} from "@/lib/workout-feedback-match";


function workoutChanged(
  existing: TrainingPlanDay,
  proposed: TrainingPlanDay
) {
  return (
    existing.sport !== proposed.sport ||
    existing.title !== proposed.title ||
    existing.durationMinutes !==
      proposed.durationMinutes ||
    existing.intensity !==
      proposed.intensity ||
    existing.purpose !==
      proposed.purpose ||
    JSON.stringify(
      existing.details ?? []
    ) !==
      JSON.stringify(
        proposed.details ?? []
      )
  );
}


/*
  Normalize text only for comparison.

  We keep the original stored value whenever two values are
  semantically equivalent, so harmless AI reformatting does
  not become a fake workout adjustment.
*/
function normalizeComparableText(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase();
}


function normalizeIntensityForComparison(
  value: unknown
) {
  const parts =
    String(value ?? "")
      .split(/\s*·\s*/)
      .map(
        (part) =>
          normalizeComparableText(part)
      )
      .filter(Boolean)
      .filter(
        (part) =>
          !/^power\s+(?:reference|ref)\b/i.test(
            part
          )
      );

  /*
    Intensity identity is the actual effort prescription:
    e.g. Easy / Moderate / Controlled hard / RPE.

    Power-reference fragments are supporting metadata and
    should not make an otherwise unchanged workout appear
    adjusted merely because AI rewrote or removed them.
  */
  return Array.from(
    new Set(parts)
  ).join(" · ");
}


function normalizeDetailsForComparison(
  details:
    | string[]
    | undefined
) {
  return Array.from(
    new Set(
      (details ?? [])
        .map(
          (detail) =>
            normalizeComparableText(
              detail
            )
        )
        .filter(Boolean)
    )
  )
    .sort()
    .join("|");
}


function sanitizeProposedWorkout(
  existing: TrainingPlanDay,
  proposed: TrainingPlanDay
): TrainingPlanDay {

  const sameSport =
    normalizeComparableText(
      existing.sport
    ) ===
    normalizeComparableText(
      proposed.sport
    );

  const sameTitle =
    normalizeComparableText(
      existing.title
    ) ===
    normalizeComparableText(
      proposed.title
    );

  const sameDuration =
    Number(
      existing.durationMinutes
    ) ===
    Number(
      proposed.durationMinutes
    );

  const sameIntensity =
    normalizeIntensityForComparison(
      existing.intensity
    ) ===
    normalizeIntensityForComparison(
      proposed.intensity
    );

  const samePurpose =
    normalizeComparableText(
      existing.purpose
    ) ===
    normalizeComparableText(
      proposed.purpose
    );

  const sameDetails =
    normalizeDetailsForComparison(
      existing.details
    ) ===
    normalizeDetailsForComparison(
      proposed.details
    );


  return {
    ...proposed,

    /*
      If Coach has not meaningfully changed a field,
      preserve the exact existing value.

      Real changes still pass through.
    */
    sport:
      sameSport
        ? existing.sport
        : proposed.sport,

    title:
      sameTitle
        ? existing.title
        : proposed.title,

    durationMinutes:
      sameDuration
        ? existing.durationMinutes
        : proposed.durationMinutes,

    intensity:
      sameIntensity
        ? existing.intensity
        : proposed.intensity,

    purpose:
      samePurpose
        ? existing.purpose
        : proposed.purpose,

    details:
      sameDetails
        ? existing.details
        : proposed.details,
  };
}


function createAdjustment(
  existing: TrainingPlanDay,
  reason?: string
) {
  return {
    adjustedAt:
      new Date().toISOString(),

    reason:
      reason?.trim() ||
      "Adjusted by Basse",

    previousDurationMinutes:
      existing.durationMinutes,

    source:
      "coach" as const,

    originalWorkout:
      existing.coachAdjustment
        ?.originalWorkout ?? {
        sport:
          existing.sport,

        title:
          existing.title,

        durationMinutes:
          existing.durationMinutes,

        intensity:
          existing.intensity,

        purpose:
          existing.purpose,

        details: [
          ...(existing.details ?? []),
        ],
      },
  };
}


function findMatchingSecondary({
  existing,
  proposed,
  usedSessionIds,
}: {
  existing: TrainingPlanDay[];
  proposed: TrainingPlanDay;
  usedSessionIds: Set<string>;
}) {

  /*
    Best identity:
    stable sessionId.
  */
  if (proposed.sessionId) {

    const byId =
      existing.find(
        (session) =>
          session.sessionId ===
            proposed.sessionId &&
          (
            !session.sessionId ||
            !usedSessionIds.has(
              session.sessionId
            )
          )
      );

    if (byId) {
      return byId;
    }
  }


  /*
    When AI output omits sessionId, identity must remain
    conservative on multi-session days.

    Prefer an exact structural + title match first.
    This prevents two same-sport sessions in the same slot
    from being collapsed onto whichever happens to appear
    first in the array.
  */
  const availableSessions =
    existing.filter(
      (session) =>
        !(
          session.sessionId &&
          usedSessionIds.has(
            session.sessionId
          )
        )
    );


  const structuralMatches =
    availableSessions.filter(
      (session) =>
        session.day ===
          proposed.day &&
        (
          session.sessionSource ??
          "coach"
        ) ===
          (
            proposed.sessionSource ??
            "coach"
          ) &&
        (
          session.sessionSlot ??
          "Flexible"
        ) ===
          (
            proposed.sessionSlot ??
            "Flexible"
          ) &&
        session.sport ===
          proposed.sport
    );


  const exactStructuralMatch =
    structuralMatches.find(
      (session) =>
        session.title ===
          proposed.title
    );


  if (exactStructuralMatch) {
    return exactStructuralMatch;
  }


  /*
    A structural match without title is safe only when it
    identifies exactly one remaining workout.
  */
  if (structuralMatches.length === 1) {
    return structuralMatches[0];
  }


  /*
    Final legacy fallback:
    same day + sport + title.

    This is accepted only when unique. If multiple workouts
    still satisfy the fallback, refusing to guess is safer
    than mutating the wrong session.
  */
  const legacyMatches =
    availableSessions.filter(
      (session) =>
        session.day ===
          proposed.day &&
        session.sport ===
          proposed.sport &&
        session.title ===
          proposed.title
    );


  return (
    legacyMatches.length === 1
      ? legacyMatches[0]
      : null
  );
}


function calculatePlanHours({
  days,
  additionalSessions,
}: {
  days: TrainingPlanDay[];
  additionalSessions:
    TrainingPlanDay[];
}) {

  const totalMinutes = [
    ...days,
    ...additionalSessions,
  ].reduce(
    (
      total,
      session
    ) =>
      total +
      Math.max(
        0,
        Number(
          session.durationMinutes
        ) || 0
      ),
    0
  );


  return Number(
    (
      totalMinutes /
      60
    ).toFixed(2)
  );
}


export function mergeCoachPlanChange({
  currentPlan,
  proposedPlan,
  reason,
  feedback = [],
}: {
  currentPlan: TrainingPlan;
  proposedPlan: TrainingPlan;
  reason?: string;
  feedback?: WorkoutFeedback[];
}): TrainingPlan {

  // =====================================================
  // PRIMARY SESSIONS
  // =====================================================

  const mergedDays =
    proposedPlan.days.map(
      (proposedDay) => {

        /*
          Calendar placement and workout identity are
          separate concepts.

          The day slot supplies the calendar date.
          A stable sessionId identifies the actual workout,
          so that identity follows a workout when Coach
          moves it to another day.
        */
        const slotExisting =
          currentPlan.days.find(
            (day) =>
              day.day ===
              proposedDay.day
          );

        const identityExisting =
          proposedDay.sessionId
            ? currentPlan.days.find(
                (day) =>
                  day.sessionId ===
                  proposedDay.sessionId
              )
            : undefined;

        /*
          AI output may omit sessionId during a pure move.
          If the destination slot is Rest, look for the same
          real workout elsewhere in the current week.

          This lets workout identity follow the workout
          instead of treating the destination Rest slot as
          an adjusted 0-minute session.
        */
        const structurallyMovedCandidates =
          !identityExisting &&
          slotExisting?.sport === "Rest" &&
          proposedDay.sport !== "Rest"
            ? currentPlan.days.filter(
                (day) =>
                  day.day !==
                    proposedDay.day &&
                  day.sport ===
                    proposedDay.sport &&
                  day.title ===
                    proposedDay.title &&
                  day.durationMinutes ===
                    proposedDay.durationMinutes &&
                  day.intensity ===
                    proposedDay.intensity
              )
            : [];


        /*
          Structural move recovery is safe only when the
          workout can be identified uniquely.

          If two primary workouts have identical visible
          structure, refusing to guess is safer than moving
          the wrong session identity.
        */
        const structurallyMovedExisting =
          structurallyMovedCandidates.length === 1
            ? structurallyMovedCandidates[0]
            : undefined;

        const existing =
          identityExisting ??
          structurallyMovedExisting ??
          slotExisting;


        if (!existing) {
          return {
            ...proposedDay,

            sessionSource:
              "coach" as const,

            sessionRole:
              "primary" as const,

            sessionSlot:
              proposedDay.sessionSlot ??
              ("Flexible" as const),
          };
        }


        const sanitizedProposedDay =
          sanitizeProposedWorkout(
            existing,
            proposedDay
          );


        const changed =
          workoutChanged(
            existing,
            sanitizedProposedDay
          );


        return {
          ...sanitizedProposedDay,

          sessionId:
            identityExisting?.sessionId ??
            structurallyMovedExisting?.sessionId ??
            proposedDay.sessionId ??
            slotExisting?.sessionId,

          /*
            Date belongs to the destination day,
            not to the workout's previous placement.
          */
          date:
            slotExisting?.date ??
            proposedDay.date,

          sessionSource:
            "coach" as const,

          sessionRole:
            "primary" as const,

          sessionSlot:
            proposedDay.sessionSlot ??
            existing.sessionSlot ??
            ("Flexible" as const),

          /*
            A pure move is not a duration/intensity
            adjustment. If the workout itself is unchanged,
            keep its previous adjustment state.
          */
          coachAdjustment:
            changed
              ? createAdjustment(
                  existing,
                  reason
                )
              : existing
                  .coachAdjustment,
        };
      }
    );


  /*
    =====================================================
    FINALIZED PRIMARY SESSION GUARD
    =====================================================

    Completed / Modified / Skipped feedback finalizes the
    exact workout identity.

    Coach may change the rest of the week, but may not:
    - rewrite it
    - move it
    - replace it
    - remove it
  */
  const protectedPrimarySessions =
    currentPlan.days.filter(
      (workout) =>
        feedback.some(
          (entry) =>
            workoutMatchesFeedback(
              workout,
              entry
            )
        )
    );


  const protectedPrimaryIds =
    new Set(
      protectedPrimarySessions
        .map(
          (workout) =>
            workout.sessionId
        )
        .filter(
          (
            sessionId
          ): sessionId is string =>
            Boolean(sessionId)
        )
    );


  const protectedMergedDays =
    mergedDays.map(
      (mergedDay) => {

        const currentSlot =
          currentPlan.days.find(
            (workout) =>
              workout.day ===
              mergedDay.day
          );


        if (
          currentSlot &&
          protectedPrimarySessions.some(
            (protectedWorkout) =>
              protectedWorkout ===
              currentSlot
          )
        ) {
          return currentSlot;
        }


        if (
          mergedDay.sessionId &&
          protectedPrimaryIds.has(
            mergedDay.sessionId
          )
        ) {
          return (
            currentSlot ??
            mergedDay
          );
        }


        return mergedDay;
      }
    );


  // =====================================================
  // SECONDARY SESSIONS
  // =====================================================

  const currentSecondary =
    currentPlan.additionalSessions ??
    [];


  /*
    Athlete-owned sessions are protected.
  */
  const athleteOwned =
    currentSecondary.filter(
      (session) =>
        session.sessionSource ===
          "athlete"
    );


  /*
    Protect legacy sessions that pre-date
    sessionSource metadata too.
  */
  const legacyAthleteOwned =
    currentSecondary.filter(
      (session) =>
        !session.sessionSource
    );


  const protectedAthleteSessions = [
    ...athleteOwned,
    ...legacyAthleteOwned,
  ];


  const existingCoachSecondary =
    currentSecondary.filter(
      (session) =>
        session.sessionSource ===
          "coach"
    );


  /*
    Athlete-owned sessions stay protected by default, but
    Coach must still be able to adjust one when the athlete
    explicitly asks for it.

    Proposed athlete sessions are therefore merged back onto
    the existing athlete-owned session identity instead of
    being discarded.
  */
  const proposedSecondary =
    proposedPlan.additionalSessions ??
    [];

  const proposedAthleteSecondary =
    proposedSecondary.filter(
      (session) =>
        session.sessionSource ===
          "athlete"
    );

  const proposedCoachSecondary =
    proposedSecondary.filter(
      (session) =>
        session.sessionSource !==
          "athlete"
    );


  const usedAthleteIds =
    new Set<string>();


  const usedAthleteSessions =
    new Set<TrainingPlanDay>();


  const normalizedReason =
    (reason ?? "").toLowerCase();


  /*
    What kind of change did the athlete actually ask for?

    These rules do NOT decide which workout is targeted.
    They only define which fields Coach is allowed to change
    on an athlete-owned workout.
  */
  const durationRequested =
    /\b(duration|time|minute|minutes|min|shorten|shorter|longer|reduce|reduced|increase|increased|tid|minutt|minutter|kortere|lengre|reduser|redusere|øk|øke)\b/i.test(
      reason ?? ""
    );

  const intensityRequested =
    /\b(intensity|easy|easier|hard|harder|effort|rpe|intensitet|lett|lettere|hardere)\b/i.test(
      reason ?? ""
    );

  const titleRequested =
    /\b(title|name|rename|called|navn|endre navn|kall)\b/i.test(
      reason ?? ""
    );

  const sportRequested =
    /\b(change sport|change discipline|sport|discipline|bytt sport|endre sport|disiplin)\b/i.test(
      reason ?? ""
    );

  const placementRequested =
    /\b(move|reschedule|move it|flytt|flytte|bytt dag|endre dag)\b/i.test(
      reason ?? ""
    );

  const detailsRequested =
    /\b(details|structure|interval|intervals|note|notes|purpose|rpe|watt|watts|power|detalj|detaljer|struktur|intervall|intervaller|notat|hensikt)\b/i.test(
      reason ?? ""
    );

  const generalChangeRequested =
    /\b(change|adjust|adapt|modify|edit|endre|juster|justere|tilpass|tilpasse)\b/i.test(
      reason ?? ""
    );


  /*
    sessionId gives us a second, much stronger targeting signal.

    If Coach proposes a relevant change to exactly ONE existing
    athlete-owned workout, that workout may be treated as the
    intended target even when the athlete did not type its full
    title verbatim.

    This solves requests such as:
      "make the hike 10 minutes shorter"

    without allowing unrelated manual workouts to drift.
  */
  const requestedAthleteCandidateIds =
    proposedAthleteSecondary
      .map((proposedSession) => {

        if (!proposedSession.sessionId) {
          return null;
        }

        const existing =
          protectedAthleteSessions.find(
            (session) =>
              session.sessionId ===
                proposedSession.sessionId
          );

        if (!existing) {
          return null;
        }

        const sanitized =
          sanitizeProposedWorkout(
            existing,
            proposedSession
          );

        const relevantChange =
          (
            durationRequested &&
            Number(existing.durationMinutes) !==
              Number(sanitized.durationMinutes)
          ) ||
          (
            intensityRequested &&
            normalizeIntensityForComparison(
              existing.intensity
            ) !==
              normalizeIntensityForComparison(
                sanitized.intensity
              )
          ) ||
          (
            titleRequested &&
            normalizeComparableText(
              existing.title
            ) !==
              normalizeComparableText(
                sanitized.title
              )
          ) ||
          (
            sportRequested &&
            normalizeComparableText(
              existing.sport
            ) !==
              normalizeComparableText(
                sanitized.sport
              )
          ) ||
          (
            placementRequested &&
            (
              existing.day !==
                sanitized.day ||
              existing.sessionSlot !==
                sanitized.sessionSlot
            )
          ) ||
          (
            detailsRequested &&
            (
              normalizeComparableText(
                existing.purpose
              ) !==
                normalizeComparableText(
                  sanitized.purpose
                ) ||
              normalizeDetailsForComparison(
                existing.details
              ) !==
                normalizeDetailsForComparison(
                  sanitized.details
                )
            )
          ) ||
          (
            generalChangeRequested &&
            workoutChanged(
              existing,
              sanitized
            )
          );

        return relevantChange
          ? existing.sessionId
          : null;
      })
      .filter(
        (sessionId): sessionId is string =>
          Boolean(sessionId)
      );


  const uniqueRequestedAthleteIds =
    Array.from(
      new Set(
        requestedAthleteCandidateIds
      )
    );

  const inferredTargetAthleteId =
    uniqueRequestedAthleteIds.length === 1
      ? uniqueRequestedAthleteIds[0]
      : null;


  const mergedAthleteSecondary =
    proposedAthleteSecondary.map(
      (
        proposedSession,
        index
      ) => {

        const existing =
          findMatchingSecondary({
            existing:
              protectedAthleteSessions,

            proposed:
              proposedSession,

            usedSessionIds:
              usedAthleteIds,
          });


        if (existing) {
          usedAthleteSessions.add(
            existing
          );

          if (
            existing.sessionId
          ) {
            usedAthleteIds.add(
              existing.sessionId
            );
          }
        }


        if (!existing) {
          return {
            ...proposedSession,

            sessionId:
              proposedSession.sessionId ??
              `manual-${Date.now()}-${index}`,

            sessionSource:
              "athlete" as const,

            sessionRole:
              "secondary" as const,

            sessionSlot:
              proposedSession.sessionSlot ??
              ("Flexible" as const),
          };
        }


        /*
          Athlete-owned workouts are authoritative.

          Coach may change one only when the athlete's request
          clearly identifies that workout. This prevents an
          unrelated manual workout from being rewritten just
          because the model echoed it with slightly different
          content.
        */
        const titleMentioned =
          existing.title.trim().length >= 3 &&
          normalizedReason.includes(
            existing.title
              .trim()
              .toLowerCase()
          );

        const dayAndSportMentioned =
          normalizedReason.includes(
            existing.day.toLowerCase()
          ) &&
          normalizedReason.includes(
            existing.sport.toLowerCase()
          );

        const sameSportAthleteSessions =
          protectedAthleteSessions.filter(
            (session) =>
              session.sport ===
                existing.sport
          );

        const uniqueSportMentioned =
          sameSportAthleteSessions.length === 1 &&
          normalizedReason.includes(
            existing.sport.toLowerCase()
          );

        const sessionIdMentioned =
          !!existing.sessionId &&
          normalizedReason.includes(
            existing.sessionId.toLowerCase()
          );


        const explicitlyTargeted =
          sessionIdMentioned ||
          titleMentioned ||
          dayAndSportMentioned ||
          uniqueSportMentioned ||
          (
            !!existing.sessionId &&
            inferredTargetAthleteId ===
              existing.sessionId
          );


        if (!explicitlyTargeted) {
          return existing;
        }


        /*
          Only accept fields the athlete actually asked Coach
          to modify. Unrequested AI-generated details such as
          RPE, watts or extra structure must not leak into a
          manual workout.
        */
        const mergedSession = {
          ...existing,

          title:
            titleRequested
              ? proposedSession.title
              : existing.title,

          sport:
            sportRequested
              ? proposedSession.sport
              : existing.sport,

          durationMinutes:
            durationRequested
              ? proposedSession.durationMinutes
              : existing.durationMinutes,

          intensity:
            intensityRequested
              ? proposedSession.intensity
              : existing.intensity,

          purpose:
            detailsRequested
              ? proposedSession.purpose
              : existing.purpose,

          details:
            detailsRequested
              ? proposedSession.details
              : existing.details,

          day:
            placementRequested
              ? proposedSession.day
              : existing.day,

          date:
            placementRequested
              ? proposedSession.date
              : existing.date,

          sessionSlot:
            placementRequested
              ? (
                  proposedSession.sessionSlot ??
                  existing.sessionSlot ??
                  ("Flexible" as const)
                )
              : (
                  existing.sessionSlot ??
                  ("Flexible" as const)
                ),

          sessionId:
            existing.sessionId,

          sessionSource:
            "athlete" as const,

          sessionRole:
            "secondary" as const,
        };


        const changed =
          workoutChanged(
            existing,
            mergedSession
          ) ||
          existing.day !==
            mergedSession.day ||
          existing.sessionSlot !==
            mergedSession.sessionSlot;


        return {
          ...mergedSession,

          coachAdjustment:
            changed
              ? createAdjustment(
                  existing,
                  reason
                )
              : existing
                  .coachAdjustment,
        };
      }
    );


  /*
    Any athlete-owned session that Coach did not return is
    preserved unchanged. This prevents unrelated Coach
    requests from deleting or rewriting manual workouts.
  */
  const untouchedAthleteSecondary =
    protectedAthleteSessions.filter(
      (session) => {

        if (
          usedAthleteSessions.has(
            session
          )
        ) {
          return false;
        }

        if (
          session.sessionId &&
          usedAthleteIds.has(
            session.sessionId
          )
        ) {
          return false;
        }

        return true;
      }
    );


  const usedExistingIds =
    new Set<string>();


  const mergedCoachSecondary =
    proposedCoachSecondary.map(
      (
        proposedSession,
        index
      ) => {

        const existing =
          findMatchingSecondary({
            existing:
              existingCoachSecondary,

            proposed:
              proposedSession,

            usedSessionIds:
              usedExistingIds,
          });


        if (
          existing?.sessionId
        ) {
          usedExistingIds.add(
            existing.sessionId
          );
        }


        const sanitizedProposedSession =
          existing
            ? sanitizeProposedWorkout(
                existing,
                proposedSession
              )
            : proposedSession;


        const changed =
          existing
            ? (
                workoutChanged(
                  existing,
                  sanitizedProposedSession
                ) ||
                existing.day !==
                  sanitizedProposedSession.day ||
                existing.sessionSlot !==
                  sanitizedProposedSession.sessionSlot
              )
            : true;


        return {
          ...sanitizedProposedSession,

          sessionId:
            existing?.sessionId ??
            proposedSession.sessionId ??
            `${
              currentPlan.weekStart ??
              `week-${
                currentPlan.weekNumber ??
                "current"
              }`
            }-${
              proposedSession.day
                .toLowerCase()
                .replace(
                  /[^a-z0-9]+/g,
                  "-"
                )
            }-secondary-${index}`,

          date:
            proposedSession.date ??
            (
              existing?.day ===
                proposedSession.day
                ? existing.date
                : undefined
            ),

          sessionSource:
            "coach" as const,

          sessionRole:
            "secondary" as const,

          sessionSlot:
            proposedSession.sessionSlot ??
            existing?.sessionSlot ??
            ("Flexible" as const),

          coachAdjustment:
            existing &&
            changed
              ? createAdjustment(
                  existing,
                  reason
                )
              : existing
                  ?.coachAdjustment,
        };
      }
    );


  /*
    A request to move/swap the primary workout must not
    implicitly delete or rewrite second sessions on either day.

    Primary and secondary are storage roles, not separate
    calendars: moving the main workout leaves any second
    session on that day intact.
  */
  const placementRequest =
    /\b(move|swap|reschedule|flytt|flytte|bytt|bytte)\b/i.test(
      reason ?? ""
    );

  const explicitlyPrimaryRequest =
    /\b(primary|main|first|hoved|hovedøkt|første|førsteøkt)\b/i.test(
      reason ?? ""
    );

  const explicitlySecondaryRequest =
    /\b(second|secondary|extra|additional|double|andre|annen|ekstra|tilleggsøkt|dobbel)\b/i.test(
      reason ?? ""
    );

  const preserveCoachSecondary =
    placementRequest &&
    explicitlyPrimaryRequest &&
    !explicitlySecondaryRequest;

  const combinedAdditionalSessions = [
    ...mergedAthleteSecondary,
    ...untouchedAthleteSecondary,
    ...(
      preserveCoachSecondary
        ? existingCoachSecondary
        : mergedCoachSecondary
    ),
  ];


  /*
    Final identity guard.

    AI output or legacy data must never cause the same
    secondary workout to exist twice after merge.

    - sessionId is authoritative when present.
    - legacy no-ID sessions use a strict structural key.
  */
  const seenAdditionalIds =
    new Set<string>();

  const seenLegacyAdditional =
    new Set<string>();


  const additionalSessions =
    combinedAdditionalSessions.filter(
      (session) => {

        if (session.sessionId) {

          if (
            seenAdditionalIds.has(
              session.sessionId
            )
          ) {
            return false;
          }

          seenAdditionalIds.add(
            session.sessionId
          );

          return true;
        }


        const legacyKey = [
          session.day,
          session.sport,
          session.title,
          session.sessionSlot ??
            "Flexible",
          session.sessionSource ??
            "athlete",
        ].join("|");


        if (
          seenLegacyAdditional.has(
            legacyKey
          )
        ) {
          return false;
        }


        seenLegacyAdditional.add(
          legacyKey
        );

        return true;
      }
    );


  /*
    =====================================================
    FINALIZED SECONDARY SESSION GUARD
    =====================================================
  */
  const protectedSecondarySessions =
    currentSecondary.filter(
      (workout) =>
        feedback.some(
          (entry) =>
            workoutMatchesFeedback(
              workout,
              entry
            )
        )
    );


  const protectedSecondaryById =
    new Map(
      protectedSecondarySessions
        .filter(
          (workout) =>
            Boolean(
              workout.sessionId
            )
        )
        .map(
          (workout) => [
            workout.sessionId as string,
            workout,
          ])
    );


  const guardedAdditionalSessions =
    additionalSessions.map(
      (session) => {

        if (
          session.sessionId
        ) {
          const protectedSession =
            protectedSecondaryById.get(
              session.sessionId
            );

          if (protectedSession) {
            return protectedSession;
          }
        }


        const protectedLegacy =
          !session.sessionId
            ? protectedSecondarySessions.find(
                (protectedSession) =>
                  !protectedSession.sessionId &&
                  protectedSession.day ===
                    session.day &&
                  protectedSession.sport ===
                    session.sport &&
                  protectedSession.title ===
                    session.title
              )
            : undefined;


        return (
          protectedLegacy ??
          session
        );
      }
    );


  for (
    const protectedSession
    of protectedSecondarySessions
  ) {
    const alreadyPresent =
      guardedAdditionalSessions.some(
        (session) => {

          if (
            protectedSession.sessionId &&
            session.sessionId
          ) {
            return (
              protectedSession.sessionId ===
              session.sessionId
            );
          }


          if (
            protectedSession.sessionId ||
            session.sessionId
          ) {
            return false;
          }


          return (
            protectedSession.day ===
              session.day &&
            protectedSession.sport ===
              session.sport &&
            protectedSession.title ===
              session.title
          );
        }
      );


    if (!alreadyPresent) {
      guardedAdditionalSessions.push(
        protectedSession
      );
    }
  }


  const guardedSeenIds =
    new Set<string>();

  const guardedSeenLegacy =
    new Set<string>();


  const protectedAdditionalSessions =
    guardedAdditionalSessions.filter(
      (session) => {

        if (session.sessionId) {
          if (
            guardedSeenIds.has(
              session.sessionId
            )
          ) {
            return false;
          }

          guardedSeenIds.add(
            session.sessionId
          );

          return true;
        }


        const key = [
          session.day,
          session.sport,
          session.title,
          session.sessionSlot ??
            "Flexible",
          session.sessionSource ??
            "athlete",
        ].join("|");


        if (
          guardedSeenLegacy.has(
            key
          )
        ) {
          return false;
        }


        guardedSeenLegacy.add(
          key
        );

        return true;
      }
    );


  // =====================================================
  // TOTAL LOAD
  // =====================================================

  const totalHours =
    calculatePlanHours({
      days:
        protectedMergedDays,

      additionalSessions:
        protectedAdditionalSessions,
    });


  return {
    ...proposedPlan,

    weekNumber:
      currentPlan.weekNumber,

    weekStart:
      currentPlan.weekStart,

    days:
      protectedMergedDays,

    additionalSessions:
      protectedAdditionalSessions,

    totalHours,
  };
}
