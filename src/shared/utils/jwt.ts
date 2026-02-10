import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import AppError from "../errors/app-error";
import HttpStatus from "../constants/http-status";

class JwtService {
  static createToken(
    payload: JwtPayload,
    secret: string,
    options: SignOptions,
  ): string {
    try {
      return jwt.sign(payload, secret, {
        expiresIn: options.expiresIn,
      });
    } catch (error) {
      throw new AppError(
        "Failed to create token",
        HttpStatus.INTERNAL_SERVER_ERROR,
        "TOKEN_CREATION_FAILED",
        error,
      );
    }
  }
  static verifyToken(token: string, secret: string): JwtPayload {
    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new AppError(
        "Invalid or expired token",
        HttpStatus.UNAUTHORIZED,
        "INVALID_TOKEN",
        error,
      );
    }
  }
  static decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}

export default JwtService;
