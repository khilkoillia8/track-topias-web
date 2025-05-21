export interface UserCredentials  {
  token: string;
  type: string;
  algorithm: string;
  expiresAt: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  photoUrl?: string;
}