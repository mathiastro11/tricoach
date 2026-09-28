"use client";


type SettingsModalProps = {
  open: boolean;
  userEmail: string;
  isResetting: boolean;
  isDeletingAccount: boolean;

  unitSystem:
    | "Metric"
    | "Imperial";

  onUnitSystemChange: (
    unitSystem:
      | "Metric"
      | "Imperial"
  ) => void;

  onClose: () => void;

  onResetTriCoach: () => void;
  onEditProfile: () => void;
  onPerformanceBenchmarks: () => void;
  onTargetRace: () => void;
  onFeedback: () => void;
  onResetPlan: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
};


export default function SettingsModal({
  open,
  userEmail,
  isResetting,
  isDeletingAccount,
  unitSystem,
  onUnitSystemChange,
  onClose,
  onResetTriCoach,
  onEditProfile,
  onPerformanceBenchmarks,
  onTargetRace,
  onFeedback,
  onResetPlan,
  onLogout,
  onDeleteAccount,
}: SettingsModalProps) {

  if (!open) {
    return null;
  }


  return (
    <div
      className="alpineModalOverlay alpineSettingsOverlay settingsV2Overlay"
      onClick={onClose}
    >

      <section
        className="alpineLegacyModal alpineSettingsModal settingsV2"
        onClick={(event) =>
          event.stopPropagation()
        }
        aria-label="Basse settings"
      >

        <header className="settingsV2Header">

          <div>

            <span className="settingsV2Kicker">
              BASSE
            </span>

            <h2>
              Settings
            </h2>

            <p>
              Your Basse setup.
            </p>

          </div>


          <button
            type="button"
            className="settingsV2Close"
            aria-label="Close settings"
            onClick={onClose}
          >
            ×
          </button>

        </header>



        {/* =============================================
            ACCOUNT
        ============================================= */}

        <section className="settingsV2Section">

          <div className="settingsV2SectionHead">

            <div>
              <span>
                ACCOUNT
              </span>

              <strong>
                Your Basse account
              </strong>
            </div>

          </div>


          <div className="settingsV2AccountRow">

            <div className="settingsV2AccountIdentity">

              <div
                className="settingsV2AccountAvatar"
                aria-hidden="true"
              >
                {(
                  userEmail ||
                  "A"
                )
                  .slice(0, 1)
                  .toUpperCase()}
              </div>

              <div>

                <small>
                  SIGNED IN AS
                </small>

                <strong>
                  {userEmail ||
                    "Basse athlete"}
                </strong>

              </div>

            </div>


            <button
              type="button"
              className="settingsV2QuietButton"
              onClick={onLogout}
            >
              Log out
            </button>

          </div>


        </section>



        {/* =============================================
            ATHLETE
        ============================================= */}

        <section className="settingsV2Section">

          <div className="settingsV2SectionHead">

            <div>
              <span>
                ATHLETE
              </span>

              <strong>
                Coaching profile
              </strong>
            </div>

            <small>
              Coaching inputs
            </small>

          </div>


          <div className="settingsV2ActionList">

            <button
              type="button"
              className="settingsV2Action settingsV2ActionProfile"
              onClick={onEditProfile}
            >
              <span>
                <strong>
                  Athlete profile
                </strong>

                <small>
                  Level · availability · equipment
                </small>
              </span>

              <i>
                →
              </i>
            </button>


            <button
              type="button"
              className="settingsV2Action settingsV2ActionBenchmark"
              onClick={
                onPerformanceBenchmarks
              }
            >
              <span>
                <strong>
                  Performance benchmarks
                </strong>

                <small>
                  Pace · power · performance
                </small>
              </span>

              <i>
                →
              </i>
            </button>


            <button
              type="button"
              className="settingsV2Action settingsV2ActionRace"
              onClick={onTargetRace}
            >
              <span>
                <strong>
                  Target race
                </strong>

                <small>
                  Goal · date · course
                </small>
              </span>

              <i>
                →
              </i>
            </button>

          </div>

        </section>



        {/* =============================================
            PREFERENCES
        ============================================= */}

        <section className="settingsV2Section">

          <div className="settingsV2SectionHead">

            <div>
              <span>
                PREFERENCES
              </span>

              <strong>
                Units
              </strong>
            </div>

            <small>
              Display
            </small>

          </div>


          <div
            className="settingsV2UnitSelector"
            role="group"
            aria-label="Unit system"
          >

            {(
              [
                "Metric",
                "Imperial",
              ] as const
            ).map(
              (option) => (

                <button
                  key={option}
                  type="button"
                  className={
                    unitSystem === option
                      ? "settingsUnitOption selected"
                      : "settingsUnitOption"
                  }
                  aria-pressed={
                    unitSystem === option
                  }
                  onClick={() =>
                    onUnitSystemChange(
                      option
                    )
                  }
                >

                  <strong>
                    {option}
                  </strong>

                  <small>
                    {option === "Metric"
                      ? "km · m · min/km"
                      : "mi · yd · min/mi"}
                  </small>

                </button>

              )
            )}

          </div>

        </section>



        {/* =============================================
            SUPPORT
        ============================================= */}

        <section className="settingsV2Section">

          <div className="settingsV2SectionHead">

            <div>
              <span>
                SUPPORT
              </span>

              <strong>
                Help shape Basse
              </strong>
            </div>

            <small>
              Direct feedback
            </small>

          </div>


          <div className="settingsV2ActionList">

            <button
              type="button"
              className="settingsV2Action settingsV2ActionFeedback"
              onClick={onFeedback}
            >
              <span>
                <strong>
                  Send feedback
                </strong>

                <small>
                  Bug · idea · design · anything else
                </small>
              </span>

              <i>
                →
              </i>
            </button>

          </div>

        </section>



        {/* =============================================
            TRAINING PLAN
        ============================================= */}

        <section className="settingsV2Section">

          <div className="settingsV2SectionHead">

            <div>
              <span>
                TRAINING PLAN
              </span>

              <strong>
                Start again
              </strong>
            </div>

          </div>


          <div className="settingsV2PlanRow">

            <p>
              Rebuild your plan without changing your profile.
            </p>

            <button
              type="button"
              className="settingsV2QuietButton"
              disabled={isResetting}
              onClick={onResetPlan}
            >
              {isResetting
                ? "Resetting..."
                : "Reset plan"}
            </button>

          </div>

        </section>



        {/* =============================================
            DEVELOPER
        ============================================= */}

        <section className="settingsV2Developer">

          <div>

            <span>
              DEVELOPER
            </span>

            <strong>
              Reset Basse
            </strong>

            <p>
              Clear local Basse data and start over.
            </p>

          </div>


          <button
            type="button"
            className="settingsV2DangerButton"
            onClick={onResetTriCoach}
          >
            Reset everything
          </button>

        </section>


        {/* =============================================
            ACCOUNT DELETION
        ============================================= */}

        <section className="settingsV2AccountDeleteRow">

          <div>
            <span>
              ACCOUNT DELETION
            </span>

            <strong>
              Delete account
            </strong>

            <p>
              Permanently remove your account and all
              associated Basse data.
            </p>
          </div>


          <button
            type="button"
            className="settingsV2DangerButton"
            disabled={isDeletingAccount}
            onClick={onDeleteAccount}
          >
            {isDeletingAccount
              ? "Deleting..."
              : "Delete account"}
          </button>

        </section>

      </section>

    </div>
  );
}
