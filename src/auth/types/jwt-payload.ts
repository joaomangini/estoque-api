import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // id do usuário
  email: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthUserWithRefresh extends AuthUser {
  refreshToken: string;
}
