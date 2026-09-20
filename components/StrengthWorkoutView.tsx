"use client";

import ExerciseIllustration from "@/components/ExerciseIllustration";

import type {
  TrainingPlanDay,
} from "@/types/training";


type StrengthWorkoutViewProps = {
  workout: TrainingPlanDay;
  variant?: "details" | "today";
};


function formatRest(
  seconds: number
) {

  if (seconds < 60) {
    return `${seconds} s`;
  }

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}:00`;
  }

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}


function getGoalLabel(
  goal:
    NonNullable<
      TrainingPlanDay[
        "strengthStructure"
      ]
    >["goal"]
) {

  switch (goal) {

    case "Adaptation":
      return "STRENGTH ADAPTATION";

    case "MaxStrength":
      return "MAX STRENGTH";

    case "StrengthPower":
      return "STRENGTH + POWER";

    case "Maintenance":
      return "STRENGTH MAINTENANCE";

    case "Taper":
      return "TAPER STRENGTH";
  }
}


export default function StrengthWorkoutView({
  workout,
  variant = "details",
}: StrengthWorkoutViewProps) {

  const structure =
    workout.strengthStructure;

  if (
    !structure ||
    structure.exercises.length === 0
  ) {
    return null;
  }

  const compact =
    variant === "today";


  if (compact) {

    const visibleExercises =
      structure.exercises;


    return (
      <div
        className="strengthWorkoutView strengthWorkoutViewToday strengthWorkoutPreviewList"
      >

        <div className="strengthWorkoutSummary">

          <span className="strengthWorkoutGoal">
            {getGoalLabel(
              structure.goal
            )}
          </span>

          <span className="strengthWorkoutExerciseCount">
            {structure.exercises.length}{" "}
            {structure.exercises.length === 1
              ? "exercise"
              : "exercises"}
          </span>

        </div>


        <div className="strengthTodayExerciseList">

          {visibleExercises.map(
            (
              exercise,
              index
            ) => (

              <div
                className="strengthTodayExerciseRow"
                key={`${exercise.exerciseKey}-${exercise.name}-${index}`}
              >

                <span className="strengthTodayExerciseNumber">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </span>

                <strong>
                  {exercise.name}
                </strong>

                <span className="strengthTodayPrescription">
                  {exercise.sets} ×{" "}
                  {exercise.reps}
                </span>

              </div>

            )
          )}

        </div>


      </div>
    );
  }


  return (
    <div
      className={[
        "strengthWorkoutView",
        compact
          ? "strengthWorkoutViewToday"
          : "strengthWorkoutViewDetails",
        "strengthWorkoutViewExpandable",
      ].join(" ")}
    >

      <div className="strengthWorkoutSummary">

        <span className="strengthWorkoutGoal">
          {getGoalLabel(
            structure.goal
          )}
        </span>

        <span className="strengthWorkoutExerciseCount">
          {structure.exercises.length}{" "}
          {structure.exercises.length === 1
            ? "exercise"
            : "exercises"}
        </span>

      </div>


      {structure.warmup.length > 0 && (

        <div className="strengthWarmup">

          <div className="strengthWarmupLabel">
            WARM-UP
          </div>

          <div className="strengthWarmupSteps">

            {structure.warmup.map(
              (
                instruction,
                index
              ) => (

                <span
                  key={`${instruction}-${index}`}
                >
                  {instruction}
                </span>

              )
            )}

          </div>

        </div>

      )}


      <div className="strengthExerciseList">

        {structure.exercises.map(
          (
            exercise,
            index
          ) => (

            <details
              className="strengthExerciseCard strengthExerciseDisclosure"
              key={`${exercise.exerciseKey}-${exercise.name}-${index}`}
            >

              <summary className="strengthExerciseSummary">

                <div className="strengthExerciseSummaryIdentity">

                  <span className="strengthExerciseNumber">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <div className="strengthExerciseName">

                    <span className="strengthMovementPattern">
                      {exercise.movementPattern}
                    </span>

                    <strong>
                      {exercise.name}
                    </strong>

                  </div>

                </div>


                <div className="strengthExerciseSummaryRight">

                  <div className="strengthExerciseSummaryPrescription">

                    <strong>
                      {exercise.sets} ×{" "}
                      {exercise.reps}
                    </strong>

                    <span>
                      {formatRest(
                        exercise.restSeconds
                      )} rest
                    </span>

                  </div>

                  <span
                    className="strengthExerciseChevron"
                    aria-hidden="true"
                  >
                    ›
                  </span>

                </div>

              </summary>


              <div className="strengthExerciseExpanded">

                <div className="strengthExerciseExpandedPrescription">

                  <div>

                    <span>
                      LOAD
                    </span>

                    <strong>
                      {exercise.loadGuidance}
                    </strong>

                  </div>

                  <div>

                    <span>
                      REST
                    </span>

                    <strong>
                      {formatRest(
                        exercise.restSeconds
                      )}
                    </strong>

                  </div>

                </div>


                {exercise.instruction && (

                  <div className="strengthExerciseTechnique">

                    <span>
                      TECHNIQUE
                    </span>

                    <p>
                      {exercise.instruction}
                    </p>

                  </div>

                )}


                <ExerciseIllustration
                  exerciseKey={
                    exercise.exerciseKey
                  }
                  exerciseName={
                    exercise.name
                  }
                />


                {!compact &&
                  exercise.alternatives.length > 0 && (

                  <div className="strengthExerciseAlternatives">

                    <span>
                      ALTERNATIVES
                    </span>

                    <p>
                      {exercise.alternatives.join(
                        " · "
                      )}
                    </p>

                  </div>

                )}

              </div>

            </details>

          )
        )}

      </div>

    </div>
  );
}
