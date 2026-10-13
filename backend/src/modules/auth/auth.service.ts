import bcrypt from 'bcryptjs';
import { AppError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-code';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../config/jwt.config';
import { createUser, findByEmail } from './auth.repository';
import { LoginDto, RegisterDto } from './auth.dto';

const publicUser = (user: { id: string; email: string; fullName: string; role: string }) => ({
  id: user.id, email: user.email, fullName: user.fullName, role: user.role,
});

const tokensFor = (user: { id: string; email: string; role: 'STUDENT' | 'LECTURER' | 'LIBRARIAN' | 'MANAGER' }) => ({
  accessToken: signAccessToken({ id: user.id, email: user.email, role: user.role }),
  refreshToken: signRefreshToken({ id: user.id, email: user.email, role: user.role }),
});

export async function register(dto: RegisterDto) {
  if (await findByEmail(dto.email)) throw new AppError(409, ErrorCode.CONFLICT, 'Email is already registered');
  const user = await createUser({
    email: dto.email,
    password: await bcrypt.hash(dto.password, 12),
    fullName: dto.fullName,
    phone: dto.phone,
    role: dto.role ?? 'STUDENT',
  });
  return { user: publicUser(user), ...tokensFor(user) };
}

export async function login(dto: LoginDto) {
  const user = await findByEmail(dto.email);
  if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.password))) {
    throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Invalid email or password');
  }
  return { user: publicUser(user), ...tokensFor(user) };
}

export async function refreshToken(token: string) {
  try {
    const payload = verifyRefreshToken(token);
    const user = await findByEmail(payload.email);
    if (!user || !user.isActive) throw new Error('User unavailable');
    return tokensFor(user);
  } catch {
    throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Invalid or expired refresh token');
  }
}

