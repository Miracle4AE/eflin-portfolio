export const ADMIN_COOKIE_NAME = "eflin_admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminUsername(): string | undefined {
  return process.env.ADMIN_USERNAME?.trim() || undefined;
}

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD?.trim() || undefined;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getAdminUsername() && getAdminPassword());
}

/** Admin is unavailable when credentials are not set (dev and production behave the same). */
export function isAdminDisabled(): boolean {
  return !isAdminAuthConfigured();
}

/** @deprecated Use isAdminDisabled */
export function isAdminBlockedInProduction(): boolean {
  return isAdminDisabled();
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);

  if (bufA.length !== bufB.length) {
    let dummy = bufA.length ^ bufB.length;
    for (let i = 0; i < bufA.length; i++) {
      dummy |= bufA[i] ^ (bufB[i % bufB.length] ?? 0);
    }
    void dummy;
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < bufA.length; i++) {
    mismatch |= bufA[i] ^ bufB[i];
  }
  return mismatch === 0;
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSessionToken(): Promise<string | null> {
  const username = getAdminUsername();
  const password = getAdminPassword();
  if (!username || !password) return null;
  return sha256(`eflin-admin:${username}:${password}`);
}

export async function verifyAdminSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token || !isAdminAuthConfigured()) return false;
  const expected = await createAdminSessionToken();
  if (!expected) return false;
  return timingSafeEqualStrings(token, expected);
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  if (!isAdminAuthConfigured()) return false;

  const expectedUsername = getAdminUsername()!;
  const expectedPassword = getAdminPassword()!;

  const usernameOk = timingSafeEqualStrings(username.trim(), expectedUsername);
  const passwordOk = timingSafeEqualStrings(password, expectedPassword);

  return usernameOk && passwordOk;
}
