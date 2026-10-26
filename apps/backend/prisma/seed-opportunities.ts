import {
  PrismaClient,
  OpportunityOwnerType,
  OpportunityStatus,
  OpportunityVisibility,
  OpportunityMatchLevel,
  OpportunityRequestStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Gap 1 Mutual Opportunity Matching data...');

  const priya = await prisma.user.findFirst({
    where: { email: 'priya.sharma@fmcgpartners.asia' },
    include: { profile: true },
  });
  if (!priya) {
    console.log('Priya Sharma not found, aborting opportunity seed.');
    return;
  }

  const elena = await prisma.user.findFirst({
    where: { email: 'colleague@apexpacific.com' },
    include: { profile: true },
  });

  const fmcgCompany = await prisma.company.findFirst({
    where: { domain: 'fmcgpartners.asia' },
  });

  const apexCompany = await prisma.company.findFirst({
    where: { domain: 'apexpacific.com' },
  });

  if (!fmcgCompany || !apexCompany) {
    console.log('Companies not found, aborting.');
    return;
  }

  console.log('1. Creating Opportunity for FMCG Partners Asia (Priya)...');
  const oppFMCG = await prisma.opportunityProfile.upsert({
    where: { id: 'opp-fmcg-concessions-01' },
    update: {
      status: OpportunityStatus.ACTIVE,
      visibility: OpportunityVisibility.DISCOVERABLE,
    },
    create: {
      id: 'opp-fmcg-concessions-01',
      ownerType: OpportunityOwnerType.COMPANY,
      companyId: fmcgCompany.id,
      profileId: priya.profile?.id,
      createdById: priya.id,
      title: 'Premium Airport Lounge Beverage Concession Intake',
      summary: 'Master concessionaire managing 12 Changi Terminal 3 & 4 VIP lounges seeking organic, premium botanical beverage brands for ASEAN transit placements.',
      status: OpportunityStatus.ACTIVE,
      visibility: OpportunityVisibility.DISCOVERABLE,
      approvalMode: 'MANUAL',
      targetIndustries: JSON.stringify(['Food & Beverage', 'Consumer Goods & Retail', 'Travel Retail']),
      targetMarkets: JSON.stringify(['SG', 'MY', 'TH']),
      partnerTypes: JSON.stringify(['beverage_producer', 'organic_brand', 'specialty_food']),
      publishedAt: new Date(),
      requirements: {
        create: {
          businessObjective: 'distribution_partnership',
          partnerType: 'beverage_producer',
          industries: JSON.stringify(['Food & Beverage', 'Consumer Goods & Retail']),
          geographies: JSON.stringify(['SG', 'MY', 'TH']),
          description: 'Seeking organic botanical infusions and shelf-stable premium beverages with export compliance for airport VIP lounges.',
        },
      },
      offers: {
        create: {
          capability: 'hospitality_distribution',
          productsServices: 'Changi Airport T3 & T4 lounge shelf placements, cold-chain customs clearance, regional master distribution.',
          marketAccess: '12 Changi VIP Lounges, KLIA Satellite Terminal, ASEAN transit network.',
          geographies: JSON.stringify(['SG', 'MY', 'TH']),
        },
      },
    },
  });

  console.log('2. Creating Complementary Opportunity for Apex Pacific (Elena/David)...');
  const oppApex = await prisma.opportunityProfile.upsert({
    where: { id: 'opp-apex-beverages-02' },
    update: {
      status: OpportunityStatus.ACTIVE,
      visibility: OpportunityVisibility.DISCOVERABLE,
    },
    create: {
      id: 'opp-apex-beverages-02',
      ownerType: OpportunityOwnerType.COMPANY,
      companyId: apexCompany.id,
      profileId: elena?.profile?.id,
      createdById: elena?.id || priya.id,
      title: 'Cross-Border Organic Botanical Beverage Regional Distribution',
      summary: 'APAC regional distributor and producer of Halal & Organic certified botanical cold infusions seeking airport lounge and travel retail placements in Singapore.',
      status: OpportunityStatus.ACTIVE,
      visibility: OpportunityVisibility.DISCOVERABLE,
      approvalMode: 'MANUAL',
      targetIndustries: JSON.stringify(['Food & Beverage', 'Consumer Goods & Retail', 'Travel Retail']),
      targetMarkets: JSON.stringify(['SG', 'MY', 'TH']),
      partnerTypes: JSON.stringify(['airport_concessionaire', 'hospitality_operator', 'lounge_distributor']),
      publishedAt: new Date(),
      requirements: {
        create: {
          businessObjective: 'hospitality_distribution',
          partnerType: 'airport_concessionaire',
          industries: JSON.stringify(['Food & Beverage', 'Travel Retail']),
          geographies: JSON.stringify(['SG', 'MY', 'TH']),
          description: 'Looking for transit hub concessionaires and premium airport lounge partners with established shelf placement in Changi and KLIA.',
        },
      },
      offers: {
        create: {
          capability: 'distribution_partnership',
          productsServices: 'Direct factory supply of certified organic botanical infusions, sparkling botanical teas, and customs-ready bonded export inventory.',
          marketAccess: 'Johor & Penang bonded manufacturing hubs, bonded cross-border cold chain.',
          geographies: JSON.stringify(['SG', 'MY', 'TH']),
        },
      },
    },
  });

  console.log('3. Creating Symmetrical Mutual Intent Match...');
  const evidence = {
    sourceWants: 'Seeking organic botanical infusions and shelf-stable premium beverages with export compliance for airport VIP lounges.',
    candOffers: 'Direct factory supply of certified organic botanical infusions, sparkling botanical teas, and customs-ready bonded export inventory.',
    candWants: 'Looking for transit hub concessionaires and premium airport lounge partners with established shelf placement in Changi and KLIA.',
    sourceOffers: 'Changi Airport T3 & T4 lounge shelf placements, cold-chain customs clearance, regional master distribution.',
    commonMarkets: ['SG', 'MY', 'TH'],
    overlaps: [
      'Symmetrical Two-Way Business Alignment: Mutual Offer & Demand match',
      'Shared Industry Sector: Food & Beverage, Consumer Goods & Retail, Travel Retail',
      'Co-located Target Geography: SG, MY, TH',
      'Compatible Commercial Partner Profile: airport_concessionaire <-> beverage_producer',
      'Verified Corporate Capabilities Active',
    ],
    score: 96,
  };

  await prisma.opportunityMatch.upsert({
    where: {
      sourceOpportunityId_targetOpportunityId: {
        sourceOpportunityId: oppFMCG.id,
        targetOpportunityId: oppApex.id,
      },
    },
    update: {
      matchLevel: OpportunityMatchLevel.MUTUAL_INTENT,
      score: 96,
      evidenceJson: JSON.stringify(evidence),
      whyMatches: 'Direct Mutual Intent: Both profiles have complementary offers and active acquisition criteria across SG/MY/TH.',
    },
    create: {
      sourceOpportunityId: oppFMCG.id,
      targetOpportunityId: oppApex.id,
      matchLevel: OpportunityMatchLevel.MUTUAL_INTENT,
      score: 96,
      evidenceJson: JSON.stringify(evidence),
      whyMatches: 'Direct Mutual Intent: Both profiles have complementary offers and active acquisition criteria across SG/MY/TH.',
    },
  });

  console.log('4. Creating Sample Inbound Business Interest Request for Priya...');
  if (elena) {
    await prisma.opportunityRequest.upsert({
      where: { id: 'req-apex-to-fmcg-01' },
      update: {
        status: OpportunityRequestStatus.PENDING,
      },
      create: {
        id: 'req-apex-to-fmcg-01',
        senderOpportunityId: oppApex.id,
        recipientOpportunityId: oppFMCG.id,
        senderUserId: elena.id,
        recipientUserId: priya.id,
        message: 'Hi Priya, we saw your concession intake for Changi T3 & T4 lounges. We have 4 export-ready Halal & Organic certified botanical RTD lines ready for immediate lounge placement with bonded Singapore logistics. Would love to coordinate terms.',
        status: OpportunityRequestStatus.PENDING,
      },
    });
  }

  console.log('✅ Gap 1 Opportunity seed complete!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
