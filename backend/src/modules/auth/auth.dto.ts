import { Role } from '../../common/constants/role.constant';

export type LoginDto = { email: string; password: string };
export type RegisterDto = { email: string; password: string; fullName: string; phone?: string; role?: Role };

