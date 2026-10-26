import {
  PrismaClient,
  RoleType,
  AccountStatus,
  VerificationStatus,
  ReadinessStatus,
  TriggerType,
  DealRoomStatus,
  DealOutcomeType,
  CompanyRole,
  MembershipStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding full next-generation features for priya.sharma@fmcgpartners.asia ...');

  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const email = 'priya.sharma@fmcgpartners.asia';
  const emailNormalized = email.toLowerCase().trim();

  // 1. Create or Find Company: FMCG Partners Asia
  console.log('🏢 Creating / Updating FMCG Partners Asia company...');
  const company = await prisma.company.upsert({
    where: { domain: 'fmcgpartners.asia' },
    update: {
      name: 'FMCG Partners Asia',
      normalizedName: 'fmcg partners asia',
      verificationStatus: VerificationStatus.VERIFIED,
      industry: 'Consumer Goods & Retail',
      subIndustry: 'Travel Retail & Airport Concessions',
      headquartersCity: 'Singapore',
      headquartersCountry: 'SG',
      websiteUrl: 'https://fmcgpartners.asia',
      description: 'Premier transit hub concessionaire and master retail distributor managing luxury lounge placements across Southeast Asia.',
    },
    create: {
      name: 'FMCG Partners Asia',
      normalizedName: 'fmcg partners asia',
      domain: 'fmcgpartners.asia',
      verificationStatus: VerificationStatus.VERIFIED,
      industry: 'Consumer Goods & Retail',
      subIndustry: 'Travel Retail & Airport Concessions',
      headquartersCity: 'Singapore',
      headquartersCountry: 'SG',
      websiteUrl: 'https://fmcgpartners.asia',
      description: 'Premier transit hub concessionaire and master retail distributor managing luxury lounge placements across Southeast Asia.',
      isSeedData: true,
    },
  });

  // 2. Create User Account & Roles
  console.log('👤 Creating user account for ' + email + ' ...');
  const user = await prisma.user.upsert({
    where: { emailNormalized },
    update: {
      passwordHash,
      accountStatus: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      emailNormalized,
      passwordHash,
      accountStatus: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // Ensure USER role
  const existingRole = await prisma.userRole.findFirst({
    where: { userId: user.id, role: RoleType.USER },
  });
  if (!existingRole) {
    await prisma.userRole.create({
      data: { userId: user.id, role: RoleType.USER },
    });
  }

  // Company Membership
  await prisma.companyMembership.upsert({
    where: {
      companyId_userId: {
        companyId: company.id,
        userId: user.id,
      },
    },
    update: {
      companyRole: CompanyRole.OWNER,
      membershipStatus: MembershipStatus.ACTIVE,
    },
    create: {
      companyId: company.id,
      userId: user.id,
      companyRole: CompanyRole.OWNER,
      membershipStatus: MembershipStatus.ACTIVE,
    },
  });

  // 3. Professional Profile
  console.log('📋 Creating / Updating Professional Profile...');
  const profile = await prisma.professionalProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: 'Priya Sharma',
      headline: 'VP Sourcing & Concession Distribution | Travel Retail & Airport Lounges',
      summary: '10+ years regional retail and FMCG concession expansion executive connecting organic brands with airport lounges, travel retail hubs, and supermarket chains across ASEAN transit corridors.',
      currentTitle: 'VP Sourcing & Concession Distribution',
      function: 'Commercial & Partnerships',
      seniority: 'VP / Executive',
      industry: 'Consumer Goods & Retail',
      city: 'Singapore',
      countryCode: 'SG',
      currentCompanyId: company.id,
      visibility: 'PUBLIC',
      isActive: true,
      connectionAvailability: 'OPEN',
      proposalAccepting: true,
      verificationStatus: VerificationStatus.VERIFIED,
      isLinkedInVerified: true,
      isWorkEmailVerified: true,
      completenessScore: 95,
    },
    create: {
      userId: user.id,
      displayName: 'Priya Sharma',
      headline: 'VP Sourcing & Concession Distribution | Travel Retail & Airport Lounges',
      summary: '10+ years regional retail and FMCG concession expansion executive connecting organic brands with airport lounges, travel retail hubs, and supermarket chains across ASEAN transit corridors.',
      currentTitle: 'VP Sourcing & Concession Distribution',
      function: 'Commercial & Partnerships',
      seniority: 'VP / Executive',
      industry: 'Consumer Goods & Retail',
      city: 'Singapore',
      countryCode: 'SG',
      currentCompanyId: company.id,
      visibility: 'PUBLIC',
      isActive: true,
      connectionAvailability: 'OPEN',
      proposalAccepting: true,
      verificationStatus: VerificationStatus.VERIFIED,
      isLinkedInVerified: true,
      isWorkEmailVerified: true,
      completenessScore: 95,
      isSeedData: true,
    },
  });

  // Seed Expertise & Intents
  await prisma.professionalExpertise.deleteMany({ where: { professionalProfileId: profile.id } });
  await prisma.professionalExpertise.createMany({
    data: [
      { professionalProfileId: profile.id, term: 'Travel Retail', normalizedTerm: 'travel retail' },
      { professionalProfileId: profile.id, term: 'Airport Concessions', normalizedTerm: 'airport concessions' },
      { professionalProfileId: profile.id, term: 'FMCG Distribution', normalizedTerm: 'fmcg distribution' },
      { professionalProfileId: profile.id, term: 'Beverage Sourcing', normalizedTerm: 'beverage sourcing' },
      { professionalProfileId: profile.id, term: 'Cross-Border Supply Chain', normalizedTerm: 'cross-border supply chain' },
    ],
  });

  await prisma.professionalIntent.deleteMany({ where: { professionalProfileId: profile.id } });
  await prisma.professionalIntent.createMany({
    data: [
      {
        professionalProfileId: profile.id,
        intentType: 'LOOKING_FOR',
        description: 'Premium FMCG brands and specialty beverage producers seeking high-traffic airport lounge and travel retail placements across ASEAN transit hubs.',
      },
      {
        professionalProfileId: profile.id,
        intentType: 'OFFERING',
        description: 'Direct concession placement access to 40+ transit lounges in Singapore Changi, Kuala Lumpur KLIA, and Bangkok Suvarnabhumi.',
      },
      {
        professionalProfileId: profile.id,
        intentType: 'NOT_LOOKING_FOR',
        description: 'Cold recruitment pitches, generic software sales, non-certified food products without ambient stability.',
      },
    ],
  });

  // 4. Feature 1: Partnership Readiness Signal
  console.log('📡 [F1] Seeding Partnership Readiness Signal for Priya...');
  await prisma.partnershipReadiness.upsert({
    where: { profileId: profile.id },
    update: {
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['FMCG & Beverages', 'Airport Concessions & Travel Retail', 'Specialty Food & Snacks']),
      activeGeographies: JSON.stringify(['SG', 'MY', 'TH', 'ASEAN', 'IN']),
      partnershipTypes: JSON.stringify(['Airport Concession Distribution', 'Exclusive Retail Placement', 'Brand Joint Venture']),
      notLookingFor: JSON.stringify(['Cold recruitment spam', 'Unsolicited software agencies', 'Non-certified food producers']),
      openMessage: 'Actively onboarding premium FMCG and specialty beverage brands for 40+ transit lounge concessions across Singapore Changi, KLIA, and Bangkok transit hubs.',
      refreshedAt: new Date(),
    },
    create: {
      profileId: profile.id,
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['FMCG & Beverages', 'Airport Concessions & Travel Retail', 'Specialty Food & Snacks']),
      activeGeographies: JSON.stringify(['SG', 'MY', 'TH', 'ASEAN', 'IN']),
      partnershipTypes: JSON.stringify(['Airport Concession Distribution', 'Exclusive Retail Placement', 'Brand Joint Venture']),
      notLookingFor: JSON.stringify(['Cold recruitment spam', 'Unsolicited software agencies', 'Non-certified food producers']),
      openMessage: 'Actively onboarding premium FMCG and specialty beverage brands for 40+ transit lounge concessions across Singapore Changi, KLIA, and Bangkok transit hubs.',
      refreshedAt: new Date(),
    },
  });

  // Also seed Company-level Readiness
  await prisma.partnershipReadiness.upsert({
    where: { companyId: company.id },
    update: {
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['Airport Lounges & Duty Free', 'Luxury Retail Concessions', 'Cross-Border Supply Chain']),
      activeGeographies: JSON.stringify(['SG', 'MY', 'TH', 'ID', 'PH']),
      partnershipTypes: JSON.stringify(['Master Distributorship Agreement', 'Concession Space Allocation', 'Brand Exclusive Placement']),
      notLookingFor: JSON.stringify(['One-off spot buys under $25k', 'Uncertified ambient products']),
      openMessage: 'FMCG Partners Asia is ready to evaluate international premium brands seeking master distribution access to Southeast Asian transit hubs.',
      refreshedAt: new Date(),
    },
    create: {
      companyId: company.id,
      status: ReadinessStatus.OPEN,
      activeSectors: JSON.stringify(['Airport Lounges & Duty Free', 'Luxury Retail Concessions', 'Cross-Border Supply Chain']),
      activeGeographies: JSON.stringify(['SG', 'MY', 'TH', 'ID', 'PH']),
      partnershipTypes: JSON.stringify(['Master Distributorship Agreement', 'Concession Space Allocation', 'Brand Exclusive Placement']),
      notLookingFor: JSON.stringify(['One-off spot buys under $25k', 'Uncertified ambient products']),
      openMessage: 'FMCG Partners Asia is ready to evaluate international premium brands seeking master distribution access to Southeast Asian transit hubs.',
      refreshedAt: new Date(),
    },
  });

  // 5. Feature 3: "Why Now" Trigger Signals for her company
  console.log('⚡ [F3] Seeding "Why Now" Trigger Signals for FMCG Partners Asia...');
  await prisma.triggerSignal.deleteMany({ where: { companyId: company.id } });
  await prisma.triggerSignal.createMany({
    data: [
      {
        companyId: company.id,
        triggerType: TriggerType.EXPANSION_SIGNAL,
        headline: 'FMCG Partners Asia secures exclusive 5-year concession contract across 12 Changi Terminal 3 & 4 lounges',
        body: 'Prime retail territory creating immediate vendor intake requirements for verified healthy beverage and artisan snack lines.',
        sourceUrl: 'https://retailasia.com/changi-concessions-2026',
        relevanceScore: 0.96,
        isVerified: true,
      },
      {
        companyId: company.id,
        triggerType: TriggerType.FUNDING_EVENT,
        headline: 'FMCG Partners Asia closes $8M trade finance syndication to scale regional inventory',
        body: 'Backed by Singaporean and regional commercial banking partners to ensure 30-day payment liquidity for onboarding suppliers.',
        sourceUrl: 'https://techinasia.com/fmcg-partners-asia-funding',
        relevanceScore: 0.91,
        isVerified: true,
      },
      {
        companyId: company.id,
        triggerType: TriggerType.HIRING_SIGNAL,
        headline: 'FMCG Partners Asia hiring 4 Senior Vendor Partnership Managers in Singapore & Bangkok',
        body: 'Active organizational expansion signal demonstrating immediate capacity to review inbound supplier proposals.',
        sourceUrl: 'https://linkedin.com/jobs/fmcg-partners-asia',
        relevanceScore: 0.89,
        isVerified: true,
      },
      {
        companyId: company.id,
        triggerType: TriggerType.PRODUCT_LAUNCH,
        headline: 'Fast-Track "Green Corridor" Supplier Intake launched for Halal & Organic certified brands',
        body: 'Accelerated 14-day compliance auditing and distribution listing for Southeast Asian food & beverage producers.',
        relevanceScore: 0.94,
        isVerified: true,
      },
    ],
  });

  // 6. Feature 5: Outcome Reputation Engine
  console.log('🏆 [F5] Seeding Outcome Reputation Score for Priya...');
  await prisma.reputationScore.upsert({
    where: { profileId: profile.id },
    update: {
      totalDeals: 8,
      closedWonCount: 7,
      averageRatingReceived: 4.95,
      responsivenessScore: 99,
      topCategories: JSON.stringify(['Airport Concessions', 'FMCG Distribution', 'Travel Retail', 'Cold-Chain']),
      topGeographies: JSON.stringify(['SG', 'MY', 'TH', 'ASEAN']),
      lastComputedAt: new Date(),
    },
    create: {
      profileId: profile.id,
      totalDeals: 8,
      closedWonCount: 7,
      averageRatingReceived: 4.95,
      responsivenessScore: 99,
      topCategories: JSON.stringify(['Airport Concessions', 'FMCG Distribution', 'Travel Retail', 'Cold-Chain']),
      topGeographies: JSON.stringify(['SG', 'MY', 'TH', 'ASEAN']),
      lastComputedAt: new Date(),
    },
  });

  // 7. Feature 2: Warm Trust Path & Connections (David Tan, Marcus Chen, Elena Rodriguez)
  console.log('🌐 [F2] Setting up Mutual Trust Network & Bridge Connections...');
  const david = await prisma.user.findFirst({ where: { email: 'david.tan@sgdistrib.com' }, include: { profile: true } });
  const marcus = await prisma.user.findFirst({ where: { email: 'companyadmin@projectsetu.com' }, include: { profile: true } });
  const elena = await prisma.user.findFirst({ where: { email: 'colleague@apexpacific.com' }, include: { profile: true } });

  // Connect Priya <-> David Tan
  let connDavid = null;
  if (david?.profile) {
    connDavid = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterUserId: user.id, recipientProfileId: david.profile.id },
          { requesterUserId: david.id, recipientProfileId: profile.id },
        ],
      },
    });

    if (!connDavid) {
      connDavid = await prisma.connection.create({
        data: {
          requesterUserId: user.id,
          recipientProfileId: david.profile.id,
          businessReason: 'Explore regional cold-chain distribution partnership for airport lounge beverage supplies.',
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
    } else {
      await prisma.connection.update({
        where: { id: connDavid.id },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      });
    }

    // Introduction record to establish David as a warm bridge connector
    if (elena?.profile) {
      await prisma.introductionRequest.upsert({
        where: { id: `intro-david-${user.id.slice(0, 8)}` },
        update: { status: 'ACCEPTED_BY_TARGET' },
        create: {
          id: `intro-david-${user.id.slice(0, 8)}`,
          requesterUserId: user.id,
          targetProfileId: elena.profile.id,
          intermediaryUserId: david.id,
          businessReason: 'Warm introduction for APAC retail placement synergies.',
          status: 'ACCEPTED_BY_TARGET',
        },
      });
    }
  }

  // Connect Priya <-> Marcus Chen
  let connMarcus = null;
  if (marcus?.profile) {
    connMarcus = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterUserId: user.id, recipientProfileId: marcus.profile.id },
          { requesterUserId: marcus.id, recipientProfileId: profile.id },
        ],
      },
    });

    if (!connMarcus) {
      connMarcus = await prisma.connection.create({
        data: {
          requesterUserId: marcus.id,
          recipientProfileId: profile.id,
          businessReason: 'Finalize master distribution & airport concession procurement terms.',
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
    } else {
      await prisma.connection.update({
        where: { id: connMarcus.id },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      });
    }
  }

  // 8. Feature 4: Setu Deal Rooms
  console.log('🤝 [F4] Seeding Setu Deal Rooms for Priya...');
  // Deal Room 1: Active with David Tan
  if (connDavid && david) {
    const room1 = await prisma.dealRoom.upsert({
      where: { connectionId: connDavid.id },
      update: {
        title: 'Changi Airport Lounges Cold-Chain Beverage Placement SLA',
        status: DealRoomStatus.ACTIVE,
        initiatorUserId: user.id,
        partnerUserId: david.id,
        initiatorGoal: 'Secure certified refrigerated storage & guaranteed 48-hour delivery SLA across 12 Changi Terminal 3 & 4 executive lounges.',
        partnerGoal: 'Provide dedicated cold-storage bonded space at Changi Airfreight Centre and daily airside pass delivery dispatch.',
        ndaRequired: true,
      },
      create: {
        connectionId: connDavid.id,
        title: 'Changi Airport Lounges Cold-Chain Beverage Placement SLA',
        status: DealRoomStatus.ACTIVE,
        initiatorUserId: user.id,
        partnerUserId: david.id,
        initiatorGoal: 'Secure certified refrigerated storage & guaranteed 48-hour delivery SLA across 12 Changi Terminal 3 & 4 executive lounges.',
        partnerGoal: 'Provide dedicated cold-storage bonded space at Changi Airfreight Centre and daily airside pass delivery dispatch.',
        ndaRequired: true,
      },
    });

    await prisma.dealRoomMilestone.deleteMany({ where: { dealRoomId: room1.id } });
    await prisma.dealRoomMilestone.createMany({
      data: [
        {
          dealRoomId: room1.id,
          title: 'Mutual Non-Disclosure Agreement (NDA) executed',
          description: 'Standard Project Setu verified commercial secrecy agreement signed by both legal teams.',
          isCompleted: true,
          completedAt: new Date(Date.now() - 5 * 86310000),
        },
        {
          dealRoomId: room1.id,
          title: 'Airside Airport Security Pass & Fleet Compliance Audit',
          description: 'Audit verified storage temperature thresholds (+2°C to +4°C) across airside transit fleet.',
          isCompleted: true,
          completedAt: new Date(Date.now() - 2 * 86310000),
        },
        {
          dealRoomId: room1.id,
          title: 'Pilot Consignment Run: 300 cases delivered to Terminal 3 Ambassador Lounge',
          description: 'Live test shipping run monitoring real-time telemetry, temperature logs, and delivery punctuality.',
          dueDate: new Date(Date.now() + 4 * 86310000),
          isCompleted: false,
        },
        {
          dealRoomId: room1.id,
          title: 'Execute Annual Master Distributorship SLA & Volume Rebate Schedule',
          description: 'Finalize volume tier discounts, airside storage guarantees, and 30-day settlement terms.',
          dueDate: new Date(Date.now() + 12 * 86310000),
          isCompleted: false,
        },
      ],
    });
  }

  // Deal Room 2: Closed Won with Marcus Chen (with full bilateral outcome rating & feedback)
  if (connMarcus && marcus) {
    const room2 = await prisma.dealRoom.upsert({
      where: { connectionId: connMarcus.id },
      update: {
        title: 'KLIA Concession Hub Master Distribution Agreement',
        status: DealRoomStatus.CLOSED_WON,
        initiatorUserId: marcus.id,
        partnerUserId: user.id,
        initiatorGoal: 'Onboard premium Asian food & beverage brands into 18 duty-free and transit points at KLIA 1 & 2.',
        partnerGoal: 'Secure regional master distributor pricing and dedicated marketing placement across departures.',
        ndaRequired: true,
        closedAt: new Date(Date.now() - 10 * 86310000),
        closedOutcome: DealOutcomeType.DEAL_CLOSED,
      },
      create: {
        connectionId: connMarcus.id,
        title: 'KLIA Concession Hub Master Distribution Agreement',
        status: DealRoomStatus.CLOSED_WON,
        initiatorUserId: marcus.id,
        partnerUserId: user.id,
        initiatorGoal: 'Onboard premium Asian food & beverage brands into 18 duty-free and transit points at KLIA 1 & 2.',
        partnerGoal: 'Secure regional master distributor pricing and dedicated marketing placement across departures.',
        ndaRequired: true,
        closedAt: new Date(Date.now() - 10 * 86310000),
        closedOutcome: DealOutcomeType.DEAL_CLOSED,
      },
    });

    await prisma.dealRoomMilestone.deleteMany({ where: { dealRoomId: room2.id } });
    await prisma.dealRoomMilestone.createMany({
      data: [
        {
          dealRoomId: room2.id,
          title: 'Commercial Terms Sheet & Territory Exclusivity Signed',
          isCompleted: true,
          completedAt: new Date(Date.now() - 20 * 86310000),
        },
        {
          dealRoomId: room2.id,
          title: 'JAKIM Halal Verification & Import Licensing Completed',
          isCompleted: true,
          completedAt: new Date(Date.now() - 15 * 86310000),
        },
        {
          dealRoomId: room2.id,
          title: 'Official Master Distributorship Contract Executed',
          isCompleted: true,
          completedAt: new Date(Date.now() - 10 * 86310000),
        },
      ],
    });

    // Bilateral outcome
    await prisma.partnershipOutcome.upsert({
      where: { dealRoomId: room2.id },
      update: {
        outcomeType: DealOutcomeType.DEAL_CLOSED,
        partnershipCategory: 'Airport Retail Concessions',
        geographyTag: 'MY',
        dealValue: 450000,
        initiatorRating: 5,
        partnerRating: 5,
        initiatorFeedback: 'Priya and FMCG Partners Asia demonstrated remarkable commercial precision and instant execution.',
        partnerFeedback: 'Apex Pacific Distribution is an outstanding logistics partner. Seamless port-to-airside transition.',
        initiatorSubmittedAt: new Date(Date.now() - 9 * 86310000),
        partnerSubmittedAt: new Date(Date.now() - 8 * 86310000),
      },
      create: {
        dealRoomId: room2.id,
        outcomeType: DealOutcomeType.DEAL_CLOSED,
        partnershipCategory: 'Airport Retail Concessions',
        geographyTag: 'MY',
        dealValue: 450000,
        initiatorRating: 5,
        partnerRating: 5,
        initiatorFeedback: 'Priya and FMCG Partners Asia demonstrated remarkable commercial precision and instant execution.',
        partnerFeedback: 'Apex Pacific Distribution is an outstanding logistics partner. Seamless port-to-airside transition.',
        initiatorSubmittedAt: new Date(Date.now() - 9 * 86310000),
        partnerSubmittedAt: new Date(Date.now() - 8 * 86310000),
      },
    });
  }

  console.log('🎉 Seeding successfully completed for ' + email + '!');
  console.log('🔑 Login Credentials:');
  console.log('   Email: ' + email);
  console.log('   Password: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
