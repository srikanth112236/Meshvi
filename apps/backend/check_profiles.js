const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.professionalProfile.findUnique({
    where: { id: 'c70e6daf-8508-453f-810d-6b03fc468e73' },
    include: { company: true, user: true }
  });
  console.log('c70e6daf (vedasynk@gmail.com profile):', {
    id: p1?.id,
    displayName: p1?.displayName,
    userId: p1?.userId,
    userEmail: p1?.user?.email,
    currentCompanyId: p1?.currentCompanyId,
    companyName: p1?.company?.name
  });

  const p2 = await prisma.professionalProfile.findUnique({
    where: { id: 'bc85fa45-38d4-4c8a-9b75-b128d797c6a7' },
    include: { company: true, user: true }
  });
  console.log('bc85fa45 (Vedasynk TEchnologies profile in search):', {
    id: p2?.id,
    displayName: p2?.displayName,
    userId: p2?.userId,
    userEmail: p2?.user?.email,
    currentCompanyId: p2?.currentCompanyId,
    companyName: p2?.company?.name
  });

  const conn1 = await prisma.connection.findFirst({
    where: {
      requesterUserId: 'bd8b6df0-551c-4a89-84a5-ad756a54f6b1', // srikanth112236@gmail.com
      recipientProfileId: 'c70e6daf-8508-453f-810d-6b03fc468e73'
    }
  });
  console.log('Conn to c70e6daf:', conn1?.status);

  const conn2 = await prisma.connection.findFirst({
    where: {
      requesterUserId: 'bd8b6df0-551c-4a89-84a5-ad756a54f6b1',
      recipientProfileId: 'bc85fa45-38d4-4c8a-9b75-b128d797c6a7'
    }
  });
  console.log('Conn to bc85fa45:', conn2?.status);
}

main().catch(console.error).finally(() => prisma.$disconnect());
