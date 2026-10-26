import { PrismaClient, RoleType, AccountStatus, VerificationStatus, CompanyRole, MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Helper to chunk arrays for batch insertion
function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

// Global Hubs & Locations
interface LocationHub {
  city: string;
  countryCode: string;
  region: string;
}

const GLOBAL_LOCATIONS: LocationHub[] = [
  // North America
  { city: 'New York', countryCode: 'US', region: 'North America' },
  { city: 'San Francisco', countryCode: 'US', region: 'North America' },
  { city: 'Chicago', countryCode: 'US', region: 'North America' },
  { city: 'Austin', countryCode: 'US', region: 'North America' },
  { city: 'Seattle', countryCode: 'US', region: 'North America' },
  { city: 'Boston', countryCode: 'US', region: 'North America' },
  { city: 'Toronto', countryCode: 'CA', region: 'North America' },
  { city: 'Vancouver', countryCode: 'CA', region: 'North America' },
  { city: 'Montreal', countryCode: 'CA', region: 'North America' },
  { city: 'Mexico City', countryCode: 'MX', region: 'North America' },
  { city: 'Monterrey', countryCode: 'MX', region: 'North America' },

  // Europe
  { city: 'London', countryCode: 'GB', region: 'Europe' },
  { city: 'Manchester', countryCode: 'GB', region: 'Europe' },
  { city: 'Berlin', countryCode: 'DE', region: 'Europe' },
  { city: 'Munich', countryCode: 'DE', region: 'Europe' },
  { city: 'Frankfurt', countryCode: 'DE', region: 'Europe' },
  { city: 'Paris', countryCode: 'FR', region: 'Europe' },
  { city: 'Lyon', countryCode: 'FR', region: 'Europe' },
  { city: 'Amsterdam', countryCode: 'NL', region: 'Europe' },
  { city: 'Rotterdam', countryCode: 'NL', region: 'Europe' },
  { city: 'Zurich', countryCode: 'CH', region: 'Europe' },
  { city: 'Geneva', countryCode: 'CH', region: 'Europe' },
  { city: 'Stockholm', countryCode: 'SE', region: 'Europe' },
  { city: 'Dublin', countryCode: 'IE', region: 'Europe' },
  { city: 'Milan', countryCode: 'IT', region: 'Europe' },
  { city: 'Rome', countryCode: 'IT', region: 'Europe' },
  { city: 'Madrid', countryCode: 'ES', region: 'Europe' },
  { city: 'Barcelona', countryCode: 'ES', region: 'Europe' },
  { city: 'Warsaw', countryCode: 'PL', region: 'Europe' },
  { city: 'Copenhagen', countryCode: 'DK', region: 'Europe' },
  { city: 'Vienna', countryCode: 'AT', region: 'Europe' },

  // Asia-Pacific
  { city: 'Singapore', countryCode: 'SG', region: 'Asia-Pacific' },
  { city: 'Bengaluru', countryCode: 'IN', region: 'Asia-Pacific' },
  { city: 'Mumbai', countryCode: 'IN', region: 'Asia-Pacific' },
  { city: 'Delhi NCR', countryCode: 'IN', region: 'Asia-Pacific' },
  { city: 'Hyderabad', countryCode: 'IN', region: 'Asia-Pacific' },
  { city: 'Chennai', countryCode: 'IN', region: 'Asia-Pacific' },
  { city: 'Pune', countryCode: 'IN', region: 'Asia-Pacific' },
  { city: 'Tokyo', countryCode: 'JP', region: 'Asia-Pacific' },
  { city: 'Osaka', countryCode: 'JP', region: 'Asia-Pacific' },
  { city: 'Seoul', countryCode: 'KR', region: 'Asia-Pacific' },
  { city: 'Sydney', countryCode: 'AU', region: 'Asia-Pacific' },
  { city: 'Melbourne', countryCode: 'AU', region: 'Asia-Pacific' },
  { city: 'Dubai', countryCode: 'AE', region: 'Middle East' },
  { city: 'Abu Dhabi', countryCode: 'AE', region: 'Middle East' },
  { city: 'Riyadh', countryCode: 'SA', region: 'Middle East' },
  { city: 'Kuala Lumpur', countryCode: 'MY', region: 'Asia-Pacific' },
  { city: 'Jakarta', countryCode: 'ID', region: 'Asia-Pacific' },
  { city: 'Ho Chi Minh City', countryCode: 'VN', region: 'Asia-Pacific' },
  { city: 'Bangkok', countryCode: 'TH', region: 'Asia-Pacific' },
  { city: 'Taipei', countryCode: 'TW', region: 'Asia-Pacific' },

  // Latin America
  { city: 'São Paulo', countryCode: 'BR', region: 'Latin America' },
  { city: 'Rio de Janeiro', countryCode: 'BR', region: 'Latin America' },
  { city: 'Santiago', countryCode: 'CL', region: 'Latin America' },
  { city: 'Buenos Aires', countryCode: 'AR', region: 'Latin America' },
  { city: 'Bogotá', countryCode: 'CO', region: 'Latin America' },

  // Africa
  { city: 'Johannesburg', countryCode: 'ZA', region: 'Africa' },
  { city: 'Cape Town', countryCode: 'ZA', region: 'Africa' },
  { city: 'Nairobi', countryCode: 'KE', region: 'Africa' },
  { city: 'Lagos', countryCode: 'NG', region: 'Africa' },
  { city: 'Cairo', countryCode: 'EG', region: 'Africa' },
  { city: 'Casablanca', countryCode: 'MA', region: 'Africa' },
];

// Comprehensive Global Industries & Sub-industries
interface IndustryDef {
  industry: string;
  subIndustries: string[];
  intentOffering: string[];
  intentLookingFor: string[];
  expertiseTags: string[];
}

const INDUSTRIES: IndustryDef[] = [
  {
    industry: 'Enterprise Software & AI',
    subIndustries: ['AI & Machine Learning Orchestration', 'Cloud Architecture & SaaS', 'Big Data Analytics', 'Enterprise ERP Systems'],
    intentOffering: [
      'Enterprise LLM orchestration platforms with strict SOC2 Type II compliance.',
      'Autonomous B2B data workflow pipelines and private cloud deployment architectures.',
      'High-throughput vector search infrastructure and predictive intelligence APIs.',
    ],
    intentLookingFor: [
      'Strategic channel distributors for enterprise AI acceleration across APAC and EMEA.',
      'Tier-1 system integration partners with deep Fortune 500 footprint.',
      'Sovereign cloud compute providers with H100/A100 cluster availability.',
    ],
    expertiseTags: ['Enterprise AI', 'Cloud Architecture', 'Distributed Systems', 'Predictive Modeling', 'API Integration'],
  },
  {
    industry: 'FinTech & Digital Banking',
    subIndustries: ['Cross-Border Payments', 'B2B Liquidity & Treasury', 'RegTech & AML Compliance', 'Trade Finance Automation'],
    intentOffering: [
      'Multi-currency treasury clearing infrastructure spanning 48 fiat corridors.',
      'Real-time ISO 20022 payment settlement rail integration for wholesale trade.',
      'Automated KYC/AML regulatory compliance gateways with low-latency API.',
    ],
    intentLookingFor: [
      'Tier-1 commercial banks seeking automated FX settlement corridors in SEA.',
      'Cross-border trade finance consortia and licensed liquidity counterparties.',
      'Enterprise payment service providers expanding into Latin America.',
    ],
    expertiseTags: ['Treasury Management', 'Trade Finance', 'Cross-Border Payments', 'RegTech', 'Liquidity Pools'],
  },
  {
    industry: 'FMCG & Consumer Goods',
    subIndustries: ['Food & Beverage Manufacturing', 'Organic & Specialty Ingredients', 'Personal Care & Cosmetics', 'Retail Packaged Goods'],
    intentOffering: [
      'Direct factory access to 180+ SKUs of organic beverage and certified nutrition goods.',
      'High-capacity aseptic packaging lines with certified HACCP/ISO-22000 standards.',
      'Tier-1 shelf space distribution into 4,000+ modern supermarket outlets.',
    ],
    intentLookingFor: [
      'Certified sustainable tea, coffee, and botanical ingredient producers in Asia.',
      'Regional cold-chain logistics operators with temperature-monitored warehousing.',
      'Contract manufacturing facilities with kosher, halal, and organic certifications.',
    ],
    expertiseTags: ['FMCG Sourcing', 'HACCP Compliance', 'Supply Chain Management', 'Private Labeling', 'Category Management'],
  },
  {
    industry: 'Supply Chain & Logistics',
    subIndustries: ['Cold-Chain Logistics', 'Maritime Freight & Port Operations', 'Air Cargo Freight', 'Intermodal Distribution'],
    intentOffering: [
      'End-to-end refrigerated cold-chain networks spanning 14 maritime hubs.',
      'Automated bonded warehousing with real-time IoT customs clearance tracking.',
      'Charter air cargo capacity on primary trans-Pacific and Eurasian corridors.',
    ],
    intentLookingFor: [
      'Long-term 3PL contracts with multinational pharmaceutical and FMCG exporters.',
      'Smart warehouse automation vendors and autonomous guided vehicle (AGV) suppliers.',
      'Last-mile fulfillment networks in high-density metropolitan zones.',
    ],
    expertiseTags: ['Cold-Chain Logistics', 'Freight Forwarding', 'Customs Brokerage', 'Intermodal Freight', 'Fleet Optimization'],
  },
  {
    industry: 'Renewable Energy & CleanTech',
    subIndustries: ['Solar PV & Utility Storage', 'Offshore Wind Generation', 'Hydrogen Fuel Cells', 'Grid Modernization'],
    intentOffering: [
      'Utility-scale BESS (Battery Energy Storage Systems) with 4-hour discharge capacity.',
      'Commercial rooftop solar turnkey PPA contracts with zero upfront capital.',
      'Green hydrogen electrolysis modules engineered for industrial decarbonization.',
    ],
    intentLookingFor: [
      'Long-term Power Purchase Agreement (PPA) off-takers across industrial manufacturing.',
      'High-purity silicon and rare-earth magnet suppliers for wind turbine assemblies.',
      'Infrastructure funds co-financing 250MW grid-scale storage facilities.',
    ],
    expertiseTags: ['Energy Storage', 'Solar Engineering', 'PPA Structuring', 'Decarbonization', 'Smart Grids'],
  },
  {
    industry: 'Healthcare & Life Sciences',
    subIndustries: ['Medical Device Manufacturing', 'Clinical Diagnostics', 'Biopharmaceuticals', 'Digital Health Platforms'],
    intentOffering: [
      'CE-marked & FDA-cleared surgical instrumentation and robotic endoscopy tools.',
      'Automated molecular diagnostic diagnostic panels with rapid turnaround.',
      'cGMP contract drug formulation and sterile injectable manufacturing capacity.',
    ],
    intentLookingFor: [
      'Hospital network procurement heads and regional medical distribution partners.',
      'Active pharmaceutical ingredient (API) suppliers with DMF filing support.',
      'Clinical trial research organizations (CROs) operating across Southeast Asia.',
    ],
    expertiseTags: ['Medical Devices', 'Clinical Trials', 'cGMP Manufacturing', 'Regulatory Compliance', 'HealthTech'],
  },
  {
    industry: 'Industrial Manufacturing',
    subIndustries: ['Precision CNC Machining', 'Industrial Robotics & Automation', 'Heavy Machinery', 'Additive Manufacturing (3D Printing)'],
    intentOffering: [
      'Micron-tolerance titanium and aerospace-grade aluminum CNC component fabrication.',
      'Autonomous robotic welding and palletizing workcells with turnkey integration.',
      'High-volume metal injection molding and precision stamping for automotive tiers.',
    ],
    intentLookingFor: [
      'Tier-1 automotive and aerospace OEMs seeking dual-source manufacturing.',
      'High-grade stainless steel and composite raw material stockists.',
      'Preventative predictive maintenance sensor vendors with edge inference.',
    ],
    expertiseTags: ['Precision Machining', 'Factory Automation', 'Robotics', 'Six Sigma', 'Lean Manufacturing'],
  },
  {
    industry: 'Semiconductors & Hardware',
    subIndustries: ['Fabless IC Design', 'Semiconductor Packaging & Testing (OSAT)', 'Optoelectronics & Sensors', 'Power Electronics (SiC/GaN)'],
    intentOffering: [
      'High-efficiency Silicon Carbide (SiC) MOSFET power modules for EV traction.',
      'Turnkey advanced packaging (flip-chip, wafer-level BGA) with high yield guarantee.',
      'Ultra-low-power RISC-V microcontroller architectures for industrial IoT nodes.',
    ],
    intentLookingFor: [
      'Automotive tier-1 powertrain manufacturers for qualification of SiC modules.',
      'Foundry capacity on 28nm and 16nm nodes for upcoming tape-outs.',
      'Specialty gas and ultra-pure chemical suppliers for fab testing cleanrooms.',
    ],
    expertiseTags: ['Semiconductors', 'IC Design', 'Silicon Carbide', 'OSAT Testing', 'Microarchitecture'],
  },
  {
    industry: 'Aerospace & Defense',
    subIndustries: ['Avionics & Flight Systems', 'Commercial Aerostructures', 'Satellite & Space Systems', 'Unmanned Aerial Systems (UAS)'],
    intentOffering: [
      'AS9100D certified composite winglets and cabin interior structure assemblies.',
      'Radiation-hardened satellite bus components and S-band transceivers.',
      'Autonomous heavy-lift cargo UAS for remote off-grid industrial transport.',
    ],
    intentLookingFor: [
      'Commercial airline maintenance, repair, and overhaul (MRO) facilities.',
      'Defense procurement agencies seeking tactical drone surveillance systems.',
      'Certified titanium aerospace fastener and hydraulic conduit distributors.',
    ],
    expertiseTags: ['Aerospace Engineering', 'AS9100D', 'Avionics', 'Satellite Systems', 'Composite Structures'],
  },
  {
    industry: 'Automotive & EV Systems',
    subIndustries: ['Electric Vehicle Powertrains', 'Battery Pack Manufacturing', 'Autonomous Vehicle Software', 'Charging Infrastructure'],
    intentOffering: [
      'Modular 800V EV battery packs with liquid thermal management and integrated BMS.',
      'High-power 350kW DC fast charging stations with dynamic grid load balancing.',
      'Automotive-grade LiDAR perception suites for Level 3 highway autonomy.',
    ],
    intentLookingFor: [
      'Commercial fleet operators electrifying municipal and distribution fleets.',
      'Direct lithium and nickel cathode raw material supply contracts.',
      'Municipal utility authorities for high-voltage grid interconnection permits.',
    ],
    expertiseTags: ['EV Powertrain', 'Battery Management', 'Fast Charging', 'Automotive Tier-1', 'Fleet Electrification'],
  },
  {
    industry: 'Chemicals & Advanced Materials',
    subIndustries: ['Specialty Polymers', 'Industrial Catalysts', 'High-Performance Coatings', 'Biomaterials'],
    intentOffering: [
      'Flame-retardant lightweight polymer composites for electronics housings.',
      'VOC-free anti-corrosion barrier coatings for maritime and offshore installations.',
      'Bio-derived biodegradable packaging resins with high moisture barrier.',
    ],
    intentLookingFor: [
      'Industrial manufacturers transitioning away from fluorochemicals and PFAS.',
      'Bulk bio-feedstock and agricultural waste chemical processing partners.',
      'Global ISO tank logistics operators for hazardous chemical transit.',
    ],
    expertiseTags: ['Specialty Chemicals', 'Polymer Science', 'Anti-Corrosion', 'Green Chemistry', 'Material Science'],
  },
  {
    industry: 'Construction & Real Estate',
    subIndustries: ['Commercial Real Estate Development', 'Modular Prefabricated Building', 'Civil Engineering', 'Smart Building Management'],
    intentOffering: [
      'Prefabricated structural steel modules reducing on-site construction timelines by 45%.',
      'LEED Platinum certified Class-A commercial office space across prime business districts.',
      'Smart building IoT management systems delivering 30% reduction in HVAC energy load.',
    ],
    intentLookingFor: [
      'General contractors for upcoming 400,000 sq ft logistics park developments.',
      'Green cement and low-carbon structural concrete suppliers.',
      'Institutional sovereign wealth funds seeking core-plus logistics assets.',
    ],
    expertiseTags: ['Commercial Real Estate', 'Modular Construction', 'Civil Engineering', 'LEED Certification', 'BIM Architecture'],
  },
  {
    industry: 'Telecommunications & Networks',
    subIndustries: ['5G Private Networks', 'Fiber Optic Infrastructure', 'Subsea Cable Systems', 'Satellite Broadband'],
    intentOffering: [
      'Turnkey private 5G mmWave networks engineered for automated seaport facilities.',
      'High-strand dark fiber backhaul routes connecting primary tier-3 hyperscale data centers.',
      'Carrier-neutral internet exchange peering with 100Gbps cross-connect ports.',
    ],
    intentLookingFor: [
      'Mining and heavy manufacturing enterprises modernizing remote site telemetry.',
      'Right-of-way municipal partners for regional fiber-to-the-business rollouts.',
      'Subsea cable landing station operators across the Indian Ocean rim.',
    ],
    expertiseTags: ['5G Infrastructure', 'Fiber Optics', 'Telecom Peering', 'Network Virtualization', 'Subsea Cables'],
  },
  {
    industry: 'Agriculture & AgriTech',
    subIndustries: ['Precision Farming & IoT', 'Sustainable Grain & Oilseeds', 'Indoor Vertical Farming', 'Aquaculture Systems'],
    intentOffering: [
      'Satellite-guided precision fertilization drones and soil sensor telemetry.',
      'Non-GMO verified bulk soybean, corn, and specialty wheat export supply.',
      'Controlled environment agriculture (CEA) vertical farming systems for urban centers.',
    ],
    intentLookingFor: [
      'Multinational food processing conglomerates with multi-year grain off-take agreements.',
      'Drip irrigation and climate automation equipment distributors.',
      'Cold-chain reefer vessel operators for fresh organic produce exports.',
    ],
    expertiseTags: ['Precision Agriculture', 'Grain Trading', 'Vertical Farming', 'Sustainable Agronomy', 'AgriTech'],
  },
  {
    industry: 'Mining, Metals & Minerals',
    subIndustries: ['Critical Battery Minerals', 'Green Steel & Iron Ore', 'Precious Metals Refining', 'Autonomous Mining Systems'],
    intentOffering: [
      'Direct mine supply of battery-grade lithium spodumene and nickel concentrate.',
      'Direct Reduced Iron (DRI) produced with green hydrogen for near-zero emission steel.',
      'Turnkey autonomous haulage fleet tele-operation systems for open-pit mines.',
    ],
    intentLookingFor: [
      'EV battery cell manufacturers securing long-term ESG-audited mineral off-takes.',
      'Automotive OEMs requiring low-carbon certified structural steel coil.',
      'Heavy mining equipment refurbishment and component fabrication contractors.',
    ],
    expertiseTags: ['Mineral Exploration', 'Green Steel', 'Lithium Sourcing', 'Autonomous Mining', 'ESG Compliance'],
  },
  {
    industry: 'Cybersecurity & Defense Tech',
    subIndustries: ['Critical Infrastructure Defense', 'Managed Detection & Response (MDR)', 'Identity & Zero Trust', 'Cloud Security Posture'],
    intentOffering: [
      'Zero-trust hardware security keys and air-gapped cryptographic enclave architecture.',
      '24/7 Managed Detection and Incident Response for OT/SCADA industrial plants.',
      'Automated penetration testing and cloud infrastructure posture compliance platform.',
    ],
    intentLookingFor: [
      'Enterprise CISOs and critical utility operators needing OT network protection.',
      'Defense prime contractors requiring CMMC Level 3 compliant security tooling.',
      'Global MSSP partners distributing managed identity threat response services.',
    ],
    expertiseTags: ['Cybersecurity', 'Zero Trust', 'SCADA / OT Defense', 'Incident Response', 'Cryptographic Hardware'],
  },
];

// Names for Decision Makers across Global Regions
const FIRST_NAMES = [
  'Alexander', 'Beatriz', 'Carlos', 'David', 'Elena', 'Farhan', 'Grace', 'Hassan',
  'Isabella', 'James', 'Kavita', 'Liam', 'Mei-Ling', 'Nathan', 'Oliver', 'Priya',
  'Qian', 'Rahul', 'Samantha', 'Tan', 'Umar', 'Vikram', 'Wei', 'Xiang',
  'Yasmin', 'Zack', 'Marcus', 'Nadia', 'Kenji', 'Fatima', 'Arjun', 'Sarah',
  'Dmitri', 'Anika', 'Mateo', 'Zara', 'Tariq', 'Sora', 'Aarav', 'Aditi',
  'Benjamin', 'Chloe', 'Deepa', 'Gabriel', 'Hannah', 'Ian', 'Julia', 'Klaus',
  'Lucia', 'Marco', 'Noor', 'Oscar', 'Penelope', 'Rafael', 'Sofia', 'Thomas',
];

const LAST_NAMES = [
  'Chen', 'Sharma', 'Tan', 'Rodriguez', 'Muller', 'Patel', 'Kim', 'Dubois',
  'Santos', 'Al-Mansoor', 'Yamamoto', 'Nair', 'Kowalski', 'Singh', 'Gupta', 'Menon',
  'Williams', 'Moreau', 'Suzuki', 'Le', 'Choi', 'Aziz', 'Bose', 'Park',
  'Hakim', 'Kumar', 'Smith', 'Davis', 'Das', 'Takahashi', 'Leroy', 'Lim',
  'Miller', 'Rao', 'Wong', 'Garcia', 'Chopra', 'Sato', 'Tran', 'Novak',
  'Andersson', 'Fischer', 'Johansson', 'Rossi', 'Schneider', 'Vargas', 'Silva', 'Bianchi',
];

// Corporate Name Roots
const CORP_PREFIXES = [
  'Apex', 'Zenith', 'Nexus', 'Vertex', 'Novus', 'Vanguard', 'Pinnacle', 'Horizon',
  'Aegis', 'Sovereign', 'Helix', 'Synergy', 'Orion', 'Titan', 'Beacon', 'Quantum',
  'Atlas', 'Meridian', 'Cobalt', 'Astral', 'Solaria', 'Terra', 'Pacifica', 'Elysium',
  'Hyperion', 'Starlight', 'Optima', 'Valence', 'Equinox', 'Aura', 'Global', 'Fortis',
  'Astra', 'Chronos', 'Aero', 'Vector', 'Intellix', 'Omni', 'Centurion', 'Axiom',
  'Boreal', 'Nordic', 'Caspian', 'Pacific', 'Atlantic', 'Indus', 'Danube', 'Alpine',
];

const CORP_ROOTS = [
  'Dynamics', 'Systems', 'Networks', 'Logistics', 'BioTech', 'Energy', 'Capital', 'Industries',
  'Technologies', 'Ventures', 'Robotics', 'Materials', 'Commerce', 'Solutions', 'Holdings', 'Labs',
  'Global', 'Partners', 'Alliances', 'Infrastructure', 'Maritime', 'Aerospace', 'Semiconductors', 'Pharma',
];

const CORP_SUFFIXES = ['Ltd', 'Inc', 'Corp', 'Group', 'AG', 'SE', 'Pte Ltd', 'Holdings', 'International'];

async function main() {
  console.log('========================================================================');
  console.log('🚀 STARTING DATABASE RESET & ENTERPRISE SCALE SEEDING (PROJECT SETU)');
  console.log('========================================================================\n');

  // 1. CLEAN COMPLETE DATABASE
  console.log('🧹 [1/6] Purging all existing database data via TRUNCATE CASCADE...');
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'project_setu'
  `;
  const tables = tablenames
    .map(({ tablename }) => `"project_setu"."${tablename}"`)
    .join(', ');
  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    console.log(`   ✔ Truncated ${tablenames.length} tables cleanly in schema "project_setu".`);
  }

  // Pre-calculate standard password hash ONCE
  console.log('\n🔒 [2/6] Generating default password hash (Password123!)...');
  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);
  console.log('   ✔ Password hash generated successfully.');

  // 2. SEED SUPER ADMINS
  console.log('\n👑 [3/6] Seeding Platform Super Admin accounts...');
  const superAdminId1 = randomUUID();
  const superAdminId2 = randomUUID();
  const superAdminProfileId1 = randomUUID();
  const superAdminProfileId2 = randomUUID();

  await prisma.user.createMany({
    data: [
      {
        id: superAdminId1,
        email: 'admin@vedasynk.local',
        emailNormalized: 'admin@vedasynk.local',
        passwordHash,
        accountStatus: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        authProvider: 'LOCAL',
        onboardingStep: 3,
        onboardingCompleted: true,
        linkedinVerified: true,
        workEmailVerified: true,
      },
      {
        id: superAdminId2,
        email: 'superadmin@projectsetu.com',
        emailNormalized: 'superadmin@projectsetu.com',
        passwordHash,
        accountStatus: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        authProvider: 'LOCAL',
        onboardingStep: 3,
        onboardingCompleted: true,
        linkedinVerified: true,
        workEmailVerified: true,
      },
    ],
  });

  await prisma.userRole.createMany({
    data: [
      { id: randomUUID(), userId: superAdminId1, role: RoleType.SUPER_ADMIN },
      { id: randomUUID(), userId: superAdminId1, role: RoleType.USER },
      { id: randomUUID(), userId: superAdminId2, role: RoleType.SUPER_ADMIN },
      { id: randomUUID(), userId: superAdminId2, role: RoleType.USER },
    ],
  });

  await prisma.professionalProfile.createMany({
    data: [
      {
        id: superAdminProfileId1,
        userId: superAdminId1,
        displayName: 'Setu Platform Administrator',
        headline: 'Chief Administrative Officer & Platform Governance',
        summary: 'Master administrative overseer managing system integrity, AI token quotas, and verification compliance across Project Setu.',
        currentTitle: 'Head of Platform Administration',
        function: 'Platform Operations',
        seniority: 'C-Level / Super Admin',
        industry: 'Enterprise Software & AI',
        city: 'Bengaluru',
        countryCode: 'IN',
        visibility: 'PUBLIC',
        verificationStatus: VerificationStatus.VERIFIED,
        completenessScore: 100,
        isSeedData: true,
      },
      {
        id: superAdminProfileId2,
        userId: superAdminId2,
        displayName: 'Global Super Admin',
        headline: 'Executive Dashboard Administrator & Governance Lead',
        summary: 'Executive dashboard administrator for Project Setu platform control, global audit logs, and compliance oversight.',
        currentTitle: 'Platform Super Admin',
        function: 'Executive Administration',
        seniority: 'C-Level / Super Admin',
        industry: 'Enterprise Software & AI',
        city: 'Singapore',
        countryCode: 'SG',
        visibility: 'PUBLIC',
        verificationStatus: VerificationStatus.VERIFIED,
        completenessScore: 100,
        isSeedData: true,
      },
    ],
  });
  console.log('   ✔ Super Admin accounts active: admin@vedasynk.local & superadmin@projectsetu.com');

  // 3. GENERATE 3,000 COMPANIES (2,400 PARENTS + 600 REGIONAL BRANCHES)
  console.log('\n🏢 [4/6] Procedurally generating 3,000 Global Companies across all industries & regions...');
  const TOTAL_COMPANIES = 3000;
  const TOTAL_BRANCHES = 600;
  const TOTAL_PARENTS = TOTAL_COMPANIES - TOTAL_BRANCHES; // 2400 Parents

  const companyRecords: any[] = [];
  const companyDomainRecords: any[] = [];
  const relationshipRecords: any[] = [];

  const parentCompanyIds: string[] = [];
  const usedDomains = new Set<string>();

  // A. Generate 2,400 Parent Companies
  for (let i = 0; i < TOTAL_PARENTS; i++) {
    const id = randomUUID();
    parentCompanyIds.push(id);

    const indDef = INDUSTRIES[i % INDUSTRIES.length];
    const subInd = indDef.subIndustries[i % indDef.subIndustries.length];
    const loc = GLOBAL_LOCATIONS[i % GLOBAL_LOCATIONS.length];

    const pfx = CORP_PREFIXES[i % CORP_PREFIXES.length];
    const root = CORP_ROOTS[(i * 3 + 7) % CORP_ROOTS.length];
    const sfx = CORP_SUFFIXES[i % CORP_SUFFIXES.length];

    const companyName = `${pfx} ${root} ${i + 1}`;
    const cleanSlug = `${pfx.toLowerCase()}-${root.toLowerCase()}-${i + 1}`;
    let domain = `${cleanSlug}.com`;
    let attempt = 1;
    while (usedDomains.has(domain)) {
      domain = `${cleanSlug}-${attempt}.com`;
      attempt++;
    }
    usedDomains.add(domain);

    companyRecords.push({
      id,
      name: `${pfx} ${root} ${sfx}`,
      normalizedName: companyName.toLowerCase(),
      legalName: `${pfx} ${root} Global ${sfx}`,
      domain,
      websiteUrl: `https://${domain}`,
      description: `Global enterprise leader in ${indDef.industry} (${subInd}), operating regional headquarters out of ${loc.city}, ${loc.countryCode}.`,
      companyType: 'Headquarters',
      industry: indDef.industry,
      subIndustry: subInd,
      headquartersCity: loc.city,
      headquartersCountry: loc.countryCode,
      isActive: true,
      intakeStatus: i % 5 === 0 ? 'RFP_ONLY' : 'OPEN',
      verificationStatus: VerificationStatus.VERIFIED,
      isSeedData: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    companyDomainRecords.push({
      id: randomUUID(),
      companyId: id,
      domain,
      isPrimary: true,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date(),
      createdAt: new Date(),
    });
  }

  // B. Generate 600 Branch Companies linked to Parents
  for (let b = 0; b < TOTAL_BRANCHES; b++) {
    const id = randomUUID();
    const parentId = parentCompanyIds[b % parentCompanyIds.length];
    const parentComp = companyRecords[b % parentCompanyIds.length];

    // Branch in a different strategic location
    const branchLoc = GLOBAL_LOCATIONS[(b * 7 + 13) % GLOBAL_LOCATIONS.length];
    const branchType = b % 3 === 0 ? 'REGIONAL_HQ' : b % 3 === 1 ? 'BRANCH' : 'SUBSIDIARY';
    const branchTypeLabel = branchType === 'REGIONAL_HQ' ? 'Regional HQ' : branchType === 'BRANCH' ? 'Branch' : 'Innovation Hub';

    const branchName = `${parentComp.name.replace(/ (Ltd|Inc|Corp|Group|AG|SE|Pte Ltd|Holdings|International)/g, '')} - ${branchLoc.city} ${branchTypeLabel}`;
    const branchSlug = `${parentComp.domain.replace('.com', '')}-${branchLoc.city.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    let domain = `${branchSlug}.com`;
    let attempt = 1;
    while (usedDomains.has(domain)) {
      domain = `${branchSlug}-${attempt}.com`;
      attempt++;
    }
    usedDomains.add(domain);

    companyRecords.push({
      id,
      name: branchName,
      normalizedName: branchName.toLowerCase(),
      legalName: `${branchName} Limited`,
      domain,
      websiteUrl: `https://${domain}`,
      description: `${branchTypeLabel} facility for ${parentComp.name}, coordinating market operations, regional trade, and corporate partnerships across ${branchLoc.region}.`,
      companyType: branchTypeLabel,
      industry: parentComp.industry,
      subIndustry: parentComp.subIndustry,
      headquartersCity: branchLoc.city,
      headquartersCountry: branchLoc.countryCode,
      isActive: true,
      intakeStatus: 'OPEN',
      verificationStatus: VerificationStatus.VERIFIED,
      isSeedData: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    companyDomainRecords.push({
      id: randomUUID(),
      companyId: id,
      domain,
      isPrimary: true,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date(),
      createdAt: new Date(),
    });

    // Link Branch to Parent
    relationshipRecords.push({
      id: randomUUID(),
      parentCompanyId: parentId,
      subsidiaryId: id,
      relationshipType: branchType,
      confidenceScore: 1.0,
      source: 'ADMIN_VERIFIED',
      effectiveDate: new Date(),
      createdAt: new Date(),
    });
  }

  // Insert Companies in batches
  console.log(`   ⏳ Writing ${companyRecords.length} companies to PostgreSQL in batches...`);
  for (const chunk of chunkArray(companyRecords, 500)) {
    await prisma.company.createMany({ data: chunk });
  }
  console.log('   ✔ All 3,000 companies inserted.');

  // Insert Company Domains
  console.log(`   ⏳ Writing ${companyDomainRecords.length} company domains...`);
  for (const chunk of chunkArray(companyDomainRecords, 1000)) {
    await prisma.companyDomain.createMany({ data: chunk });
  }

  // Insert Company Relationships (Branches)
  console.log(`   ⏳ Writing ${relationshipRecords.length} branch relationships...`);
  for (const chunk of chunkArray(relationshipRecords, 500)) {
    await prisma.companyRelationship.createMany({ data: chunk });
  }
  console.log(`   ✔ 600 Branch relationships established with parent corporations.`);

  // 4. GENERATE 4 DECISION MAKERS PER COMPANY (TOTAL 12,000 USERS)
  console.log('\n👥 [5/6] Generating 4 Decision Makers for each company (Total: 12,000 Executives)...');

  const userRecords: any[] = [];
  const userRoleRecords: any[] = [];
  const profileRecords: any[] = [];
  const membershipRecords: any[] = [];
  const experienceRecords: any[] = [];
  const expertiseRecords: any[] = [];
  const intentRecords: any[] = [];

  const sampleLoginCredentials: Array<{
    company: string;
    industry: string;
    location: string;
    name: string;
    title: string;
    email: string;
    role: string;
  }> = [];

  // Decision Maker Profiles
  const ROLES_TEMPLATE = [
    {
      titlePrefix: 'Chief Executive Officer & Managing Director',
      dept: 'Executive',
      companyRole: CompanyRole.OWNER,
      userRoles: [RoleType.COMPANY_ADMIN, RoleType.USER],
      seniority: 'C-Level / Founder',
      functionStr: 'Executive Management',
    },
    {
      titlePrefix: 'VP of Global Strategic Sourcing & Partnerships',
      dept: 'Procurement',
      companyRole: CompanyRole.ADMIN,
      userRoles: [RoleType.COMPANY_ADMIN, RoleType.USER],
      seniority: 'VP / Executive',
      functionStr: 'Sourcing & Supply Chain',
    },
    {
      titlePrefix: 'Director of Commercial Alliances & Business Development',
      dept: 'Business Development',
      companyRole: CompanyRole.MEMBER,
      userRoles: [RoleType.USER],
      seniority: 'Director',
      functionStr: 'Business Development',
    },
    {
      titlePrefix: 'Head of Vendor Relations & Technical Procurement',
      dept: 'Operations',
      companyRole: CompanyRole.MEMBER,
      userRoles: [RoleType.USER],
      seniority: 'Lead / Principal',
      functionStr: 'Procurement & Vendor Ops',
    },
  ];

  for (let c = 0; c < companyRecords.length; c++) {
    const comp = companyRecords[c];
    const indDef = INDUSTRIES.find((i) => i.industry === comp.industry) || INDUSTRIES[0];

    for (let m = 0; m < 4; m++) {
      const template = ROLES_TEMPLATE[m];
      const userId = randomUUID();
      const profileId = randomUUID();

      const firstName = FIRST_NAMES[(c * 4 + m * 7) % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(c * 3 + m * 11) % LAST_NAMES.length];
      const displayName = `${firstName} ${lastName}`;

      const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      const email = `${emailPrefix}@${comp.domain}`;
      const emailNormalized = email.toLowerCase();

      // Save sample accounts for user testing (5 distinct diverse companies)
      if (m === 0 && sampleLoginCredentials.length < 5 && c % 600 === 0) {
        sampleLoginCredentials.push({
          company: comp.name,
          industry: comp.industry,
          location: `${comp.headquartersCity}, ${comp.headquartersCountry}`,
          name: displayName,
          title: template.titlePrefix,
          email,
          role: 'Company Admin / Owner',
        });
      }

      userRecords.push({
        id: userId,
        email,
        emailNormalized,
        passwordHash,
        accountStatus: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        authProvider: 'LOCAL',
        onboardingStep: 3,
        onboardingCompleted: true,
        linkedinVerified: true,
        workEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (const r of template.userRoles) {
        userRoleRecords.push({
          id: randomUUID(),
          userId,
          role: r,
          createdAt: new Date(),
        });
      }

      profileRecords.push({
        id: profileId,
        userId,
        displayName,
        headline: `${template.titlePrefix} at ${comp.name}`,
        summary: `Seasoned decision maker leading ${template.functionStr} for ${comp.name} across global commercial corridors. Specialized in cross-border partnerships, vendor audits, and strategic contract execution.`,
        currentCompanyId: comp.id,
        currentTitle: template.titlePrefix,
        function: template.functionStr,
        seniority: template.seniority,
        industry: comp.industry,
        city: comp.headquartersCity,
        countryCode: comp.headquartersCountry,
        visibility: 'PUBLIC',
        verificationStatus: VerificationStatus.VERIFIED,
        completenessScore: 92,
        isSeedData: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      membershipRecords.push({
        id: randomUUID(),
        companyId: comp.id,
        userId,
        department: template.dept,
        companyRole: template.companyRole,
        membershipStatus: MembershipStatus.ACTIVE,
        maxOpenBridges: 25,
        joinedAt: new Date(),
        updatedAt: new Date(),
      });

      experienceRecords.push({
        id: randomUUID(),
        professionalProfileId: profileId,
        companyName: comp.name,
        title: template.titlePrefix,
        function: template.functionStr,
        isCurrent: true,
        startDate: new Date('2021-03-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Add Intent (Offering & Looking For)
      intentRecords.push({
        id: randomUUID(),
        professionalProfileId: profileId,
        intentType: 'OFFERING',
        description: indDef.intentOffering[m % indDef.intentOffering.length],
        createdAt: new Date(),
      });

      intentRecords.push({
        id: randomUUID(),
        professionalProfileId: profileId,
        intentType: 'LOOKING_FOR',
        description: indDef.intentLookingFor[m % indDef.intentLookingFor.length],
        createdAt: new Date(),
      });

      // Add Expertise Tags
      for (const tag of indDef.expertiseTags.slice(0, 3)) {
        expertiseRecords.push({
          id: randomUUID(),
          professionalProfileId: profileId,
          term: tag,
          normalizedTerm: tag.toLowerCase(),
          createdAt: new Date(),
        });
      }
    }
  }

  // Batch insert Users
  console.log(`   ⏳ Inserting ${userRecords.length} users into PostgreSQL in batches...`);
  for (const chunk of chunkArray(userRecords, 1000)) {
    await prisma.user.createMany({ data: chunk });
  }

  // Batch insert User Roles
  console.log(`   ⏳ Inserting ${userRoleRecords.length} user roles...`);
  for (const chunk of chunkArray(userRoleRecords, 2000)) {
    await prisma.userRole.createMany({ data: chunk });
  }

  // Batch insert Profiles
  console.log(`   ⏳ Inserting ${profileRecords.length} professional profiles...`);
  for (const chunk of chunkArray(profileRecords, 1000)) {
    await prisma.professionalProfile.createMany({ data: chunk });
  }

  // Batch insert Memberships
  console.log(`   ⏳ Inserting ${membershipRecords.length} company memberships...`);
  for (const chunk of chunkArray(membershipRecords, 1000)) {
    await prisma.companyMembership.createMany({ data: chunk });
  }

  // Batch insert Experiences
  console.log(`   ⏳ Inserting ${experienceRecords.length} professional experiences...`);
  for (const chunk of chunkArray(experienceRecords, 1000)) {
    await prisma.professionalExperience.createMany({ data: chunk });
  }

  // Batch insert Expertise tags
  console.log(`   ⏳ Inserting ${expertiseRecords.length} expertise tags...`);
  for (const chunk of chunkArray(expertiseRecords, 2000)) {
    await prisma.professionalExpertise.createMany({ data: chunk });
  }

  // Batch insert Intents
  console.log(`   ⏳ Inserting ${intentRecords.length} strategic B2B intents...`);
  for (const chunk of chunkArray(intentRecords, 2000)) {
    await prisma.professionalIntent.createMany({ data: chunk });
  }

  console.log('\n========================================================================');
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================================================');
  console.log(`📊 Statistics Summary:`);
  console.log(`   • Companies Created:        ${companyRecords.length} (2,400 Headquarters + 600 Regional Branches)`);
  console.log(`   • Verified Domains:         ${companyDomainRecords.length}`);
  console.log(`   • Corporate Hierarchy Links: ${relationshipRecords.length}`);
  console.log(`   • Total Users:              ${userRecords.length + 2} (including 2 Platform Super Admins)`);
  console.log(`   • Decision Makers:          ${userRecords.length} (4 per company across Owner, VP, Director, Lead)`);
  console.log(`   • Active Memberships:       ${membershipRecords.length}`);
  console.log(`   • Professional Intents:     ${intentRecords.length}`);
  console.log(`   • Expertise Tags:           ${expertiseRecords.length}`);
  console.log('\n🔑 Platform Access Credentials:\n');
  console.log('👑 1. SETU PLATFORM SUPER ADMIN:');
  console.log('   Email:    admin@vedasynk.local (or superadmin@projectsetu.com)');
  console.log('   Password: Password123!');
  console.log('   Roles:    [SUPER_ADMIN, USER]');
  console.log('   Portal:   https://meshvi-1.onrender.com/admin/login or /admin/dashboard\n');

  console.log('🏢 2. SAMPLE 5 GLOBAL COMPANY ADMIN CREDENTIALS (PASSWORD: Password123!):');
  sampleLoginCredentials.forEach((cred, idx) => {
    console.log(`   [${idx + 1}] ${cred.company} (${cred.industry})`);
    console.log(`       Location: ${cred.location}`);
    console.log(`       Name:     ${cred.name} (${cred.title})`);
    console.log(`       Email:    ${cred.email}`);
    console.log(`       Password: Password123!`);
    console.log(`       Portal:   https://meshvi-1.onrender.com/company/login or /login`);
  });
  console.log('========================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
