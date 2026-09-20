"use client";

import type {
  TargetRace,
} from "@/types/training";

import {
  RACE_CATALOG,
} from "@/lib/race-catalog";


type RaceGoalCardProps = {
  race: TargetRace;

  unitSystem?:
    | "Metric"
    | "Imperial";

  onViewRace: () => void;
};


function daysUntilRace(
  date: string
) {
  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const target =
    new Date(
      `${date}T12:00:00`
    );

  const diff =
    target.getTime() -
    today.getTime();

  return Math.ceil(
    diff / 86_400_000
  );
}


function countdownLabel(
  days: number
) {
  if (days < 0) {
    return {
      value: "DONE",
      label: "RACE COMPLETE",
    };
  }

  if (days === 0) {
    return {
      value: "TODAY",
      label: "RACE DAY",
    };
  }

  if (days === 1) {
    return {
      value: "1",
      label: "DAY TO GO",
    };
  }

  if (days <= 7) {
    return {
      value:
        String(days),

      label:
        "DAYS · RACE WEEK",
    };
  }

  return {
    value:
      String(days),

    label:
      "DAYS TO GO",
  };
}


function formatRaceDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )
    .format(
      new Date(
        `${date}T12:00:00`
      )
    )
    .toUpperCase();
}


function raceEmoji(
  race: TargetRace
) {
  /*
    Manual targets must never inherit branding
    from a previously selected catalog race.
  */
  if (race.source === "manual") {
    return "🏁";
  }

  const catalogRace =
    RACE_CATALOG.find(
      (entry) =>
        race.id.startsWith(
          `${entry.id}-`
        ) ||
        race.id === entry.id
    );

  return (
    catalogRace?.emoji ??
    "🏁"
  );
}


export default function RaceGoalCard({
  race,
  unitSystem = "Metric",
  onViewRace,
}: RaceGoalCardProps) {

  const days =
    daysUntilRace(
      race.date
    );

  const countdown =
    countdownLabel(days);

  const swim =
    race.swim
      ?.distanceKm;

  const bike =
    race.bike
      ?.distanceKm;

  const run =
    race.run
      ?.distanceKm;


  function formatDistance(
    km: number
  ) {
    if (
      unitSystem ===
      "Imperial"
    ) {
      const miles =
        km * 0.6213711922;

      const rounded =
        miles >= 10
          ? miles.toFixed(1)
          : miles.toFixed(2);

      return `${Number(
        rounded
      )} mi`;
    }

    return `${Number(
      km.toFixed(2)
    )} km`;
  }


  return (
    <section
      className="raceGoalCard"
      style={{
        position: "relative",
        overflow: "hidden",

        marginBottom: "22px",
        padding: "24px",

        border:
          "1px solid var(--line)",
        borderRadius: "22px",

        background:
          "linear-gradient(145deg, #f8f7f2 0%, #ffffff 72%)",

        boxShadow:
          "0 14px 42px rgba(20, 22, 18, .06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-38px",
          top: "-48px",

          width: "170px",
          height: "170px",

          borderRadius: "50%",

          background:
            "rgba(20, 22, 18, .025)",
        }}
      />


      <div
        className="raceGoalMain"
        style={{
          position: "relative",
          zIndex: 1,

          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) auto",

          gap: "24px",
          alignItems: "start",
        }}
      >
        <div>
          <div className="eyebrow">
            YOUR BIG GOAL
          </div>

          <div
            className="raceGoalIdentity"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",

              marginTop: "9px",
            }}
          >
            <span
              style={{
                fontSize: "29px",
                lineHeight: 1,
              }}
            >
              {raceEmoji(race)}
            </span>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "clamp(1.2rem, 2vw, 1.55rem)",
                  lineHeight: 1.12,
                }}
              >
                {race.name}
              </h2>

              {race.location && (
                <div
                  style={{
                    marginTop: "5px",
                    color:
                      "var(--muted)",
                    fontSize:
                      "13px",
                  }}
                >
                  {race.location}
                </div>
              )}
            </div>
          </div>


          <div
            className="raceGoalDistances"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "18px",

              marginTop: "22px",
            }}
          >
            {swim != null && (
              <div>
                <div className="eyebrow">
                  SWIM
                </div>

                <strong>
                  {formatDistance(
                    swim
                  )}
                </strong>
              </div>
            )}

            {bike != null && (
              <div>
                <div className="eyebrow">
                  BIKE
                </div>

                <strong>
                  {formatDistance(
                    bike
                  )}
                </strong>
              </div>
            )}

            {run != null && (
              <div>
                <div className="eyebrow">
                  RUN
                </div>

                <strong>
                  {formatDistance(
                    run
                  )}
                </strong>
              </div>
            )}
          </div>


          <div
            style={{
              marginTop: "18px",
              color:
                "var(--muted)",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing:
                ".04em",
            }}
          >
            {formatRaceDate(
              race.date
            )}
          </div>
        </div>


        <div
          className="raceGoalCountdown"
          style={{
            minWidth: "132px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize:
                countdown.value ===
                "TODAY"
                  ? "2rem"
                  : "3.2rem",

              lineHeight: .95,
              fontWeight: 900,
              letterSpacing:
                "-.045em",
            }}
          >
            {countdown.value}
          </div>

          <div
            className="eyebrow"
            style={{
              marginTop: "8px",
              lineHeight: 1.3,
            }}
          >
            {countdown.label}
          </div>
        </div>
      </div>


      <div
        className="raceGoalFooter"
        style={{
          position: "relative",
          zIndex: 1,

          display: "flex",
          justifyContent:
            "flex-end",

          marginTop: "20px",
          paddingTop: "14px",

          borderTop:
            "1px solid var(--line)",
        }}
      >
        <button
          type="button"
          onClick={onViewRace}
          style={{
            border: 0,
            padding: 0,
            background:
              "transparent",

            color:
              "var(--ink)",

            fontSize: "12px",
            fontWeight: 800,

            cursor: "pointer",
          }}
        >
          View race →
        </button>
      </div>


      <style jsx>{`
        @media (
          max-width: 620px
        ) {
          section > div:first-of-type {
            grid-template-columns:
              1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
