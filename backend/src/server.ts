import { app } from './app';
import { prisma } from './database/prisma.client';
import { env } from './config/env.config';

async function start(): Promise<void> {
  await prisma.$connect();
  app.listen(env.port, () => console.log(`API listening on port ${env.port}`));
}

start().catch(async (error) => {
  console.error('Unable to start server', error);
  await prisma.$disconnect();
  process.exit(1);
});

