const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { name: { contains: 'vedasynk', mode: 'insensitive' } },
        { name: { contains: 'vedasybk', mode: 'insensitive' } },
        { domain: { contains: 'vedasynk', mode: 'insensitive' } }
      ]
    },
    include: {
      memberships: { include: { user: true } },
      profiles: { include: { user: true } }
    }
  });

  console.log('COMPANIES:', JSON.stringify(companies.map(c => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
    members: c.memberships.map(m => ({ email: m.user?.email, role: m.role })),
    profiles: c.profiles.map(p => ({ profileId: p.id, displayName: p.displayName, userEmail: p.user?.email }))
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
