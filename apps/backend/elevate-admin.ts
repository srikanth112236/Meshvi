import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@vedasynk.local';
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const existing = await prisma.userRole.findFirst({
      where: { userId: user.id, role: RoleType.SUPER_ADMIN },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: RoleType.SUPER_ADMIN,
        },
      });
    }
    console.log('SUCCESS: SUPER_ADMIN role assigned to', user.email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
