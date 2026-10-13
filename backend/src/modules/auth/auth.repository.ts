import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.client';

export const findByEmail = (email: string) => prisma.user.findUnique({ where: { email } });
export const createUser = (data: Prisma.UserCreateInput) => prisma.user.create({ data });

