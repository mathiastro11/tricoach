export function formatDuration(
  minutes:
    | number
    | string
    | null
    | undefined
) {
  const value =
    typeof minutes === "string"
      ? Number(minutes)
      : minutes;

  if (
    value == null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  const rounded =
    Math.max(
      0,
      Math.round(value)
    );

  if (rounded < 60) {
    return `${rounded} min`;
  }

  const hours =
    Math.floor(
      rounded / 60
    );

  const remainingMinutes =
    rounded % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}
