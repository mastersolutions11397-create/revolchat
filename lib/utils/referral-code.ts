/**
 * Generate a username-based referral code
 * Format: USERNAME-RANDOM (e.g., AFFAN-7X9K2)
 */
export function generateReferralCode(username: string): string {
  // Clean username: remove special chars, uppercase, limit length
  const cleanUsername = username
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 10);

  // Generate random alphanumeric suffix (6 chars)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${cleanUsername}-${suffix}`;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  // Format: USERNAME-XXXXXX (alphanumeric, dash, alphanumeric)
  const pattern = /^[A-Z0-9]{1,10}-[A-Z0-9]{6}$/;
  return pattern.test(code.toUpperCase());
}

/**
 * Extract username from referral code
 */
export function extractUsernameFromCode(code: string): string | null {
  if (!isValidReferralCode(code)) {
    return null;
  }
  const parts = code.split("-");
  return parts[0] || null;
}

