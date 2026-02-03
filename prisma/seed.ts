import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_USER = {
  email: 'demo@example.com',
  name: 'Demo User',
  password: 'password123',
};

async function main() {
  const passwordHash = await bcrypt.hash(SEED_USER.password, 10);

  await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {},
    create: {
      name: SEED_USER.name,
      email: SEED_USER.email,
      passwordHash,
    },
  });

  console.log('Seed completed: demo user created/updated.');
  console.log(`  Email: ${SEED_USER.email}`);
  console.log(`  Password: ${SEED_USER.password}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
