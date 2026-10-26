const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['vedasynk@gmail.com', 'srikanth112236@gmail.com'] } },
    include: { profile: { include: { company: true } }, memberships: { include: { company: true } } }
  });
  console.log('USERS:', JSON.stringify(users.map(u => ({
    id: u.id,
    email: u.email,
    profileId: u.profile?.id,
    displayName: u.profile?.displayName,
    company: u.profile?.company?.name,
    memberships: u.memberships.map(m => ({ companyId: m.companyId, companyName: m.company?.name, role: m.role }))
  })), null, 2));

  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { requester: { email: { in: ['vedasynk@gmail.com', 'srikanth112236@gmail.com'] } } },
        { recipientProfile: { user: { email: { in: ['vedasynk@gmail.com', 'srikanth112236@gmail.com'] } } } },
        { recipientProfile: { displayName: { contains: 'srikanth', mode: 'insensitive' } } }
      ]
    },
    include: {
      requester: { select: { email: true, id: true } },
      recipientProfile: { select: { id: true, displayName: true, userId: true, user: { select: { email: true } } } }
    }
  });
  console.log('CONNECTIONS:', JSON.stringify(connections, null, 2));

  const allSrikanth = await prisma.professionalProfile.findMany({
    where: { displayName: { contains: 'srikanth', mode: 'insensitive' } },
    include: { user: true, company: true }
  });
  console.log('ALL SRIKANTH PROFILES:', JSON.stringify(allSrikanth.map(p => ({
    id: p.id,
    displayName: p.displayName,
    userId: p.userId,
    userEmail: p.user?.email,
    companyName: p.company?.name
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
