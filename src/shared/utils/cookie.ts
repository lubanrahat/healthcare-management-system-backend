import type { CookieOptions, Request, Response } from "express";

class CookieService {
  static setAccessToken(res: Response, token: string): void {
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 1000, // 1 day
    });
  }

  static setRefreshToken(res: Response, token: string): void {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 1000 * 7, // 7 day
    });
  }

  static setBetterAuthSessionCookie(res: Response, token: string): void {
    res.cookie("betterAuthSession", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 1000, // 1 day
    });
  }

  static clear(res: Response, key: string, options: CookieOptions): void {
    res.clearCookie(key, options);
  }
}

export default CookieService;
