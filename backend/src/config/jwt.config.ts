import jwt from 'jsonwebtoken';
import { env } from './env.config';
import { Role } from '../common/constants/role.constant';

export type TokenPayload = { id: string; email: string; role: Role };

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.jwtAccessSecret) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;

