import { PrismaClient } from '@prisma/client';
import { seed500DiverseMembers } from '../src/database/diverse-seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running Standalone 500 Diverse Member Seeder...');
  await seed500DiverseMembers(prisma);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error seeding 500 members:', e);
  process.exit(1);
});
