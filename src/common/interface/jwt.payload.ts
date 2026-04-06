export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}
