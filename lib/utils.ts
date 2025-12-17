export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a number in 'k' form with up to 3 decimal places
 * @param num - The number to format
 * @returns Formatted string (e.g., 1000 → "1k", 1150 → "1.15k", 1567 → "1.567k")
 */
export function formatNumberInK(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  const inK = num / 1000;

  // Round to 3 decimal places
  const rounded = Math.round(inK * 1000) / 1000;

  // Convert to string and remove trailing zeros
  let formatted = rounded.toFixed(3);

  // Remove trailing zeros after decimal point
  formatted = formatted.replace(/\.?0+$/, "");

  return `${formatted}k`;
}
