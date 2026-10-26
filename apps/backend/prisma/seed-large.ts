import { PrismaClient, RoleType, AccountStatus, VerificationStatus, CompanyRole, MembershipStatus, ConnectionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Data generators for realistic corporate & professional networks
const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Alex', 'Amanda', 'Ananya', 'Benjamin', 'Carlos', 'Chloe', 'David', 'Deepa',
  'Elena', 'Farhan', 'Grace', 'Hassan', 'Isabella', 'James', 'Ji-hoon', 'Kavita', 'Liam', 'Mei-Ling',
  'Nathan', 'Oliver', 'Pooja', 'Qian', 'Rahul', 'Rohan', 'Samantha', 'Siddharth', 'Sophia', 'Tan',
  'Umar', 'Vikram', 'Wei', 'Xiang', 'Yasmin', 'Zack', 'Marcus', 'Nadia', 'Kenji', 'Priya',
  'Lucas', 'Fatima', 'Arjun', 'Sarah', 'Dmitri', 'Anika', 'Mateo', 'Zara', 'Tariq', 'Sora'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Tan', 'Wong', 'Lim', 'Kumar', 'Chen', 'Singh', 'Lee', 'Nair',
  'Rodriguez', 'Muller', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Verma', 'Gupta', 'Iyer', 'Reddy', 'Chopra', 'Rao', 'Das', 'Bose', 'Menon', 'Pillai',
  'Yamamoto', 'Sato', 'Suzuki', 'Takahashi', 'Park', 'Kim', 'Choi', 'Nguyen', 'Tran', 'Le',
  'Al-Mansoor', 'Hakim', 'Rahman', 'Aziz', 'Kowalski', 'Novak', 'Dubois', 'Leroy', 'Moreau', 'Costa'
];

const INDUSTRIES = [
  { industry: 'Enterprise Software & SaaS', sub: 'Cloud & DevOps Infrastructure', cities: ['San Francisco', 'Bengaluru', 'Singapore', 'London', 'Berlin'] },
  { industry: 'FinTech & Payments', sub: 'Cross-Border Liquidity & Banking', cities: ['New York', 'Singapore', 'London', 'Dubai', 'Mumbai'] },
  { industry: 'FMCG & Consumer Goods', sub: 'Food & Beverage Supply Chain', cities: ['Kuala Lumpur', 'Jakarta', 'Bangkok', 'Singapore', 'Mumbai'] },
  { industry: 'Logistics & Freight', sub: 'Cold-Chain & Maritime Transport', cities: ['Rotterdam', 'Singapore', 'Dubai', 'Hong Kong', 'Hamburg'] },
  { industry: 'Renewable Energy & CleanTech', sub: 'Solar Grid & Battery Storage', cities: ['Munich', 'Austin', 'Bengaluru', 'Oslo', 'Tokyo'] },
  { industry: 'HealthTech & BioPharma', sub: 'Clinical Intelligence & AI Diagnostics', cities: ['Boston', 'Cambridge', 'Basel', 'Hyderabad', 'Zurich'] },
  { industry: 'Automotive & Mobility', sub: 'Electric Vehicles & Telematics', cities: ['Stuttgart', 'Tokyo', 'Detroit', 'Seoul', 'Bengaluru'] },
  { industry: 'Wholesale & Retail Alliances', sub: 'Omnichannel Distribution', cities: ['Chicago', 'Singapore', 'Toronto', 'Melbourne', 'London'] },
  { industry: 'Cybersecurity & Defense', sub: 'Zero Trust & Threat Intelligence', cities: ['Tel Aviv', 'Washington DC', 'London', 'Sydney', 'Bengaluru'] },
  { industry: 'Semiconductors & DeepTech', sub: 'EDA & High Performance Computing', cities: ['Hsinchu', 'San Jose', 'Eindhoven', 'Tokyo', 'Seoul'] },
];

const COMPANY_PREFIXES = [
  'Acro', 'Aegis', 'Alpha', 'Altas', 'Apex', 'Astra', 'Beacon', 'Blue', 'Catalyst', 'Centra',
  'Crest', 'Cyber', 'Data', 'Delta', 'Dynamic', 'Echo', 'Elevation', 'Equinox', 'Evergreen', 'Falcon',
  'Fortis', 'Global', 'Helix', 'Horizon', 'Hyperion', 'Inno', 'Integral', 'Kinetix', 'Luminary', 'Matrix',
  'Meridian', 'Nexus', 'Nova', 'Omni', 'Optima', 'Orbit', 'Pacific', 'Peak', 'Pinnacle', 'Polaris',
  'Prime', 'Quantum', 'Radiant', 'Sigma', 'Solstice', 'Spectra', 'Summit', 'Synthetix', 'Terra', 'Veda',
  'Vector', 'Vertex', 'Vanguard', 'Velocity', 'Vision', 'Vital', 'Volt', 'Zenith', 'Zephyr', 'Zeta'
];

const COMPANY_SUFFIXES = [
  'Technologies', 'Solutions', 'Logistics', 'Networks', 'Labs', 'Systems', 'Ventures', 'Global',
  'Dynamics', 'Partners', 'Innovations', 'Enterprises', 'Capital', 'Industries', 'Bio', 'Robotics',
  'Commerce', 'Cloud', 'Digital', 'Holdings'
];

const DECISION_MAKER_ROLES = [
  { title: 'Chief Commercial Officer', func: 'Commercial & BD', seniority: 'C-Level' },
  { title: 'VP of Global Partnerships', func: 'Strategic Alliances', seniority: 'VP / Executive' },
  { title: 'Head of Enterprise Procurement', func: 'Procurement', seniority: 'Director / Head' },
  { title: 'Managing Director, APAC', func: 'Executive Management', seniority: 'Managing Director' },
  { title: 'Chief Technology Officer', func: 'Engineering & AI', seniority: 'C-Level' },
  { title: 'VP of Supply Chain & Distribution', func: 'Logistics', seniority: 'VP / Executive' },
  { title: 'Head of Strategic Sourcing', func: 'Procurement', seniority: 'Director / Head' },
  { title: 'Director of Business Development', func: 'Business Development', seniority: 'Director / Head' },
  { title: 'Chief Revenue Officer', func: 'Revenue Operations', seniority: 'C-Level' },
  { title: 'VP of Engineering & Infrastructure', func: 'Technology', seniority: 'VP / Executive' },
  { title: 'Head of Regional Alliances', func: 'Partnerships', seniority: 'Director / Head' },
  { title: 'Senior Director of Product Strategy', func: 'Product Management', seniority: 'Director / Head' },
  { title: 'Principal Solution Architect', func: 'Solutions Consulting', seniority: 'Principal / Lead' },
  { title: 'Lead Sourcing Manager', func: 'Procurement', seniority: 'Manager' },
  { title: 'Channel Sales Director', func: 'Sales & Channel', seniority: 'Director / Head' },
];

const INTENT_LOOKING_FOR = [
  'Seeking authorized distributor partners in Southeast Asia with established hypermarket channel access.',
  'Looking for supply chain and procurement leaders managing cold-chain warehousing in Singapore & Malaysia.',
  'Exploring API integration partners with ISO27001 compliance for enterprise cross-border payments.',
  'Evaluating tier-1 software distribution agreements for enterprise cyber compliance tools in EMEA.',
  'Identifying business development counterparts at leading beverage and FMCG conglomerates.',
  'Seeking introductions to regional fleet logistics operations heads across APAC ports.',
  'Looking for co-development partners in generative AI intent orchestration and retrieval pipelines.',
  'Seeking strategic B2B sourcing contracts with renewable solar equipment manufacturers.',
];

const INTENT_OFFERING = [
  'Authorized regional distribution network spanning 400+ tier-1 retail supermarkets across Singapore and Malaysia.',
  'Enterprise SaaS platform with SOC2 and GDPR compliance, processing 10M+ daily events.',
  'Direct wholesale supply contracts with verified agricultural producers and certified cold-brew suppliers.',
  'High-reliability cross-border treasury infrastructure supporting 40+ currencies with real-time settlement.',
  'Dedicated commercial partnerships desk and technical integration engineering teams in Bengaluru and Singapore.',
  'Turnkey logistics fleet management with automated customs clearance and IoT telematics.',
  'B2B partnership matchmaking models trained on commercial transaction histories and verify-proof keys.',
  'Strategic seed and series-A co-investment and corporate venture syndication.',
];

async function main() {
  console.log('🚀 Starting Large-Scale Realistic Seeding for Project Setu...');
  console.log('   Target: 1,000+ Verified Companies & 500+ Decision Makers / Users');

  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Generate 1,000 Verified Companies in Batch
  console.log('\n🏢 Generating 1,000 Realistic Companies across Global Tech, FMCG, Logistics & FinTech...');
  const companyDataList: any[] = [];
  const createdDomains = new Set<string>();

  // Ensure 1000 unique company records
  let companyIdx = 0;
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 20; j++) {
      companyIdx++;
      const pfx = COMPANY_PREFIXES[i % COMPANY_PREFIXES.length];
      const sfx = COMPANY_SUFFIXES[j % COMPANY_SUFFIXES.length];
      const indChoice = INDUSTRIES[(i + j) % INDUSTRIES.length];
      const city = indChoice.cities[(i * 3 + j) % indChoice.cities.length];
      const countryCode = city === 'Singapore' ? 'SG' : city === 'Kuala Lumpur' ? 'MY' : city === 'Bengaluru' || city === 'Mumbai' || city === 'Hyderabad' ? 'IN' : city === 'London' ? 'GB' : city === 'Berlin' || city === 'Munich' ? 'DE' : city === 'Tokyo' ? 'JP' : 'US';
      
      const companyName = `${pfx} ${sfx} ${companyIdx > 100 ? companyIdx : ''}`.trim();
      const domainSlug = `${pfx.toLowerCase()}-${sfx.toLowerCase()}-${companyIdx}.com`;

      if (!createdDomains.has(domainSlug)) {
        createdDomains.add(domainSlug);
        companyDataList.push({
          name: companyName,
          normalizedName: companyName.toLowerCase(),
          legalName: `${companyName} Pte. Ltd.`,
          domain: domainSlug,
          websiteUrl: `https://${domainSlug}`,
          description: `Leading provider in ${indChoice.sub}. Operating regional centers across ${city} with active B2B enterprise client bases.`,
          companyType: 'ENTERPRISE',
          industry: indChoice.industry,
          subIndustry: indChoice.sub,
          headquartersCity: city,
          headquartersCountry: countryCode,
          verificationStatus: VerificationStatus.VERIFIED,
          isSeedData: true,
        });
      }
    }
  }

  console.log(`   Inserting ${companyDataList.length} companies into project_setu.companies...`);
  // Insert in batches of 200 for maximum PostgreSQL throughput
  const insertedCompanies: any[] = [];
  const batchSize = 200;
  for (let b = 0; b < companyDataList.length; b += batchSize) {
    const chunk = companyDataList.slice(b, b + batchSize);
    for (const c of chunk) {
      const record = await prisma.company.upsert({
        where: { domain: c.domain },
        update: { verificationStatus: VerificationStatus.VERIFIED },
        create: c,
      });
      insertedCompanies.push(record);
    }
    process.stdout.write(`   ✓ Processed ${Math.min(b + batchSize, companyDataList.length)}/${companyDataList.length} companies\r`);
  }
  console.log(`\n   ✅ Successfully verified and loaded ${insertedCompanies.length} companies.`);

  // 2. Generate 500 Decision Makers & Consumers / Users
  console.log('\n👥 Generating 500 Decision Makers, CXOs, Commercial Leads & Members...');
  const totalUsersToGenerate = 500;
  const createdProfiles: any[] = [];
  const createdUsers: any[] = [];

  for (let u = 0; u < totalUsersToGenerate; u++) {
    const fName = FIRST_NAMES[u % FIRST_NAMES.length];
    const lName = LAST_NAMES[(u * 7) % LAST_NAMES.length];
    const assignedCompany = insertedCompanies[u % insertedCompanies.length];
    const roleDef = DECISION_MAKER_ROLES[u % DECISION_MAKER_ROLES.length];
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${u + 1}@${assignedCompany.domain}`;
    const emailNormalized = email.toLowerCase();
    const displayName = `${fName} ${lName}`;

    // Decide user role: top 50 are Company Admins, rest are Users / Members
    const isCompanyAdmin = u < 50;
    const userRoleTypes = isCompanyAdmin 
      ? [RoleType.COMPANY_ADMIN, RoleType.USER] 
      : [RoleType.USER];

    const headline = `${roleDef.title} at ${assignedCompany.name} | ${roleDef.func}`;
    const summary = `Experienced ${roleDef.seniority} driving ${assignedCompany.subIndustry} strategies and high-impact B2B partnerships in ${assignedCompany.headquartersCity}. Open to high-trust introductions with verified business intent.`;

    // 1. Create User
    const userRecord = await prisma.user.upsert({
      where: { emailNormalized },
      update: { accountStatus: AccountStatus.ACTIVE },
      create: {
        email,
        emailNormalized,
        passwordHash,
        accountStatus: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });
    createdUsers.push(userRecord);

    // 2. Assign Roles
    for (const r of userRoleTypes) {
      const existing = await prisma.userRole.findFirst({
        where: { userId: userRecord.id, role: r },
      });
      if (!existing) {
        await prisma.userRole.create({
          data: { userId: userRecord.id, role: r },
        });
      }
    }

    // 3. Create Professional Profile
    const profileRecord = await prisma.professionalProfile.upsert({
      where: { userId: userRecord.id },
      update: {
        displayName,
        headline,
        summary,
        currentTitle: roleDef.title,
        function: roleDef.func,
        seniority: roleDef.seniority,
        industry: assignedCompany.industry,
        city: assignedCompany.headquartersCity,
        countryCode: assignedCompany.headquartersCountry,
        currentCompanyId: assignedCompany.id,
        visibility: 'PUBLIC',
        verificationStatus: VerificationStatus.VERIFIED,
      },
      create: {
        userId: userRecord.id,
        displayName,
        headline,
        summary,
        currentTitle: roleDef.title,
        function: roleDef.func,
        seniority: roleDef.seniority,
        industry: assignedCompany.industry,
        city: assignedCompany.headquartersCity,
        countryCode: assignedCompany.headquartersCountry,
        currentCompanyId: assignedCompany.id,
        visibility: 'PUBLIC',
        verificationStatus: VerificationStatus.VERIFIED,
        isSeedData: true,
      },
    });
    createdProfiles.push(profileRecord);

    // 4. Attach Company Membership
    await prisma.companyMembership.upsert({
      where: {
        companyId_userId: {
          companyId: assignedCompany.id,
          userId: userRecord.id,
        },
      },
      update: {
        companyRole: isCompanyAdmin ? CompanyRole.ADMIN : CompanyRole.MEMBER,
        membershipStatus: MembershipStatus.ACTIVE,
      },
      create: {
        companyId: assignedCompany.id,
        userId: userRecord.id,
        companyRole: isCompanyAdmin ? CompanyRole.ADMIN : CompanyRole.MEMBER,
        membershipStatus: MembershipStatus.ACTIVE,
      },
    });

    // 5. Add Intent & Expertise
    const offerText = INTENT_OFFERING[u % INTENT_OFFERING.length];
    const lookText = INTENT_LOOKING_FOR[u % INTENT_LOOKING_FOR.length];

    await prisma.professionalIntent.createMany({
      data: [
        { professionalProfileId: profileRecord.id, intentType: 'OFFERING', description: offerText },
        { professionalProfileId: profileRecord.id, intentType: 'LOOKING_FOR', description: lookText },
      ],
      skipDuplicates: true,
    });

    await prisma.professionalExpertise.createMany({
      data: [
        { professionalProfileId: profileRecord.id, term: roleDef.func, normalizedTerm: roleDef.func.toLowerCase() },
        { professionalProfileId: profileRecord.id, term: assignedCompany.industry || 'Enterprise', normalizedTerm: (assignedCompany.industry || 'enterprise').toLowerCase() },
        { professionalProfileId: profileRecord.id, term: 'B2B Partnerships', normalizedTerm: 'b2b partnerships' },
      ],
      skipDuplicates: true,
    });

    if (u % 25 === 0 || u === totalUsersToGenerate - 1) {
      process.stdout.write(`   ✓ Generated ${u + 1}/${totalUsersToGenerate} users and decision-maker profiles\r`);
    }
  }

  // 3. Seed Realistic Network Connections & Introductions
  console.log('\n\n🔗 Interconnecting Profiles with Verified Connections and Introductions...');
  let connectionCount = 0;
  for (let i = 0; i < 150; i++) {
    const requester = createdUsers[i];
    const targetProfile = createdProfiles[(i + 7) % createdProfiles.length];

    if (requester && targetProfile && targetProfile.userId !== requester.id) {
      const existingConn = await prisma.connection.findUnique({
        where: {
          requesterUserId_recipientProfileId: {
            requesterUserId: requester.id,
            recipientProfileId: targetProfile.id,
          },
        },
      });

      if (!existingConn) {
        await prisma.connection.create({
          data: {
            requesterUserId: requester.id,
            recipientProfileId: targetProfile.id,
            status: i % 5 === 0 ? ConnectionStatus.PENDING : ConnectionStatus.ACCEPTED,
            businessReason: `Exploring mutual channel expansion in ${targetProfile.city} for ${targetProfile.function}.`,
          },
        });
        connectionCount++;
      }
    }
  }
  console.log(`   ✅ Seeded ${connectionCount} active and pending network connections.`);

  // 4. Summary Output
  const totalCompaniesCount = await prisma.company.count();
  const totalUsersCount = await prisma.user.count();
  const totalProfilesCount = await prisma.professionalProfile.count();
  const totalConnectionsCount = await prisma.connection.count();

  console.log('\n=============================================================');
  console.log('🎉 LARGE-SCALE DATABASE SEEDING COMPLETED!');
  console.log('=============================================================');
  console.log(`📊 TOTAL VERIFIED COMPANIES IN DATABASE:        ${totalCompaniesCount}`);
  console.log(`👥 TOTAL AUTHENTICATED USERS:                   ${totalUsersCount}`);
  console.log(`💼 TOTAL PROFESSIONAL DECISION-MAKER PROFILES:  ${totalProfilesCount}`);
  console.log(`🌐 TOTAL ACTIVE INTENT CONNECTIONS:             ${totalConnectionsCount}`);
  console.log('=============================================================');
  console.log('Sample Logins for Testing (all use password: Password123!):');
  console.log('  1. Super Admin:     admin@vedasynk.local');
  console.log('  2. Company Admin:   companyadmin@projectsetu.com');
  console.log('  3. Regular Member:  user@projectsetu.com');
  console.log('  4. Seeded CXO 1:    aarav.sharma.1@acro-technologies-1.com');
  console.log('  5. Seeded CXO 2:    aditi.patel.2@acro-solutions-2.com');
  console.log('=============================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during large-scale seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
