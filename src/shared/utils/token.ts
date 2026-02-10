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
}

export default TokenService;
