import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "../generated/prisma/client/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import {
  forgotPasswordOtpMailgenContent,
  otpVerificationMailgenContent,
  sendEmail,
} from "../shared/utils/mail";
import { env } from "../config/env";
import path from "node:path";
import { en } from "zod/locales";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.FRONTEND_URL,env.BETTER_AUTH_URL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      mapProfileToUser: (profile) => ({
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
        needPasswordChange: false,
        emailVerified: true,
        isDeleted: false,
        deletedAt: null,
      }),
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.PATIENT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (user && !user.emailVerified) {
            await sendEmail({
              email: user.email,
              subject: "Verify your email address",
              mailgenContent: otpVerificationMailgenContent(user.name, otp),
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (user) {
            await sendEmail({
              email: user.email,
              subject: "Reset your password",
              mailgenContent: forgotPasswordOtpMailgenContent(user.name, otp),
            });
          }
        }
      },
      expiresIn: 5 * 60, // 5 minutes in seconds
      otpLength: 6,
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
    },
  },

  redirectURIs: {
    google: {
      signIn: `${env.FRONTEND_URL}/login`,
      signUp: `${env.FRONTEND_URL}/register`,
      signOut: `${env.FRONTEND_URL}/login`,
      error: `${env.FRONTEND_URL}/login?error=oauth_failed`,

    },
  },

  advanced: {
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
    },
    sessionToken: {
      attributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        path: "/",
      },
    },
  },
});
