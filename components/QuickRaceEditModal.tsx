"use client";

import {
  useState,
} from "react";

import type {
  TargetRace,
  TargetRaceCourseProfile,
} from "@/types/training";


type Props = {
  open: boolean;

  race: TargetRace;

  unitSystem?:
    | "Metric"
    | "Imperial";

  onClose: () => void;

  onSave: (
    race: TargetRace
  ) => void;

  onAdvancedEdit?: () => void;
};


function numberOrNull(
  value: string
) {
  if (!value.trim()) {
    return null;
  }

  const parsed =
    Number(
      value.replace(",", ".")
    );

  return Number.isFinite(parsed) &&
    parsed >= 0
      ? parsed
      : null;
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

  if (unitSystem === "Imperial") {
    return Number(
      (
        km *
        0.6213711922
      ).toFixed(2)
    ).toString();
  }

  return Number(
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

  if (unitSystem === "Imperial") {
    return Math.round(
      metres * 3.280839895
    ).toString();
  }

  return Math.round(
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


type QuickRaceEditModalContentProps = {
  race: TargetRace;

  unitSystem:
    | "Metric"
    | "Imperial";

  onClose: () => void;

  onSave:
    Props["onSave"];

  onAdvancedEdit?:
    Props["onAdvancedEdit"];
};


function QuickRaceEditModalContent({
  race,
  unitSystem,
  onClose,
  onSave,
  onAdvancedEdit,
}: QuickRaceEditModalContentProps) {

  const [date, setDate] =
    useState(
      race.date ?? ""
    );

  const [
    swimDistance,
    setSwimDistance,
  ] = useState(
    kmToDisplay(
      race.swim?.distanceKm,
      unitSystem
    )
  );

  const [
    bikeDistance,
    setBikeDistance,
  ] = useState(
    kmToDisplay(
      race.bike?.distanceKm,
      unitSystem
    )
  );

  const [
    bikeElevation,
    setBikeElevation,
  ] = useState(
    metresToDisplay(
      race.bike?.elevationGainM,
      unitSystem
    )
  );

  const [
    bikeProfile,
    setBikeProfile,
  ] = useState<
    TargetRaceCourseProfile
  >(
    race.bike?.profile ??
      "Unknown"
  );

  const [
    runDistance,
    setRunDistance,
  ] = useState(
    kmToDisplay(
      race.run?.distanceKm,
      unitSystem
    )
  );

  const [
    runElevation,
    setRunElevation,
  ] = useState(
    metresToDisplay(
      race.run?.elevationGainM,
      unitSystem
    )
  );

  const [
    runProfile,
    setRunProfile,
  ] = useState<
    TargetRaceCourseProfile
  >(
    race.run?.profile ??
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
    race.run?.surface ??
      "Road"
  );


  function save() {
    const bikeElevationValue =
      displayElevationToMetres(
        numberOrNull(
          bikeElevation
        ),
        unitSystem
      );

    const runElevationValue =
      displayElevationToMetres(
        numberOrNull(
          runElevation
        ),
        unitSystem
      );


    onSave({
      ...race,

      date,

      swim: {
        ...race.swim,

        distanceKm:
          displayDistanceToKm(
            numberOrNull(
              swimDistance
            ),
            unitSystem
          ),
      },

      bike: {
        ...race.bike,

        distanceKm:
          displayDistanceToKm(
            numberOrNull(
              bikeDistance
            ),
            unitSystem
          ),

        elevationGainM:
          bikeElevationValue,

        /*
          Once the athlete changes elevation,
          remove catalog-specific display text
          such as "3,000+ m".
        */
        elevationDisplay:
          bikeElevation.trim()
            ? `${Math.round(
                bikeElevationValue ?? 0
              )} m`
            : undefined,

        profile:
          bikeProfile,
      },

      run: {
        ...race.run,

        distanceKm:
          displayDistanceToKm(
            numberOrNull(
              runDistance
            ),
            unitSystem
          ),

        elevationGainM:
          runElevationValue,

        elevationDisplay:
          runElevation.trim()
            ? `${Math.round(
                runElevationValue ?? 0
              )} m`
            : undefined,

        profile:
          runProfile,

        surface:
          runSurface,
      },

      userModified:
        true,

      updatedAt:
        new Date()
          .toISOString(),
    });
  }


  const labelStyle = {
    display: "grid",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 800,
  };


  return (
    <div
      className="alpineModalOverlay alpineQuickRaceOverlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 190,

        display: "grid",
        placeItems: "center",

        padding: "20px",

        background:
          "rgba(20, 22, 18, .52)",
      }}
    >
      <section
        className="alpineLegacyModal alpineQuickRaceModal"
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: "520px",

          maxHeight:
            "calc(100vh - 40px)",

          overflowY: "auto",

          padding: "25px",

          borderRadius: "22px",

          background: "rgba(29, 43, 36, .98)",

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
          }}
        >
          <div>
            <div className="eyebrow">
              QUICK EDIT
            </div>

            <h2
              style={{
                margin:
                  ".4rem 0 .3rem",
              }}
            >
              {race.name}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#87998e",
                fontSize: "13px",
                lineHeight: 1.45,
              }}
            >
              Correct anything that
              differs from your race
              information.
            </p>
          </div>

          <button
            type="button"
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
            gap: "18px",
            marginTop: "22px",
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


          <div>
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "9px",
              }}
            >
              SWIM
            </div>

            <label style={labelStyle}>
              Distance · {unitSystem ===
                "Imperial"
                  ? "mi"
                  : "km"}

              <input
                className="field"
                inputMode="decimal"
                value={swimDistance}
                onChange={(event) =>
                  setSwimDistance(
                    event.target.value
                  )
                }
              />
            </label>
          </div>


          <div>
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "9px",
              }}
            >
              BIKE
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "10px",
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
                  onChange={(event) =>
                    setBikeElevation(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>

            <label
              style={{
                ...labelStyle,
                marginTop: "10px",
              }}
            >
              Course profile

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
                ].map(
                  (value) => (
                    <option
                      key={value}
                    >
                      {value}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>


          <div>
            <div
              className="eyebrow"
              style={{
                marginBottom:
                  "9px",
              }}
            >
              RUN
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "10px",
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
                  onChange={(event) =>
                    setRunElevation(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <label style={labelStyle}>
                Course profile

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
                  ].map(
                    (value) => (
                      <option
                        key={value}
                      >
                        {value}
                      </option>
                    )
                  )}
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
                  ].map(
                    (value) => (
                      <option
                        key={value}
                      >
                        {value}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          </div>
        </div>


        <button
          type="button"
          className="primary full"
          onClick={save}
          style={{
            marginTop: "22px",
          }}
        >
          Save changes
        </button>


        {onAdvancedEdit && (
          <button
            type="button"
            onClick={
              onAdvancedEdit
            }
            style={{
              width: "100%",
              marginTop: "7px",
              padding: "10px",

              border: 0,
              background:
                "transparent",

              color: "#87998e",

              fontSize: "12px",
              fontWeight: 700,

              cursor: "pointer",
            }}
          >
            Advanced race edit
          </button>
        )}
      </section>
    </div>
  );
}


export default function QuickRaceEditModal({
  open,
  race,
  unitSystem = "Metric",
  onClose,
  onSave,
  onAdvancedEdit,
}: Props) {
  if (!open) {
    return null;
  }

  const raceKey = [
    race.name,
    race.date ?? "",
    race.updatedAt ?? "",
    race.swim?.distanceKm ?? "",
    race.bike?.distanceKm ?? "",
    race.bike?.elevationGainM ?? "",
    race.bike?.profile ?? "",
    race.run?.distanceKm ?? "",
    race.run?.elevationGainM ?? "",
    race.run?.profile ?? "",
    race.run?.surface ?? "",
    unitSystem,
  ].join("|");

  return (
    <QuickRaceEditModalContent
      key={raceKey}
      race={race}
      unitSystem={unitSystem}
      onClose={onClose}
      onSave={onSave}
      onAdvancedEdit={
        onAdvancedEdit
      }
    />
  );
}
