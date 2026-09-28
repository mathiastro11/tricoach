import {
  NextResponse,
} from "next/server";

import {
  requireApiUser,
} from "@/lib/api-auth";

import {
  readApiJsonBody,
} from "@/lib/api-json";

import {
  isAccountDeletionConfirmed,
} from "@/lib/account-deletion";

import {
  createAdminClient,
} from "@/lib/supabase-admin";


export const dynamic =
  "force-dynamic";


function noStoreHeaders() {

  return {
    "Cache-Control":
      "no-store, max-age=0",
  };
}


export async function DELETE(
  request: Request
) {

  /*
    The authenticated Supabase identity is the only
    accepted deletion target.

    A client-supplied email or user id must never be
    allowed to choose which account is deleted.
  */
  const authentication =
    await requireApiUser(
      request
    );


  if (
    !authentication.ok
  ) {
    return authentication.response;
  }


  const bodyResult =
    await readApiJsonBody(
      request
    );


  if (
    !bodyResult.ok
  ) {
    return bodyResult.response;
  }


  if (
    !isAccountDeletionConfirmed(
      bodyResult.value.confirmation
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Type DELETE to confirm permanent account deletion.",
      },
      {
        status: 400,
        headers:
          noStoreHeaders(),
      }
    );
  }


  try {

    const admin =
      createAdminClient();


    const {
      error,
    } =
      await admin.auth.admin
        .deleteUser(
          authentication.user.id
        );


    if (error) {
      throw error;
    }


    /*
      profiles, training_state, app_feedback and
      ai_rate_limit_buckets are owned through
      ON DELETE CASCADE foreign keys.
    */
    return NextResponse.json(
      {
        deleted: true,
      },
      {
        status: 200,
        headers:
          noStoreHeaders(),
      }
    );

  } catch {

    /*
      Never expose provider details, identifiers or
      administrative errors to the client.
    */
    console.error(
      "Basse account deletion failed."
    );


    return NextResponse.json(
      {
        error:
          "Basse could not delete your account. Please try again.",
      },
      {
        status: 500,
        headers:
          noStoreHeaders(),
      }
    );
  }
}
