import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

interface LocationInfo {
  city: string;
  country: string;
  region: string;
}

interface RoleInfo {
  title: string;
  func: string;
  seniority: string;
}

const FIRST_NAMES = [
  // Indian
  'Aarav', 'Priya', 'Vikram', 'Ananya', 'Rohan', 'Kavita', 'Aditya', 'Meera', 'Deepak', 'Tanvi',
  'Arjun', 'Ishaan', 'Shreya', 'Rahul', 'Neha', 'Varun', 'Pooja', 'Karan', 'Divya', 'Siddharth',
  'Sunita', 'Rajesh', 'Swati', 'Nikhil', 'Ritu', 'Sanjay', 'Sneha', 'Harish', 'Geeta', 'Alok',
  'Madhav', 'Bhavna', 'Gaurav', 'Manish', 'Pallavi', 'Pranav', 'Rakesh', 'Rashmi', 'Sachin', 'Subhash',
  // Australian
  'Liam', 'Lachlan', 'Chloe', 'Darcy', 'Matilda', 'Jack', 'Olivia', 'Noah', 'Harper', 'Cooper',
  'Isla', 'Flynn', 'Mia', 'Archie', 'Ruby', 'Harrison', 'Grace', 'Lucas', 'Zoe', 'Ethan',
  'Callum', 'Sienna', 'Mason', 'Freya', 'Angus', 'Charlotte', 'Bailey', 'Evie', 'Riley', 'Stella',
  // British
  'Oliver', 'Charlotte', 'George', 'Amelia', 'Harry', 'Arthur', 'Eleanor', 'Edward', 'Beatrice', 'William',
  'Florence', 'Charles', 'Alice', 'James', 'Poppy', 'Thomas', 'Henry', 'Evelyn', 'Alexander', 'Imogen',
  'Sebastian', 'Phoebe', 'Benjamin', 'Penelope', 'Oscar', 'Violet', 'Theo', 'Clara', 'Jasper', 'Rose',
  // American & Canadian
  'Marcus', 'Emily', 'Brandon', 'Jessica', 'Tyler', 'Samantha', 'Ryan', 'Rachel', 'Justin', 'Lauren',
  'Kevin', 'Megan', 'Derek', 'Kimberly', 'Scott', 'Amanda', 'Travis', 'Danielle', 'Nathan', 'Heather',
  // European (German, French, Swiss, Scandinavian, Italian, Spanish)
  'Maximilian', 'Camille', 'Julian', 'Greta', 'Matteo', 'Chiara', 'Florian', 'Astrid', 'Lars', 'Ingrid',
  'Carlos', 'Lucia', 'Antoine', 'Margaux', 'Felix', 'Celeste', 'Henrik', 'Elise', 'Etienne', 'Saskia',
  // East Asian & Middle Eastern
  'Kenji', 'Yuto', 'Hiroshi', 'Yuki', 'Wei', 'Chen', 'Ming', 'Hui', 'Tariq', 'Fatima',
  'Zayn', 'Noor', 'Omar', 'Mariam', 'Min-Jun', 'Soo-Jin', 'Takumi', 'Daiki', 'Al-Mansoor', 'Soraya',
];

const LAST_NAMES = [
  // Indian
  'Sharma', 'Patel', 'Malhotra', 'Iyer', 'Deshmukh', 'Reddy', 'Joshi', 'Nair', 'Verma', 'Rao',
  'Chatterjee', 'Singhania', 'Kulkarni', 'Mukherjee', 'Bhat', 'Hegde', 'Pillai', 'Saxena', 'Bansal', 'Agarwal',
  'Chauhan', 'Chopra', 'Gupta', 'Kapoor', 'Mehta', 'Mishra', 'Pandey', 'Puri', 'Sengupta', 'Thakur',
  // Australian
  "O'Connor", 'Campbell', 'Kelly', 'Wright', 'Stewart', 'Robertson', 'Mitchell', 'Taylor', 'Anderson', 'Clark',
  'Watson', 'Edwards', 'Hughes', 'Harrison', 'Murray', 'Ferguson', 'McDonald', 'Gibson', 'Morrison', 'Graham',
  // British
  'Davies', 'Evans', 'Bennett', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Scott', 'Green',
  'Baker', 'Adams', 'Carter', 'Phillips', 'Foster', 'Turner', 'Ward', 'Cox', 'Richardson', 'Fox',
  // American
  'Sterling', 'Vance', 'Miller', 'Davis', 'Wilson', 'Moore', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Barnes',
  // European
  'Schmidt', 'Weber', 'Dubois', 'Mueller', 'Schneider', 'Fischer', 'Meyer', 'Wagner', 'Becker', 'Hoffmann',
  'Laurent', 'Rossi', 'Bianchi', 'Johansson', 'Lindqvist', 'van Dijk', 'de Jong', 'Moreau', 'Fontaine', 'Vogel',
  // Asian & Middle Eastern
  'Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Al-Mansoor', 'Al-Nuaimi', 'Al-Hashimi', 'Zhang', 'Wang', 'Lin',
];

const LOCATIONS: LocationInfo[] = [
  // India (10 hubs)
  { city: 'Bengaluru', country: 'IN', region: 'Asia-South' },
  { city: 'Mumbai', country: 'IN', region: 'Asia-South' },
  { city: 'Delhi NCR', country: 'IN', region: 'Asia-South' },
  { city: 'Hyderabad', country: 'IN', region: 'Asia-South' },
  { city: 'Chennai', country: 'IN', region: 'Asia-South' },
  { city: 'Pune', country: 'IN', region: 'Asia-South' },
  { city: 'Ahmedabad', country: 'IN', region: 'Asia-South' },
  { city: 'Kolkata', country: 'IN', region: 'Asia-South' },
  { city: 'Coimbatore', country: 'IN', region: 'Asia-South' },
  { city: 'Jaipur', country: 'IN', region: 'Asia-South' },

  // Australia (6 hubs)
  { city: 'Sydney', country: 'AU', region: 'Oceania' },
  { city: 'Melbourne', country: 'AU', region: 'Oceania' },
  { city: 'Brisbane', country: 'AU', region: 'Oceania' },
  { city: 'Perth', country: 'AU', region: 'Oceania' },
  { city: 'Adelaide', country: 'AU', region: 'Oceania' },
  { city: 'Canberra', country: 'AU', region: 'Oceania' },

  // United Kingdom (7 hubs)
  { city: 'London', country: 'GB', region: 'Europe-West' },
  { city: 'Manchester', country: 'GB', region: 'Europe-West' },
  { city: 'Birmingham', country: 'GB', region: 'Europe-West' },
  { city: 'Edinburgh', country: 'GB', region: 'Europe-West' },
  { city: 'Bristol', country: 'GB', region: 'Europe-West' },
  { city: 'Leeds', country: 'GB', region: 'Europe-West' },
  { city: 'Cambridge', country: 'GB', region: 'Europe-West' },

  // United States & Canada (8 hubs)
  { city: 'San Francisco', country: 'US', region: 'North-America' },
  { city: 'New York', country: 'US', region: 'North-America' },
  { city: 'Austin', country: 'US', region: 'North-America' },
  { city: 'Seattle', country: 'US', region: 'North-America' },
  { city: 'Chicago', country: 'US', region: 'North-America' },
  { city: 'Boston', country: 'US', region: 'North-America' },
  { city: 'Toronto', country: 'CA', region: 'North-America' },
  { city: 'Vancouver', country: 'CA', region: 'North-America' },

  // Europe Continental (8 hubs)
  { city: 'Berlin', country: 'DE', region: 'Europe-Central' },
  { city: 'Munich', country: 'DE', region: 'Europe-Central' },
  { city: 'Frankfurt', country: 'DE', region: 'Europe-Central' },
  { city: 'Paris', country: 'FR', region: 'Europe-West' },
  { city: 'Zurich', country: 'CH', region: 'Europe-Central' },
  { city: 'Amsterdam', country: 'NL', region: 'Europe-West' },
  { city: 'Stockholm', country: 'SE', region: 'Europe-North' },
  { city: 'Dublin', country: 'IE', region: 'Europe-West' },

  // Asia-Pacific & Middle East (6 hubs)
  { city: 'Singapore', country: 'SG', region: 'Asia-Southeast' },
  { city: 'Tokyo', country: 'JP', region: 'Asia-East' },
  { city: 'Dubai', country: 'AE', region: 'Middle-East' },
  { city: 'Abu Dhabi', country: 'AE', region: 'Middle-East' },
  { city: 'Seoul', country: 'KR', region: 'Asia-East' },
  { city: 'Kuala Lumpur', country: 'MY', region: 'Asia-Southeast' },
];

const INDUSTRIES = [
  'Industrial Manufacturing',
  'Logistics, Freight & Supply Chain',
  'Renewable Energy & CleanTech',
  'Enterprise Software & AI',
  'Healthcare & Life Sciences',
  'Automotive & EV Systems',
  'FinTech & Corporate Banking',
  'Aerospace, Avionics & Defense',
  'Semiconductors & Microelectronics',
  'FMCG, Consumer Goods & Retail',
  'Real Estate, Infrastructure & EPC',
  'Agriculture, FoodTech & Cold Chain',
  'Cybersecurity & Critical Infrastructure',
  'Telecommunications & Cloud Networks',
];

const ROLES: RoleInfo[] = [
  { title: 'Chief Executive Officer', func: 'Executive Management', seniority: 'C-Level' },
  { title: 'Chief Technology Officer', func: 'Engineering & Technology', seniority: 'C-Level' },
  { title: 'Chief Procurement Officer', func: 'Procurement & Sourcing', seniority: 'C-Level' },
  { title: 'Chief Commercial Officer', func: 'Commercial & Sales', seniority: 'C-Level' },
  { title: 'Chief Operating Officer', func: 'Operations', seniority: 'C-Level' },
  { title: 'VP of Global Supply Chain', func: 'Supply Chain', seniority: 'VP' },
  { title: 'VP of Engineering', func: 'Engineering & Technology', seniority: 'VP' },
  { title: 'Director of Strategic Alliances', func: 'Strategic Partnerships', seniority: 'Director / Head' },
  { title: 'Director of International Sourcing', func: 'Procurement & Sourcing', seniority: 'Director / Head' },
  { title: 'Head of AI & Enterprise Automation', func: 'Engineering & Technology', seniority: 'Director / Head' },
  { title: 'Head of Business Development', func: 'Commercial & Sales', seniority: 'Director / Head' },
  { title: 'Director of Vendor Governance', func: 'Procurement & Sourcing', seniority: 'Director / Head' },
  { title: 'Senior Sourcing & Contracts Manager', func: 'Procurement & Sourcing', seniority: 'Manager' },
  { title: 'Global Logistics Operations Lead', func: 'Supply Chain', seniority: 'Manager' },
  { title: 'Principal Solutions Architect', func: 'Engineering & Technology', seniority: 'Manager' },
  { title: 'Commercial Contracts Arbiter', func: 'Commercial & Sales', seniority: 'Director / Head' },
  { title: 'Category Procurement Manager', func: 'Procurement & Sourcing', seniority: 'Manager' },
  { title: 'CleanTech Partnerships Lead', func: 'Strategic Partnerships', seniority: 'Manager' },
];

const COMPANY_PREFIXES = [
  'Tata', 'Adani', 'Infosys', 'Larsen & Toubro', 'Mahindra', 'Reliance', 'Wipro', 'Bhartiya', 'Godrej', 'HCL',
  'Atlassian', 'BHP', 'Rio Tinto', 'Telstra', 'Canva', 'Woodside', 'Macquarie', 'Fortescue', 'CSL', 'Brambles',
  'Dyson', 'Rolls-Royce', 'Barclays', 'Arm Holdings', 'AstraZeneca', 'Reckitt', 'BAE Systems', 'Unilever', 'Vodafone', 'Burberry',
  'Apex', 'Vanguard', 'Omni', 'Pinnacle', 'Starlight', 'Aero', 'Quantum', 'Terra', 'Veritas', 'Meridian',
  'Solaris', 'Helios', 'Crest', 'Summit', 'Zenith', 'Novus', 'Synergy', 'Valence', 'Orion', 'Cobalt',
];

const COMPANY_SUFFIXES = [
  'Technologies', 'Industries', 'Global Solutions', 'Aerospace & Systems', 'Energy & Power',
  'Supply Chain Network', 'Logistics Worldwide', 'Precision Engineering', 'Semiconductor Labs',
  'Advanced Materials', 'BioPharma Diagnostics', 'Enterprise Cloud', 'Robotics & Automation',
  'Digital Commerce', 'Infrastructure Partners', 'Capital & Trade', 'CleanTech Innovations',
];

const EXPERTISE_TAGS: Record<string, string[]> = {
  'Industrial Manufacturing': ['Precision CNC Machining', 'ISO 9001 Auditing', 'Die-Casting', 'Factory Automation', 'Tier-1 Sourcing'],
  'Logistics, Freight & Supply Chain': ['Cross-Border Freight', 'Cold Chain Compliance', 'Customs Clearance', 'Warehouse Automation', 'Route Optimization'],
  'Renewable Energy & CleanTech': ['Solar Photovoltaic EPC', 'Battery Energy Storage', 'Grid Interconnection', 'Wind Turbine Components', 'PPA Negotiations'],
  'Enterprise Software & AI': ['Large Language Models', 'Enterprise ERP Integration', 'SOC 2 Type II', 'Cloud Microservices', 'Autonomous Workflows'],
  'Healthcare & Life Sciences': ['GMP Certified Manufacturing', 'Pharma API Sourcing', 'Medical Device Class II', 'Cold Chain Pharma', 'FDA Regulatory Filing'],
  'Automotive & EV Systems': ['Lithium-Ion Battery Packs', 'Automotive CAN Bus', 'IATF 16949 Auditing', 'EV Powertrain', 'Tier-1 Auto Castings'],
  'FinTech & Corporate Banking': ['Cross-Border Escrow', 'Trade Finance Guarantees', 'SWIFT & ISO 20022', 'Commercial Bilateral Lending', 'AML/KYC Automation'],
  'Aerospace, Avionics & Defense': ['AS9100 Rev D Compliance', 'Titanium Forging', 'Avionics Flight Hardware', 'MIL-SPEC Fasteners', 'Defense Procurement'],
  'Semiconductors & Microelectronics': ['Wafer Fab Processing', 'ASIC Packaging', 'FPGA Prototyping', 'Supply Chain Redundancy', 'MEMS Sensors'],
  'FMCG, Consumer Goods & Retail': ['Omnichannel Distribution', 'Private Label Sourcing', 'Sustainable Packaging', 'FMCG Contract Packaging', 'Retail Vendor Terms'],
  'Real Estate, Infrastructure & EPC': ['Turnkey EPC Contracting', 'Structural Steel Fabrication', 'FIDIC Contracts', 'Prefabricated Modular Units', 'BIM Architecture'],
  'Agriculture, FoodTech & Cold Chain': ['Organic Bulk Grains', 'HACCP & BRC Food Safety', 'Refrigerated Intermodal', 'Agritech Yield Sensors', 'Commodity Trading'],
  'Cybersecurity & Critical Infrastructure': ['Zero Trust Network Architecture', 'SCADA & OT Security', 'Penetration Testing', 'NIST Framework', 'Threat Intelligence'],
  'Telecommunications & Cloud Networks': ['5G Private Networks', 'Subsea Fiber Capacity', 'Carrier Peering', 'Edge Compute Nodes', 'OpenRAN Architecture'],
};

export async function seed500DiverseMembers(prisma: PrismaClient) {
  console.log('🚀 Starting generation of 500 Diverse Global Members across India, Australia, UK & Worldwide...');

  const companiesToInsert: any[] = [];
  const profilesToInsert: any[] = [];
  const expertiseToInsert: any[] = [];
  const intentsToInsert: any[] = [];

  const usedNames = new Set<string>();
  const usedCompanies = new Set<string>();

  for (let i = 0; i < 500; i++) {
    // 1. Pick Name
    let firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    let lastName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    let fullName = `${firstName} ${lastName}`;

    if (usedNames.has(fullName)) {
      const middleInitial = String.fromCharCode(65 + (i % 26));
      fullName = `${firstName} ${middleInitial}. ${lastName}`;
    }
    usedNames.add(fullName);

    // 2. Pick Location
    const loc = LOCATIONS[i % LOCATIONS.length];

    // 3. Pick Industry & Role
    const industry = INDUSTRIES[i % INDUSTRIES.length];
    const role = ROLES[i % ROLES.length];

    // 4. Generate Unique Company Name
    const prefix = COMPANY_PREFIXES[i % COMPANY_PREFIXES.length];
    const suffix = COMPANY_SUFFIXES[Math.floor(i / COMPANY_PREFIXES.length) % COMPANY_SUFFIXES.length];
    let compName = `${prefix} ${suffix}`;
    if (usedCompanies.has(compName)) {
      compName = `${prefix} ${loc.city} ${suffix}`;
    }
    usedCompanies.add(compName);

    const compId = randomUUID();
    const profileId = randomUUID();
    const compSlug = compName.toLowerCase().replace(/[^a-z0-9]/g, '');

    companiesToInsert.push({
      id: compId,
      name: compName,
      normalizedName: compName.toLowerCase(),
      legalName: `${compName} Corp / Ltd`,
      domain: `${compSlug}.com`,
      websiteUrl: `https://${compSlug}.com`,
      description: `${compName} is a premier international enterprise specializing in ${industry}. Serving commercial partners across ${loc.region} and global trade corridors.`,
      companyType: i % 3 === 0 ? 'ENTERPRISE' : i % 3 === 1 ? 'MID_MARKET' : 'GROWTH_STAGE',
      industry,
      subIndustry: industry.split('&')[0].trim(),
      headquartersCity: loc.city,
      headquartersCountry: loc.country,
      isActive: true,
      intakeStatus: 'OPEN',
      verificationStatus: 'VERIFIED',
      autoReplyEnabled: true,
      autoReplySlaHours: 12,
      isSeedData: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    profilesToInsert.push({
      id: profileId,
      displayName: fullName,
      headline: `${role.title} at ${compName} | Overseeing ${industry} operations across ${loc.city}, ${loc.country}`,
      summary: `${fullName} is an experienced ${role.seniority} leader managing international engagements, vendor contracts, and strategic scale for ${compName}. Active across cross-border B2B business corridors.`,
      currentCompanyId: compId,
      currentTitle: role.title,
      function: role.func,
      seniority: role.seniority,
      industry,
      city: loc.city,
      countryCode: loc.country,
      visibility: 'PUBLIC',
      isActive: true,
      connectionAvailability: 'OPEN',
      proposalAccepting: true,
      verificationStatus: 'VERIFIED',
      isLinkedInVerified: true,
      isWorkEmailVerified: true,
      completenessScore: 95,
      isSeedData: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Expertise Tags (2-3 per profile)
    const availableTags = EXPERTISE_TAGS[industry] || ['Global Supply Chain', 'Vendor Negotiations', 'Executive Governance'];
    for (let t = 0; t < Math.min(3, availableTags.length); t++) {
      expertiseToInsert.push({
        id: randomUUID(),
        professionalProfileId: profileId,
        term: availableTags[t],
        normalizedTerm: availableTags[t].toLowerCase().trim(),
        createdAt: new Date(),
      });
    }

    // 6. Professional Intents (1 Offering, 1 Looking For)
    intentsToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      intentType: 'OFFERING',
      description: `Providing tier-1 solutions, certified supply agreements, and executive collaboration in ${industry} across ${loc.country}.`,
      createdAt: new Date(),
    });
    intentsToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      intentType: 'LOOKING_FOR',
      description: `Seeking verified bilateral suppliers, commercial joint ventures, and distribution networks in ${loc.region} and international markets.`,
      createdAt: new Date(),
    });
  }

  // Insert in chunks of 100 for maximum performance and stability
  const CHUNK_SIZE = 100;
  for (let c = 0; c < companiesToInsert.length; c += CHUNK_SIZE) {
    await (prisma as any).company.createMany({
      data: companiesToInsert.slice(c, c + CHUNK_SIZE),
      skipDuplicates: true,
    });
  }
  console.log(`✔ Inserted ${companiesToInsert.length} Global Companies.`);

  for (let p = 0; p < profilesToInsert.length; p += CHUNK_SIZE) {
    await (prisma as any).professionalProfile.createMany({
      data: profilesToInsert.slice(p, p + CHUNK_SIZE),
      skipDuplicates: true,
    });
  }
  console.log(`✔ Inserted ${profilesToInsert.length} Diverse Professional Profiles.`);

  for (let e = 0; e < expertiseToInsert.length; e += CHUNK_SIZE) {
    await (prisma as any).professionalExpertise.createMany({
      data: expertiseToInsert.slice(e, e + CHUNK_SIZE),
      skipDuplicates: true,
    });
  }
  console.log(`✔ Inserted ${expertiseToInsert.length} Professional Expertise Tags.`);

  for (let it = 0; it < intentsToInsert.length; it += CHUNK_SIZE) {
    await (prisma as any).professionalIntent.createMany({
      data: intentsToInsert.slice(it, it + CHUNK_SIZE),
      skipDuplicates: true,
    });
  }
  console.log(`✔ Inserted ${intentsToInsert.length} Professional Intents.`);

  console.log('🎉 500 Diverse Global Members successfully seeded!');
}
