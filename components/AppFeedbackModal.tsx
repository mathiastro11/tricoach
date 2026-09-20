"use client";

import {
  useState,
} from "react";


type FeedbackCategory =
  | "Bug"
  | "Idea"
  | "Design"
  | "Other";


type AppFeedbackModalProps = {
  open: boolean;

  userEmail:
    string;

  onClose:
    () => void;

  onSubmit:
    (feedback: {
      category:
        FeedbackCategory;

      message:
        string;

      contactAllowed:
        boolean;
    }) => Promise<void>;
};


const categories:
  Array<{
    value:
      FeedbackCategory;

    label:
      string;

    description:
      string;
  }> = [
    {
      value: "Bug",
      label: "Bug",
      description:
        "Something isn't working",
    },

    {
      value: "Idea",
      label: "Idea",
      description:
        "A feature or improvement",
    },

    {
      value: "Design",
      label: "Design",
      description:
        "Something feels unclear",
    },

    {
      value: "Other",
      label: "Other",
      description:
        "Anything else",
    },
  ];


type AppFeedbackModalContentProps = {
  userEmail:
    string;

  onClose:
    () => void;

  onSubmit:
    AppFeedbackModalProps["onSubmit"];
};


function AppFeedbackModalContent({
  userEmail,
  onClose,
  onSubmit,
}: AppFeedbackModalContentProps) {

  const [
    category,
    setCategory,
  ] =
    useState<FeedbackCategory>(
      "Idea"
    );


  const [
    message,
    setMessage,
  ] =
    useState("");


  const [
    contactAllowed,
    setContactAllowed,
  ] =
    useState(false);


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");


  async function submit() {

    const cleanMessage =
      message.trim();


    if (
      cleanMessage.length < 3
    ) {
      setErrorMessage(
        "Tell us a little more before sending."
      );

      return;
    }


    setIsSubmitting(true);
    setErrorMessage("");


    try {

      await onSubmit({
        category,
        message:
          cleanMessage,
        contactAllowed,
      });

    } catch (error) {

      console.error(
        "Could not send app feedback:",
        error
      );


      setErrorMessage(
        "Feedback could not be sent. Please try again."
      );


      setIsSubmitting(false);
    }
  }


  return (
    <div
      className="appFeedbackOverlay"
      onClick={
        isSubmitting
          ? undefined
          : onClose
      }
    >

      <section
        className="appFeedbackModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appFeedbackTitle"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <header
          className="appFeedbackHeader"
        >

          <div>

            <span
              className="appFeedbackKicker"
            >
              HELP SHAPE BASSE
            </span>

            <h2
              id="appFeedbackTitle"
            >
              Send feedback
            </h2>

            <p>
              Found something awkward,
              broken or worth improving?
              Send it directly from here.
            </p>

          </div>


          <button
            type="button"
            className="appFeedbackClose"
            aria-label="Close feedback"
            disabled={
              isSubmitting
            }
            onClick={
              onClose
            }
          >
            ×
          </button>

        </header>



        <div
          className="appFeedbackBody"
        >

          <section
            className="appFeedbackSection"
          >

            <div
              className="appFeedbackSectionHead"
            >

              <span>
                WHAT IS IT ABOUT?
              </span>

            </div>


            <div
              className="appFeedbackCategories"
            >

              {categories.map(
                (item) => (

                  <button
                    key={
                      item.value
                    }
                    type="button"
                    className={
                      category ===
                      item.value
                        ? "appFeedbackCategory selected"
                        : "appFeedbackCategory"
                    }
                    aria-pressed={
                      category ===
                      item.value
                    }
                    onClick={() =>
                      setCategory(
                        item.value
                      )
                    }
                  >

                    <strong>
                      {item.label}
                    </strong>

                    <small>
                      {
                        item.description
                      }
                    </small>

                  </button>

                )
              )}

            </div>

          </section>



          <section
            className="appFeedbackSection"
          >

            <label
              className="appFeedbackMessageLabel"
            >

              <span>
                YOUR FEEDBACK
              </span>

              <textarea
                value={
                  message
                }
                maxLength={
                  2000
                }
                autoFocus
                placeholder={
                  category === "Bug"
                    ? "What happened? What did you expect instead?"
                    : category === "Idea"
                    ? "What would make Basse better?"
                    : category === "Design"
                    ? "What feels unclear or inconsistent?"
                    : "Tell us what's on your mind."
                }
                onChange={(event) => {
                  setMessage(
                    event.target.value
                  );

                  if (
                    errorMessage
                  ) {
                    setErrorMessage(
                      ""
                    );
                  }
                }}
              />

            </label>


            <div
              className="appFeedbackMessageMeta"
            >

              <span>
                Be as specific as you want.
              </span>

              <span>
                {message.length}/2000
              </span>

            </div>

          </section>



          {userEmail && (

            <button
              type="button"
              className={
                contactAllowed
                  ? "appFeedbackContactToggle selected"
                  : "appFeedbackContactToggle"
              }
              aria-pressed={
                contactAllowed
              }
              onClick={() =>
                setContactAllowed(
                  (
                    current
                  ) =>
                    !current
                )
              }
            >

              <span
                className="appFeedbackToggleMark"
                aria-hidden="true"
              >
                {contactAllowed
                  ? "✓"
                  : ""}
              </span>


              <span>

                <strong>
                  You may contact me
                </strong>

                <small>
                  Follow up at {
                    userEmail
                  }
                </small>

              </span>

            </button>

          )}



          <div
            className="appFeedbackPrivacyNote"
          >

            <span
              aria-hidden="true"
            >
              ↗
            </span>

            <p>
              Basse automatically
              includes the current app
              view and training-week
              context so feedback is
              easier to understand.
            </p>

          </div>


          {errorMessage && (

            <div
              className="appFeedbackError"
              role="alert"
            >
              {errorMessage}
            </div>

          )}

        </div>



        <footer
          className="appFeedbackActions"
        >

          <button
            type="button"
            className="appFeedbackCancel"
            disabled={
              isSubmitting
            }
            onClick={
              onClose
            }
          >
            Cancel
          </button>


          <button
            type="button"
            className="appFeedbackSend"
            disabled={
              isSubmitting ||
              message.trim().length <
                3
            }
            onClick={() =>
              void submit()
            }
          >
            {isSubmitting
              ? "Sending..."
              : "Send feedback →"}
          </button>

        </footer>

      </section>

    </div>
  );
}


export default function AppFeedbackModal({
  open,
  userEmail,
  onClose,
  onSubmit,
}: AppFeedbackModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AppFeedbackModalContent
      userEmail={userEmail}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
