import bcrypt from 'bcryptjs';
import { prisma } from '../src/database/prisma.client';

async function main(): Promise<void> {
  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: {
      email: 'librarian@example.com',
      password: await bcrypt.hash('password123', 12),
      fullName: 'Library Administrator',
      role: 'LIBRARIAN',
    },
  });
}

main().finally(() => prisma.$disconnect());

