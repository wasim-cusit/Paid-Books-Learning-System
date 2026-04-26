import type { RoleName } from "@prisma/client";

export type AuthUser = {
  userId: string;
  role: RoleName;
  email: string;
};
