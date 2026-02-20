import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";

function sign(value: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(value);
  return hmac.digest("hex");
}

/**
 * Verify the signed admin_session cookie and return admin id/email or null.
 */
export function verifySignedCookie(
  cookieValue: string
): { id: string; email: string } | null {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (sign(encoded, secret) !== sig) return null;
  try {
    const data = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8")
    );
    if (data.exp && Date.now() > data.exp) return null;
    if (typeof data.id === "string" && typeof data.email === "string") {
      return { id: data.id, email: data.email };
    }
    return null;
  } catch {
    return null;
  }
}
