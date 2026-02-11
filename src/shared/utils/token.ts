import JwtService from "./jwt";
import { env } from "../../config/env";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import type { Response } from "express";

class TokenService {
  static generateAccessToken(payload: JwtPayload): string {
    return JwtService.createToken(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: env.ACCESS_TOKEN_EXPIRATION,
    } as SignOptions);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return JwtService.createToken(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRATION,
    } as SignOptions);
  }

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
    res.cookie("better-auth.session_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 1000, // 1 day
    });
  }
}

export default TokenService;
