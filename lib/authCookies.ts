const WEEK = 60 * 60 * 24 * 7;

export const CLIENT_SESSION_COOKIE = "clientId";
export const ADMIN_SESSION_COOKIE = "adminId";

type CookieOpts = {
  httpOnly: boolean;
  secure: boolean;
  path: string;
  maxAge: number;
  sameSite: "lax";
  domain?: string;
};

export function sessionCookieOptions(): CookieOpts {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.FORCE_SECURE_COOKIES === "1";
  const base: CookieOpts = {
    httpOnly: true,
    secure,
    path: "/",
    maxAge: WEEK,
    sameSite: "lax",
  };
  if (domain) base.domain = domain;
  return base;
}

export function clearSessionCookieOptions(): Pick<CookieOpts, "httpOnly" | "secure" | "path" | "maxAge" | "sameSite" | "domain"> {
  const { domain, ...rest } = sessionCookieOptions();
  return { ...rest, maxAge: 0, ...(domain ? { domain } : {}) };
}

type WritableCookieStore = {
  set: (name: string, value: string, options: CookieOpts | ReturnType<typeof clearSessionCookieOptions>) => void;
};

/** Clear both portal cookies (Next.js `cookies()` from a Route Handler or Server Action). */
export function clearAuthSessionCookies(store: WritableCookieStore) {
  const o = clearSessionCookieOptions();
  store.set(CLIENT_SESSION_COOKIE, "", o);
  store.set(ADMIN_SESSION_COOKIE, "", o);
}
