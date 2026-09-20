"use client";

import {
  useState,
} from "react";

import type {
  TargetRace,
  TargetRaceCourseProfile,
} from "@/types/training";


type TargetRaceModalProps = {
  open: boolean;

  targetRace?:
    TargetRace;

  unitSystem?:
    | "Metric"
    | "Imperial";

  onClose: () => void;

  onSave: (
    race: TargetRace
  ) => void;

  onRemove?: () => void;
};


function positiveNumber(
  value: string
): number | null {

  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return parsed;
}


function kmToDisplay(
  km:
    | number
    | null
    | undefined,
  unitSystem:
    | "Metric"
    | "Imperial"
) {
  if (km == null) {
    return "";
  }

  return unitSystem === "Imperial"
    ? Number(
        (
          km *
          0.6213711922
        ).toFixed(2)
      ).toString()
    : Number(
        km.toFixed(2)
      ).toString();
}


function metresToDisplay(
  metres:
    | number
    | null
    | undefined,
  unitSystem:
    | "Metric"
    | "Imperial"
) {
  if (metres == null) {
    return "";
  }

  return unitSystem === "Imperial"
    ? Math.round(
        metres *
        3.280839895
      ).toString()
    : Math.round(
        metres
      ).toString();
}


function displayDistanceToKm(
  value:
    | number
    | null,
  unitSystem:
    | "Metric"
    | "Imperial"
) {
  if (value == null) {
    return null;
  }

  return unitSystem === "Imperial"
    ? value * 1.609344
    : value;
}


function displayElevationToMetres(
  value:
    | number
    | null,
  unitSystem:
    | "Metric"
    | "Imperial"
) {
  if (value == null) {
    return null;
  }

  return unitSystem === "Imperial"
    ? value * 0.3048
    : value;
}


type TargetRaceModalContentProps = {
  targetRace?:
    TargetRace;

  unitSystem:
    | "Metric"
    | "Imperial";

  onClose: () => void;

  onSave:
    TargetRaceModalProps["onSave"];

  onRemove?:
    TargetRaceModalProps["onRemove"];
};


function TargetRaceModalContent({
  targetRace,
  unitSystem,
  onClose,
  onSave,
  onRemove,
}: TargetRaceModalContentProps) {

  const [name, setName] =
    useState(
      targetRace?.name ?? ""
    );

  const [date, setDate] =
    useState(
      targetRace?.date ?? ""
    );

  const [location, setLocation] =
    useState(
      targetRace?.location ?? ""
    );

  const [format, setFormat] =
    useState<
      TargetRace["format"]
    >(
      targetRace?.format ??
        "70.3"
    );


  const [
    swimDistance,
    setSwimDistance,
  ] = useState(
    kmToDisplay(
      targetRace?.swim
        ?.distanceKm,
      unitSystem
    )
  );

  const [
    swimEnvironment,
    setSwimEnvironment,
  ] = useState<
    NonNullable<
      TargetRace["swim"]
    >["environment"]
  >(
    targetRace?.swim
      ?.environment ??
      "Open water"
  );


  const [
    bikeDistance,
    setBikeDistance,
  ] = useState(
    kmToDisplay(
      targetRace?.bike
        ?.distanceKm,
      unitSystem
    )
  );

  const [
    bikeElevation,
    setBikeElevation,
  ] = useState(
    metresToDisplay(
      targetRace?.bike
        ?.elevationGainM,
      unitSystem
    )
  );

  const [
    bikeProfile,
    setBikeProfile,
  ] = useState<
    TargetRaceCourseProfile
  >(
    targetRace?.bike
      ?.profile ??
      "Unknown"
  );


  const [
    runDistance,
    setRunDistance,
  ] = useState(
    kmToDisplay(
      targetRace?.run
        ?.distanceKm,
      unitSystem
    )
  );

  const [
    runElevation,
    setRunElevation,
  ] = useState(
    metresToDisplay(
      targetRace?.run
        ?.elevationGainM,
      unitSystem
    )
  );

  const [
    runProfile,
    setRunProfile,
  ] = useState<
    TargetRaceCourseProfile
  >(
    targetRace?.run
      ?.profile ??
      "Unknown"
  );

  const [
    runSurface,
    setRunSurface,
  ] = useState<
    NonNullable<
      TargetRace["run"]
    >["surface"]
  >(
    targetRace?.run
      ?.surface ??
      "Road"
  );


  const [notes, setNotes] =
    useState(
      targetRace?.notes ?? ""
    );

  const [
    validationError,
    setValidationError,
  ] = useState("");


  function save() {
    setValidationError("");

    if (!name.trim()) {
      setValidationError(
        "Add the race name."
      );
      return;
    }

    if (!date) {
      setValidationError(
        "Add the race date."
      );
      return;
    }

    const raceDate =
      new Date(
        `${date}T12:00:00`
      );

    if (
      Number.isNaN(
        raceDate.getTime()
      )
    ) {
      setValidationError(
        "Race date is invalid."
      );
      return;
    }

    const swimDisplay =
      swimDistance
        ? positiveNumber(
            swimDistance
          )
        : null;

    const bikeDisplay =
      bikeDistance
        ? positiveNumber(
            bikeDistance
          )
        : null;

    const bikeGainDisplay =
      bikeElevation
        ? positiveNumber(
            bikeElevation
          )
        : null;

    const runDisplay =
      runDistance
        ? positiveNumber(
            runDistance
          )
        : null;

    const runGainDisplay =
      runElevation
        ? positiveNumber(
            runElevation
          )
        : null;


    const swimKm =
      displayDistanceToKm(
        swimDisplay,
        unitSystem
      );

    const bikeKm =
      displayDistanceToKm(
        bikeDisplay,
        unitSystem
      );

    const bikeGain =
      displayElevationToMetres(
        bikeGainDisplay,
        unitSystem
      );

    const runKm =
      displayDistanceToKm(
        runDisplay,
        unitSystem
      );

    const runGain =
      displayElevationToMetres(
        runGainDisplay,
        unitSystem
      );


    const invalidNumber =
      (
        swimDistance &&
        swimDisplay === null
      ) ||
      (
        bikeDistance &&
        bikeDisplay === null
      ) ||
      (
        bikeElevation &&
        bikeGainDisplay === null
      ) ||
      (
        runDistance &&
        runDisplay === null
      ) ||
      (
        runElevation &&
        runGainDisplay === null
      );

    if (invalidNumber) {
      setValidationError(
        "Race distances and elevation must be valid positive numbers."
      );
      return;
    }


    onSave({
      id:
        targetRace?.source === "manual" &&
        targetRace.id.startsWith("manual-")
          ? targetRace.id
          : `manual-${Date.now()}`,

      name:
        name.trim(),

      date,

      location:
        location.trim() ||
        undefined,

      source:
        "manual",

      format,

      swim: {
        distanceKm:
          swimKm,

        environment:
          swimEnvironment,
      },

      bike: {
        distanceKm:
          bikeKm,

        elevationGainM:
          bikeGain,

        profile:
          bikeProfile,

        technicality:
          targetRace?.bike
            ?.technicality ??
          "Unknown",
      },

      run: {
        distanceKm:
          runKm,

        elevationGainM:
          runGain,

        profile:
          runProfile,

        surface:
          runSurface,
      },

      characteristics:
        targetRace
          ?.characteristics ??
        [],

      notes:
        notes.trim() ||
        undefined,

      updatedAt:
        new Date().toISOString(),
    });
  }


  const sectionStyle = {
    padding: "18px",
    border:
      "1px solid rgba(255,255,255,.05)",
    borderRadius: "16px",
    background: "rgba(255,255,255,.012)",
  };


  const labelStyle = {
    display: "grid",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 800,
  };


  return (
    <div
      className="alpineModalOverlay alpineTargetRaceOverlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background:
          "rgba(20, 22, 18, .48)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <section
        className="alpineLegacyModal alpineTargetRaceModal"
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight:
            "calc(100vh - 40px)",
          overflowY: "auto",
          background: "rgba(29,43,36,.98)",
          borderRadius: "24px",
          padding: "28px",
          boxShadow:
            "0 30px 80px rgba(0,0,0,.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div>
            <div className="eyebrow">
              GOAL RACE
            </div>

            <h2
              style={{
                marginTop: ".4rem",
                marginBottom: ".35rem",
              }}
            >
              Target race
            </h2>

            <p
              style={{
                margin: 0,
                color: "#87998e",
                lineHeight: 1.5,
              }}
            >
              Add the actual event you
              are training for. Basse
              will use the course and
              race demands to make your
              preparation more specific.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 0,
              background:
                "transparent",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>


        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <div
            className="targetRaceEditorSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              EVENT
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <label style={labelStyle}>
                Race name

                <input
                  className="field"
                  value={name}
                  placeholder="Norseman Xtreme Triathlon"
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "12px",
                }}
              >
                <label style={labelStyle}>
                  Race date

                  <input
                    className="field"
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value
                      )
                    }
                  />
                </label>

                <label style={labelStyle}>
                  Format

                  <select
                    className="field"
                    value={format}
                    onChange={(event) =>
                      setFormat(
                        event.target
                          .value as
                          TargetRace["format"]
                      )
                    }
                  >
                    <option>
                      Sprint
                    </option>

                    <option>
                      Olympic
                    </option>

                    <option>
                      70.3
                    </option>

                    <option>
                      Ironman
                    </option>

                    <option>
                      Other
                    </option>
                  </select>
                </label>
              </div>

              <label style={labelStyle}>
                Location

                <input
                  className="field"
                  value={location}
                  placeholder="Eidfjord, Norway"
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </div>


          <div
            className="targetRaceEditorSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              SWIM
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "12px",
              }}
            >
              <label style={labelStyle}>
                Distance · {unitSystem ===
                "Imperial"
                  ? "mi"
                  : "km"}

                <input
                  className="field"
                  inputMode="decimal"
                  value={swimDistance}
                  placeholder="1.9"
                  onChange={(event) =>
                    setSwimDistance(
                      event.target.value
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                Environment

                <select
                  className="field"
                  value={
                    swimEnvironment
                  }
                  onChange={(event) =>
                    setSwimEnvironment(
                      event.target
                        .value as
                        NonNullable<
                          TargetRace["swim"]
                        >["environment"]
                    )
                  }
                >
                  {[
                    "Pool",
                    "Lake",
                    "Sea",
                    "Fjord",
                    "River",
                    "Open water",
                    "Unknown",
                  ].map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>


          <div
            className="targetRaceEditorSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              BIKE
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
              }}
            >
              <label style={labelStyle}>
                Distance · {unitSystem ===
                "Imperial"
                  ? "mi"
                  : "km"}

                <input
                  className="field"
                  inputMode="decimal"
                  value={bikeDistance}
                  placeholder="90"
                  onChange={(event) =>
                    setBikeDistance(
                      event.target.value
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                Elevation · {unitSystem ===
                "Imperial"
                  ? "ft"
                  : "m"}

                <input
                  className="field"
                  inputMode="numeric"
                  value={bikeElevation}
                  placeholder="900"
                  onChange={(event) =>
                    setBikeElevation(
                      event.target.value
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                Course

                <select
                  className="field"
                  value={bikeProfile}
                  onChange={(event) =>
                    setBikeProfile(
                      event.target
                        .value as
                        TargetRaceCourseProfile
                    )
                  }
                >
                  {[
                    "Flat",
                    "Rolling",
                    "Hilly",
                    "Mountainous",
                    "Mixed",
                    "Unknown",
                  ].map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>


          <div
            className="targetRaceEditorSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              RUN
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(145px, 1fr))",
                gap: "12px",
              }}
            >
              <label style={labelStyle}>
                Distance · {unitSystem ===
                "Imperial"
                  ? "mi"
                  : "km"}

                <input
                  className="field"
                  inputMode="decimal"
                  value={runDistance}
                  placeholder="21.1"
                  onChange={(event) =>
                    setRunDistance(
                      event.target.value
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                Elevation · {unitSystem ===
                "Imperial"
                  ? "ft"
                  : "m"}

                <input
                  className="field"
                  inputMode="numeric"
                  value={runElevation}
                  placeholder="150"
                  onChange={(event) =>
                    setRunElevation(
                      event.target.value
                    )
                  }
                />
              </label>

              <label style={labelStyle}>
                Course

                <select
                  className="field"
                  value={runProfile}
                  onChange={(event) =>
                    setRunProfile(
                      event.target
                        .value as
                        TargetRaceCourseProfile
                    )
                  }
                >
                  {[
                    "Flat",
                    "Rolling",
                    "Hilly",
                    "Mountainous",
                    "Mixed",
                    "Unknown",
                  ].map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Surface

                <select
                  className="field"
                  value={runSurface}
                  onChange={(event) =>
                    setRunSurface(
                      event.target
                        .value as
                        NonNullable<
                          TargetRace["run"]
                        >["surface"]
                    )
                  }
                >
                  {[
                    "Road",
                    "Trail",
                    "Mixed",
                    "Unknown",
                  ].map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>


          <div
            className="targetRaceEditorSection"
            style={sectionStyle}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "12px",
              }}
            >
              NOTES
            </div>

            <textarea
              className="field"
              value={notes}
              placeholder="Anything useful about the course, conditions or race..."
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              style={{
                minHeight: "90px",
                resize: "vertical",
              }}
            />
          </div>
        </div>


        {validationError && (
          <div
            role="alert"
            style={{
              marginTop: "18px",
              padding: "12px 14px",
              border:
                "1px solid rgba(184,127,119,.14)",
              borderRadius: "12px",
              background: "rgba(255,255,255,.012)3f1",
              color: "#b2918b",
              fontSize: "13px",
              lineHeight: 1.45,
              fontWeight: 700,
            }}
          >
            {validationError}
          </div>
        )}


        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "10px",
            marginTop: "22px",
          }}
        >
          <div>
            {targetRace && onRemove && (
              <button
                className="secondary"
                onClick={onRemove}
                type="button"
              >
                Remove race
              </button>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              className="secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="primary"
              onClick={save}
            >
              Save target race
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


export default function TargetRaceModal({
  open,
  targetRace,
  unitSystem = "Metric",
  onClose,
  onSave,
  onRemove,
}: TargetRaceModalProps) {
  if (!open) {
    return null;
  }

  const raceKey = [
    targetRace?.id ?? "new-race",
    targetRace?.updatedAt ?? "",
    targetRace?.name ?? "",
    targetRace?.date ?? "",
    targetRace?.location ?? "",
    targetRace?.format ?? "",
    targetRace?.swim?.distanceKm ?? "",
    targetRace?.swim?.environment ?? "",
    targetRace?.bike?.distanceKm ?? "",
    targetRace?.bike?.elevationGainM ?? "",
    targetRace?.bike?.profile ?? "",
    targetRace?.run?.distanceKm ?? "",
    targetRace?.run?.elevationGainM ?? "",
    targetRace?.run?.profile ?? "",
    targetRace?.run?.surface ?? "",
    targetRace?.notes ?? "",
    unitSystem,
  ].join("|");

  return (
    <TargetRaceModalContent
      key={raceKey}
      targetRace={targetRace}
      unitSystem={unitSystem}
      onClose={onClose}
      onSave={onSave}
      onRemove={onRemove}
    />
  );
}
