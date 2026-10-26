import { PrismaClient, ReadinessStatus, TriggerType, DealRoomStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Seeding Next-Gen Features (F1-F5) demo data...');

  const priya = await prisma.user.findFirst({ where: { email: 'user@projectsetu.com' }, include: { profile: true } });
  const david = await prisma.user.findFirst({ where: { email: 'david.tan@sgdistrib.com' }, include: { profile: true } });
  const marcus = await prisma.user.findFirst({ where: { email: 'companyadmin@projectsetu.com' }, include: { profile: true } });
  const elena = await prisma.user.findFirst({ where: { email: 'colleague@apexpacific.com' }, include: { profile: true } });

  const apex = await prisma.company.findFirst({ where: { domain: 'apexpacific.com' } });
  const borneo = await prisma.company.findFirst({ where: { domain: 'borneoagro.my' } });

  if (!priya?.profile || !david?.profile) {
    console.error('Core users not found. Run base seed first.');
    return;
  }

  // 1. F1: Partnership Readiness Signals
  console.log('📡 Seeding Partnership Readiness signals...');
  await prisma.partnershipReadiness.upsert({
    where: { profileId: priya.profile.id },
    update: {
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['FMCG & Food Beverages', 'Organic Agriculture', 'Airport Retail']),
      activeGeographies: JSON.stringify(['MY', 'SG', 'IN', 'ASEAN']),
      partnershipTypes: JSON.stringify(['Distribution Partnerships', 'Retail Placement', 'Supplier Onboarding']),
      notLookingFor: JSON.stringify(['Cold SaaS sales', 'Unsolicited recruitment agencies', 'Non-certified food producers']),
      openMessage: 'Actively expanding retail distribution corridors across Southeast Asia. Seeking tier-1 FMCG distributors with temperature-controlled logistics.',
      refreshedAt: new Date(),
    },
    create: {
      profileId: priya.profile.id,
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['FMCG & Food Beverages', 'Organic Agriculture', 'Airport Retail']),
      activeGeographies: JSON.stringify(['MY', 'SG', 'IN', 'ASEAN']),
      partnershipTypes: JSON.stringify(['Distribution Partnerships', 'Retail Placement', 'Supplier Onboarding']),
      notLookingFor: JSON.stringify(['Cold SaaS sales', 'Unsolicited recruitment agencies', 'Non-certified food producers']),
      openMessage: 'Actively expanding retail distribution corridors across Southeast Asia. Seeking tier-1 FMCG distributors with temperature-controlled logistics.',
      refreshedAt: new Date(),
    },
  });

  await prisma.partnershipReadiness.upsert({
    where: { profileId: david.profile.id },
    update: {
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['Cold-Chain Logistics', 'Cross-Border Freight', 'Port Warehousing']),
      activeGeographies: JSON.stringify(['SG', 'MY', 'ID']),
      partnershipTypes: JSON.stringify(['Cross-border Distribution', 'Fleet Syndication', 'Warehouse Joint Venture']),
      notLookingFor: JSON.stringify(['Dry goods only', 'Non-temperature controlled transport']),
      openMessage: 'Open for APAC cold-chain fleet syndication, customs port-clearance, and certified chilled warehousing.',
      refreshedAt: new Date(),
    },
    create: {
      profileId: david.profile.id,
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['Cold-Chain Logistics', 'Cross-Border Freight', 'Port Warehousing']),
      activeGeographies: JSON.stringify(['SG', 'MY', 'ID']),
      partnershipTypes: JSON.stringify(['Cross-border Distribution', 'Fleet Syndication', 'Warehouse Joint Venture']),
      notLookingFor: JSON.stringify(['Dry goods only', 'Non-temperature controlled transport']),
      openMessage: 'Open for APAC cold-chain fleet syndication, customs port-clearance, and certified chilled warehousing.',
      refreshedAt: new Date(),
    },
  });

  if (apex) {
    await prisma.partnershipReadiness.upsert({
      where: { companyId: apex.id },
      update: {
        status: ReadinessStatus.OPEN,
        activeSectors: JSON.stringify(['Wholesale Distribution', 'FMCG Retail Chains', 'Airport Concessions']),
        activeGeographies: JSON.stringify(['SG', 'MY', 'ASEAN']),
        partnershipTypes: JSON.stringify(['Master Distributorship', 'Supermarket Placement', 'Cold-Chain Joint Venture']),
        notLookingFor: JSON.stringify(['Sub-scale pilots under $50k']),
        openMessage: 'Authorized tier-1 master distributor partnering with international FMCG brands entering Singapore & Malaysian markets.',
        refreshedAt: new Date(),
      },
      create: {
        companyId: apex.id,
        status: ReadinessStatus.OPEN,
        activeSectors: JSON.stringify(['Wholesale Distribution', 'FMCG Retail Chains', 'Airport Concessions']),
        activeGeographies: JSON.stringify(['SG', 'MY', 'ASEAN']),
        partnershipTypes: JSON.stringify(['Master Distributorship', 'Supermarket Placement', 'Cold-Chain Joint Venture']),
        notLookingFor: JSON.stringify(['Sub-scale pilots under $50k']),
        openMessage: 'Authorized tier-1 master distributor partnering with international FMCG brands entering Singapore & Malaysian markets.',
        refreshedAt: new Date(),
      },
    });
  }

  // 2. F3: Why Now Trigger Signals
  console.log('⚡ Seeding Why Now trigger signals...');
  if (apex) {
    await prisma.triggerSignal.deleteMany({ where: { companyId: apex.id } });
    await prisma.triggerSignal.createMany({
      data: [
        {
          companyId: apex.id,
          triggerType: TriggerType.FUNDING_EVENT,
          headline: 'Apex Pacific closes $14M Series B round to expand ASEAN cold-chain network',
          body: 'Capital earmarked for rapid fleet expansion and multi-temperature warehouse infrastructure across Malaysia and Singapore.',
          sourceUrl: 'https://news.bloomberg.com/apex-series-b',
          relevanceScore: 0.95,
          isVerified: true,
        },
        {
          companyId: apex.id,
          triggerType: TriggerType.HIRING_SIGNAL,
          headline: 'Apex Pacific expands regional procurement team: hiring 6 Senior Sourcing Leads in KL & Singapore',
          body: 'High-intent signal indicating active vendor onboarding across fresh produce, dairy, and beverage categories.',
          sourceUrl: 'https://linkedin.com/jobs/apex-pacific',
          relevanceScore: 0.88,
          isVerified: true,
        },
        {
          companyId: apex.id,
          triggerType: TriggerType.EXPANSION_SIGNAL,
          headline: 'Apex Pacific commissions new 80,000 sq ft bonded cold-storage terminal at Port Klang',
          body: 'Direct customs-bonded facility slashing import clearance times for ASEAN cross-border food shipments.',
          relevanceScore: 0.9,
          isVerified: true,
        },
      ],
    });
  }

  if (borneo) {
    await prisma.triggerSignal.deleteMany({ where: { companyId: borneo.id } });
    await prisma.triggerSignal.createMany({
      data: [
        {
          companyId: borneo.id,
          triggerType: TriggerType.PRODUCT_LAUNCH,
          headline: 'Borneo Agro unveils certified Organic Cold-Brew Tea portfolio for retail export',
          body: '100% Halal certified by JAKIM Malaysia with 12-month ambient shelf life formulated for modern hypermarkets.',
          relevanceScore: 0.92,
          isVerified: true,
        },
        {
          companyId: borneo.id,
          triggerType: TriggerType.USER_DECLARED,
          headline: 'Seeking tier-1 airport duty-free and airline catering beverage distributors',
          body: 'Direct executive mandate: ready for immediate supplier onboarding and commercial trial consignments.',
          relevanceScore: 0.98,
          isVerified: true,
        },
      ],
    });
  }

  // 3. F5: Outcome Reputation Engine
  console.log('🏆 Seeding Reputation Scores...');
  await prisma.reputationScore.upsert({
    where: { profileId: priya.profile.id },
    update: {
      totalDeals: 5,
      closedWonCount: 4,
      averageRatingReceived: 4.8,
      responsivenessScore: 94,
      topCategories: JSON.stringify(['FMCG', 'Beverage Distribution', 'Retail Concessions']),
      topGeographies: JSON.stringify(['MY', 'SG', 'IN']),
      lastComputedAt: new Date(),
    },
    create: {
      profileId: priya.profile.id,
      totalDeals: 5,
      closedWonCount: 4,
      averageRatingReceived: 4.8,
      responsivenessScore: 94,
      topCategories: JSON.stringify(['FMCG', 'Beverage Distribution', 'Retail Concessions']),
      topGeographies: JSON.stringify(['MY', 'SG', 'IN']),
      lastComputedAt: new Date(),
    },
  });

  await prisma.reputationScore.upsert({
    where: { profileId: david.profile.id },
    update: {
      totalDeals: 7,
      closedWonCount: 6,
      averageRatingReceived: 4.9,
      responsivenessScore: 98,
      topCategories: JSON.stringify(['Cold-Chain', 'Fleet Logistics', 'Customs Clearance']),
      topGeographies: JSON.stringify(['SG', 'MY', 'ID']),
      lastComputedAt: new Date(),
    },
    create: {
      profileId: david.profile.id,
      totalDeals: 7,
      closedWonCount: 6,
      averageRatingReceived: 4.9,
      responsivenessScore: 98,
      topCategories: JSON.stringify(['Cold-Chain', 'Fleet Logistics', 'Customs Clearance']),
      topGeographies: JSON.stringify(['SG', 'MY', 'ID']),
      lastComputedAt: new Date(),
    },
  });

  // 4. F4: Setu Deal Room
  console.log('🤝 Seeding Setu Deal Room...');
  // Find connection between Priya and David or create one
  let connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterUserId: priya.id, recipientProfileId: david.profile.id },
        { requesterUserId: david.id, recipientProfileId: priya.profile.id },
      ],
    },
  });

  if (!connection) {
    connection = await prisma.connection.create({
      data: {
        requesterUserId: priya.id,
        recipientProfileId: david.profile.id,
        businessReason: 'Explore regional cold-chain distribution partnership for organic beverage retail placement.',
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });
  }

  // Seed Deal Room
  const dealRoom = await prisma.dealRoom.upsert({
    where: { connectionId: connection.id },
    update: {
      title: 'Southeast Asia Cold-Chain Distribution Corridor Agreement',
      status: DealRoomStatus.ACTIVE,
      initiatorGoal: 'Secure certified cold-chain warehousing and distribution partner covering 40 modern trade stores across Singapore & Malaysia.',
      partnerGoal: 'Provide dedicated multi-temperature freight capacity and guaranteed 48-hour customs clearance at Port Klang.',
      ndaRequired: true,
    },
    create: {
      connectionId: connection.id,
      initiatorUserId: priya.id,
      partnerUserId: david.id,
      title: 'Southeast Asia Cold-Chain Distribution Corridor Agreement',
      status: DealRoomStatus.ACTIVE,
      initiatorGoal: 'Secure certified cold-chain warehousing and distribution partner covering 40 modern trade stores across Singapore & Malaysia.',
      partnerGoal: 'Provide dedicated multi-temperature freight capacity and guaranteed 48-hour customs clearance at Port Klang.',
      ndaRequired: true,
    },
  });

  // Seed Deal Room Milestones
  await prisma.dealRoomMilestone.deleteMany({ where: { dealRoomId: dealRoom.id } });
  await prisma.dealRoomMilestone.createMany({
    data: [
      {
        dealRoomId: dealRoom.id,
        title: 'Bilateral Mutual Non-Disclosure Agreement (NDA) executed',
        description: 'Standard Project Setu verified commercial secrecy agreement signed by both legal teams.',
        isCompleted: true,
        completedAt: new Date(Date.now() - 5 * 86310000),
      },
      {
        dealRoomId: dealRoom.id,
        title: 'Halal JAKIM & Cold-Chain HACCP Compliance Review',
        description: 'Audit verified storage temperature thresholds (+2°C to +4°C) across transfer fleet.',
        isCompleted: true,
        completedAt: new Date(Date.now() - 2 * 86310000),
      },
      {
        dealRoomId: dealRoom.id,
        title: 'Pilot Consignment Run: 500 cases from Port Klang to Kuala Lumpur DC',
        description: 'Test shipping run monitoring real-time telemetry, temperature logs, and delivery punctuality.',
        dueDate: new Date(Date.now() + 5 * 86310000),
        isCompleted: false,
      },
      {
        dealRoomId: dealRoom.id,
        title: 'Execute Annual Master Distributorship SLA & Pricing Schedule',
        description: 'Finalize volume rebate tier, exclusive territory rights, and payment terms.',
        dueDate: new Date(Date.now() + 14 * 86310000),
        isCompleted: false,
      },
    ],
  });

  console.log('✅ Next-Gen Features Seed Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
