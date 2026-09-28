export const ACCOUNT_DELETION_CONFIRMATION =
  "DELETE";


export function isAccountDeletionConfirmed(
  value: unknown
) {

  return (
    value ===
    ACCOUNT_DELETION_CONFIRMATION
  );
}
