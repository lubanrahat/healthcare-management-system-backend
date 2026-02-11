import type { CookieOptions, Request, Response } from "express";

export type CookieKey =
  | "accessToken"
  | "refreshToken"
  | "sessionId"
  | "better-auth.session_token";

export class CookieService {
  private static defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  };

  static set(
    res: Response,
    key: CookieKey,
    value: string,
    options?: CookieOptions,
  ): void {
    res.cookie(key, value, {
      ...this.defaultOptions,
      ...options,
    });
  }

  static get(req: Request, key: CookieKey): string | undefined {
    return req.cookies?.[key];
  }

  static clear(res: Response, key: CookieKey, options?: CookieOptions): void {
    res.clearCookie(key, {
      ...this.defaultOptions,
      ...options,
    });
  }
}
