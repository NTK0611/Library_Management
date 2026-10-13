export type User = { id: string; email: string; fullName: string; role: string };
export type AuthResponse = { user: User; accessToken: string; refreshToken: string };

