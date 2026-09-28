import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata:
  Metadata = {
    title:
      "Delete your Basse account",

    description:
      "How to permanently delete your Basse account and associated personal data.",
  };


type AccountDeletionPageProps = {
  searchParams:
    Promise<{
      deleted?:
        | string
        | string[];
    }>;
};


export default async function AccountDeletionPage({
  searchParams,
}: AccountDeletionPageProps) {

  const parameters =
    await searchParams;

  const deletionCompleted =
    parameters.deleted === "1";


  return (
    <main className="accountDeletionPage">

      <article className="accountDeletionCard">

        <Link
          href="/"
          className="accountDeletionBack"
        >
          ← Basse
        </Link>


        {deletionCompleted && (
          <div
            className="accountDeletionSuccess"
            role="status"
          >
            Your Basse account and associated data were deleted.
          </div>
        )}


        <span className="accountDeletionEyebrow">
          ACCOUNT & DATA
        </span>

        <h1>
          Delete your
          <br />
          Basse account.
        </h1>

        <p className="accountDeletionLead">
          You can permanently delete your account directly
          from Basse on the web or in the app.
        </p>


        <ol className="accountDeletionSteps">
          <li>
            <strong>
              Sign in to Basse.
            </strong>

            <span>
              Use the account you want to delete.
            </span>
          </li>

          <li>
            <strong>
              Open Settings.
            </strong>

            <span>
              Choose Delete account in the Account section.
            </span>
          </li>

          <li>
            <strong>
              Confirm deletion.
            </strong>

            <span>
              Type DELETE and confirm the permanent action.
            </span>
          </li>
        </ol>


        {!deletionCompleted && (
          <Link
            href="/login"
            className="accountDeletionPrimary"
          >
            Sign in to delete account →
          </Link>
        )}


        <section className="accountDeletionData">

          <h2>
            What is deleted
          </h2>

          <p>
            Your login, athlete profile, race goal,
            preferences, training plans, workout and
            readiness history, coaching history, feedback
            and account-linked request records are deleted.
          </p>

          <p>
            Deletion is immediate after confirmation and
            cannot be reversed. Public race-catalog data is
            not tied to your account and is not affected.
          </p>

        </section>

      </article>

    </main>
  );
}
