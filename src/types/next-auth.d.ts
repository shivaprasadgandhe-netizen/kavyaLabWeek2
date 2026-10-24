import { DefaultSession } from "next-auth";
import { Role, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: Role | string;
      status?: UserStatus | string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role | string;
    status?: UserStatus | string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role | string;
    status?: UserStatus | string;
  }
}
