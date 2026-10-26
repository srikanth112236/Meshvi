const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SYNCING REAL-TIME DATA BETWEEN VEDASYNK AND SRIKANTH ---');

  // 1. Find user vedasynk@gmail.com and srikanth112236@gmail.com
  const vedasynkUser = await prisma.user.findUnique({
    where: { email: 'vedasynk@gmail.com' },
    include: { profile: true }
  });
  const srikanthUser = await prisma.user.findUnique({
    where: { email: 'srikanth112236@gmail.com' },
    include: { profile: true }
  });

  if (!vedasynkUser || !srikanthUser) {
    console.error('Missing user(s)!');
    return;
  }

  // 2. Target Company: Vedasynk Technologies (6b9068bd-6d63-43ed-94f0-84b9b1fb9060)
  const targetCompany = await prisma.company.upsert({
    where: { id: '6b9068bd-6d63-43ed-94f0-84b9b1fb9060' },
    update: {
      name: 'Vedasynk Technologies',
      normalizedName: 'vedasynk technologies',
      domain: 'vedasynk.com',
      websiteUrl: 'https://vedasynk.com',
      industry: 'Enterprise Software & AI'
    },
    create: {
      id: '6b9068bd-6d63-43ed-94f0-84b9b1fb9060',
      name: 'Vedasynk Technologies',
      normalizedName: 'vedasynk technologies',
      domain: 'vedasynk.com',
      websiteUrl: 'https://vedasynk.com',
      industry: 'Enterprise Software & AI'
    }
  });

  // 3. Ensure vedasynk@gmail.com is Owner of Vedasynk Technologies
  await prisma.companyMembership.upsert({
    where: {
      companyId_userId: {
        companyId: targetCompany.id,
        userId: vedasynkUser.id
      }
    },
    update: {
      companyRole: 'OWNER',
      membershipStatus: 'ACTIVE'
    },
    create: {
      companyId: targetCompany.id,
      userId: vedasynkUser.id,
      companyRole: 'OWNER',
      membershipStatus: 'ACTIVE'
    }
  });

  // 4. Update vedasynk@gmail.com profile to point to Vedasynk Technologies
  if (vedasynkUser.profile) {
    await prisma.professionalProfile.update({
      where: { id: vedasynkUser.profile.id },
      data: {
        currentCompanyId: targetCompany.id,
        verificationStatus: 'VERIFIED'
      }
    });
  }

  // 5. Update both connections to ACCEPTED with respondedAt = now
  const updated1 = await prisma.connection.updateMany({
    where: {
      id: '690d2a68-e4b3-4317-a67b-3f5655c7af5a'
    },
    data: {
      status: 'ACCEPTED',
      respondedAt: new Date()
    }
  });
  console.log('Updated connection 690d2a68:', updated1.count);

  const updated2 = await prisma.connection.updateMany({
    where: {
      id: '6700e9c8-4c54-425a-8776-31ce5ce297a5'
    },
    data: {
      status: 'ACCEPTED',
      respondedAt: new Date()
    }
  });
  console.log('Updated connection 6700e9c8:', updated2.count);

  // 6. Ensure Deal Room exists between Srikanth and Vedasynk
  const existingRoom = await prisma.dealRoom.findFirst({
    where: {
      OR: [
        { initiatorUserId: srikanthUser.id, partnerUserId: vedasynkUser.id },
        { initiatorUserId: vedasynkUser.id, partnerUserId: srikanthUser.id }
      ]
    }
  });

  if (!existingRoom) {
    const room = await prisma.dealRoom.create({
      data: {
        connectionId: '690d2a68-e4b3-4317-a67b-3f5655c7af5a',
        initiatorUserId: srikanthUser.id,
        partnerUserId: vedasynkUser.id,
        title: 'Strategic Partnership: Vedasynk Technologies & Srikanth',
        status: 'ACTIVE'
      }
    });
    console.log('Created Deal Room:', room.id);
  } else {
    console.log('Deal Room already active:', existingRoom.id);
  }

  console.log('--- SYNC COMPLETE! ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
