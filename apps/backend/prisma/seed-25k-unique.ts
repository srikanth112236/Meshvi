import { PrismaClient, VerificationStatus } from '@prisma/client';
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

// 120+ First Names
const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Advait', 'Akash', 'Amara', 'Amit', 'Ananya', 'Anil', 'Anita', 'Ansh',
  'Arjun', 'Arun', 'Asha', 'Ashwin', 'Avani', 'Bhavna', 'Chetan', 'Deepak', 'Devi', 'Dhruv',
  'Divya', 'Gaurav', 'Geeta', 'Harish', 'Isha', 'Ishaan', 'Jaya', 'Kabir', 'Kalyani', 'Karan',
  'Kavita', 'Kiran', 'Krishna', 'Lakshmi', 'Madhav', 'Manish', 'Maya', 'Meera', 'Mohan', 'Mukesh',
  'Naveen', 'Neha', 'Nikhil', 'Nisha', 'Nitin', 'Pallavi', 'Pooja', 'Pranav', 'Prashant', 'Priya',
  'Rahul', 'Rajesh', 'Rakesh', 'Ram', 'Ramesh', 'Rashmi', 'Ravi', 'Rhea', 'Rishi', 'Rohan',
  'Rohit', 'Sachin', 'Sameer', 'Sandhya', 'Sanjay', 'Santosh', 'Sarita', 'Satish', 'Shalini', 'Shankar',
  'Shashi', 'Shikha', 'Shiv', 'Shreya', 'Shruti', 'Siddharth', 'Sneha', 'Sonal', 'Srinivas', 'Subhash',
  'Sujata', 'Sunil', 'Suresh', 'Swati', 'Tanvi', 'Tarun', 'Uma', 'Varun', 'Venkatesh', 'Vidya',
  'Vijay', 'Vikas', 'Vikram', 'Vinay', 'Vineet', 'Vipul', 'Vishal', 'Vivek', 'Yash', 'Zoya',
  'Wei', 'Chen', 'Hui', 'Jian', 'Min', 'Lei', 'Yan', 'Bo', 'Tao', 'Xin',
  'Kenji', 'Haruto', 'Yuto', 'Sota', 'Yuki', 'Ren', 'Kaito', 'Daiki', 'Hiroshi', 'Takumi',
  'Ahmad', 'Mohamed', 'Omar', 'Tariq', 'Zayn', 'Fatima', 'Noor', 'Layla', 'Mariam', 'Yasmin',
  'Marcus', 'Elena', 'Lucas', 'Sophie', 'Alexander', 'Chloe', 'Daniel', 'Emma', 'Liam', 'Olivia',
  'Sebastian', 'Isabella', 'Mateo', 'Camila', 'Gabriel', 'Valentina', 'Leo', 'Mia', 'Felix', 'Amelie',
];

// 120+ Surnames
const LAST_NAMES = [
  'Agarwal', 'Bansal', 'Bhat', 'Bhattacharya', 'Chakraborty', 'Chauhan', 'Chopra', 'Das', 'Deshmukh', 'Dhar',
  'Dutta', 'Gandhi', 'Garg', 'Ghosh', 'Goyal', 'Gupta', 'Hegde', 'Iyer', 'Jadhav', 'Jain',
  'Jha', 'Joshi', 'Kapoor', 'Kaur', 'Khan', 'Khanna', 'Kothari', 'Kulkarni', 'Kumar', 'Mahajan',
  'Malhotra', 'Mani', 'Mehta', 'Mishra', 'Mitra', 'Modi', 'Mukherjee', 'Nair', 'Naidu', 'Nambiar',
  'Narayan', 'Natarajan', 'Pandey', 'Patel', 'Patil', 'Pillai', 'Prasad', 'Puri', 'Radhakrishnan', 'Rao',
  'Reddy', 'Roy', 'Saha', 'Sarin', 'Sarma', 'Saxena', 'Sen', 'Sengupta', 'Seth', 'Shah',
  'Sharma', 'Shetty', 'Shinde', 'Shukla', 'Singh', 'Singhania', 'Sinha', 'Somani', 'Soni', 'Srinivasan',
  'Subramanian', 'Swaminathan', 'Talwar', 'Tandon', 'Thakur', 'Trivedi', 'Tyagi', 'Vaidya', 'Varma', 'Verma',
  'Vora', 'Walia', 'Yadav', 'Tan', 'Lim', 'Lee', 'Wong', 'Ng', 'Cheung', 'Chan',
  'Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato',
  'Al-Mansoor', 'Al-Hashimi', 'El-Masry', 'Al-Fassi', 'Al-Bahar', 'Al-Zaidi', 'Al-Sabah', 'Al-Nuaimi', 'Al-Kuwari', 'Al-Thani',
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schulz',
  'Dubois', 'Lambert', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor',
];

// Middle initials
const MIDDLE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Cities across key corridors
const LOCATIONS = [
  { city: 'Mumbai', country: 'IN', region: 'India West' },
  { city: 'Bengaluru', country: 'IN', region: 'India South' },
  { city: 'Delhi NCR', country: 'IN', region: 'India North' },
  { city: 'Hyderabad', country: 'IN', region: 'India South' },
  { city: 'Chennai', country: 'IN', region: 'India South' },
  { city: 'Pune', country: 'IN', region: 'India West' },
  { city: 'Ahmedabad', country: 'IN', region: 'India West' },
  { city: 'Kolkata', country: 'IN', region: 'India East' },
  { city: 'Somandapalli', country: 'IN', region: 'India South' },
  { city: 'Coimbatore', country: 'IN', region: 'India South' },
  { city: 'Jaipur', country: 'IN', region: 'India North' },
  { city: 'Vadodara', country: 'IN', region: 'India West' },
  { city: 'Singapore', country: 'SG', region: 'Southeast Asia' },
  { city: 'Kuala Lumpur', country: 'MY', region: 'Southeast Asia' },
  { city: 'Penang', country: 'MY', region: 'Southeast Asia' },
  { city: 'Dubai', country: 'AE', region: 'Middle East' },
  { city: 'Abu Dhabi', country: 'AE', region: 'Middle East' },
  { city: 'Tokyo', country: 'JP', region: 'East Asia' },
  { city: 'London', country: 'GB', region: 'Europe' },
  { city: 'Frankfurt', country: 'DE', region: 'Europe' },
  { city: 'Munich', country: 'DE', region: 'Europe' },
  { city: 'New York', country: 'US', region: 'North America' },
  { city: 'Chicago', country: 'US', region: 'North America' },
  { city: 'San Francisco', country: 'US', region: 'North America' },
  { city: 'Austin', country: 'US', region: 'North America' },
  { city: 'Sydney', country: 'AU', region: 'Oceania' },
];

// Corporate Titles
const CORPORATE_ROLES = [
  { title: 'Chief Executive Officer', function: 'Executive Management', seniority: 'C-Level' },
  { title: 'Chief Commercial Officer', function: 'Executive Management', seniority: 'C-Level' },
  { title: 'Chief Procurement Officer', function: 'Procurement', seniority: 'C-Level' },
  { title: 'Head of Global Sourcing', function: 'Procurement', seniority: 'Director / Head' },
  { title: 'VP of Supply Chain & Logistics', function: 'Supply Chain', seniority: 'VP' },
  { title: 'Director of Strategic Alliances', function: 'Partnerships', seniority: 'Director / Head' },
  { title: 'Head of Business Development', function: 'Sales', seniority: 'Director / Head' },
  { title: 'Senior Sourcing Manager', function: 'Procurement', seniority: 'Manager' },
  { title: 'Supply Chain Operations Lead', function: 'Supply Chain', seniority: 'Manager' },
  { title: 'Procurement Category Manager', function: 'Procurement', seniority: 'Manager' },
  { title: 'Commercial Partnerships Lead', function: 'Partnerships', seniority: 'Manager' },
  { title: 'Director of Vendor Management', function: 'Procurement', seniority: 'Director / Head' },
];

// Independent / Non-Corporate Roles (No company associated)
const INDEPENDENT_ROLES = [
  { title: 'Independent Sourcing Consultant', function: 'Procurement', seniority: 'Director / Head' },
  { title: 'Fractional Chief Procurement Officer', function: 'Procurement', seniority: 'C-Level' },
  { title: 'Cross-Border Trade Advisor', function: 'Partnerships', seniority: 'Director / Head' },
  { title: 'Supply Chain Strategy Consultant', function: 'Supply Chain', seniority: 'Director / Head' },
  { title: 'Independent B2B Growth Advisor', function: 'Sales', seniority: 'Director / Head' },
  { title: 'Manufacturing Sourcing Specialist', function: 'Procurement', seniority: 'Manager' },
  { title: 'Independent Commercial Arbiter & Negotiator', function: 'Executive Management', seniority: 'Director / Head' },
  { title: 'Cross-Border Logistics Specialist', function: 'Supply Chain', seniority: 'Manager' },
  { title: 'Independent Vendor Quality Auditor', function: 'Procurement', seniority: 'Director / Head' },
  { title: 'Bilateral Trade Corridor Consultant', function: 'Partnerships', seniority: 'Director / Head' },
  { title: 'Independent Renewable Energy Procurement Advisor', function: 'Procurement', seniority: 'Director / Head' },
  { title: 'Healthcare & Pharma Sourcing Specialist', function: 'Procurement', seniority: 'Manager' },
  { title: 'Independent Cloud & Software Sourcing Specialist', function: 'Procurement', seniority: 'Manager' },
  { title: 'Industrial Die-Casting & Machining Advisor', function: 'Procurement', seniority: 'Director / Head' },
  { title: 'Independent FMCG Distribution Consultant', function: 'Sales', seniority: 'Manager' },
];

const INDUSTRIES = [
  'Industrial Manufacturing',
  'Logistics & Supply Chain',
  'Automotive & EV Components',
  'FMCG & Consumer Goods',
  'Healthcare & Life Sciences',
  'Renewable Energy & CleanTech',
  'Enterprise Software & Cloud',
  'Electronics & Semiconductors',
  'Chemicals & Specialty Materials',
  'Agriculture & Food Processing',
];

async function seed25kUnique() {
  console.log('🚀 Starting 25,000 Unique Record Seeding Script...');

  // Fetch existing companies to link
  const existingCompanies = await prisma.company.findMany({
    select: { id: true, name: true, industry: true, headquartersCity: true, headquartersCountry: true },
    take: 15000,
  });

  console.log(`Found ${existingCompanies.length} existing companies in database.`);

  const TOTAL_TARGET = 25000;
  const INDEPENDENT_TARGET = 10000; // 10,000 unlinked independent professionals
  const LINKED_TARGET = 15000;      // 15,000 linked to companies

  // 1. Generate 25,000 Unique Names
  const usedNames = new Set<string>();

  // Fetch existing display names to prevent any collision with previous records
  const existingProfiles = await prisma.professionalProfile.findMany({
    select: { displayName: true },
    take: 100000,
  });
  for (const ep of existingProfiles) {
    if (ep.displayName) usedNames.add(ep.displayName.trim().toLowerCase());
  }

  console.log(`Existing names indexed in set: ${usedNames.size}. Generating 25,000 guaranteed new unique names...`);

  const uniqueDisplayNames: string[] = [];
  let nameIndex = 0;

  while (uniqueDisplayNames.length < TOTAL_TARGET) {
    const fIdx = nameIndex % FIRST_NAMES.length;
    const lIdx = Math.floor(nameIndex / FIRST_NAMES.length) % LAST_NAMES.length;
    const mIdx = Math.floor(nameIndex / (FIRST_NAMES.length * LAST_NAMES.length)) % MIDDLE_LETTERS.length;
    const cycle = Math.floor(nameIndex / (FIRST_NAMES.length * LAST_NAMES.length * MIDDLE_LETTERS.length));

    const fName = FIRST_NAMES[fIdx];
    const lName = LAST_NAMES[lIdx];
    const mInitial = MIDDLE_LETTERS[mIdx];

    let candidateName = '';
    if (cycle === 0) {
      candidateName = `${fName} ${lName}`;
    } else if (cycle === 1) {
      candidateName = `${fName} ${mInitial}. ${lName}`;
    } else {
      candidateName = `${fName} ${lName} (${mInitial}${cycle})`;
    }

    const key = candidateName.toLowerCase();
    if (!usedNames.has(key)) {
      usedNames.add(key);
      uniqueDisplayNames.push(candidateName);
    }
    nameIndex++;
  }

  console.log(`✅ Generated ${uniqueDisplayNames.length} 100% UNIQUE professional names!`);

  const profilesToInsert: any[] = [];
  const intentsToInsert: any[] = [];
  const expertiseToInsert: any[] = [];

  // 2. Generate 15,000 Corporate-Linked Decision Makers
  console.log(`\n🏢 Building ${LINKED_TARGET} Corporate-Linked Decision-Makers...`);
  for (let i = 0; i < LINKED_TARGET; i++) {
    const displayName = uniqueDisplayNames[i];
    const comp = existingCompanies.length > 0 ? existingCompanies[i % existingCompanies.length] : null;
    const role = CORPORATE_ROLES[i % CORPORATE_ROLES.length];
    const loc = LOCATIONS[i % LOCATIONS.length];
    const ind = comp?.industry || INDUSTRIES[i % INDUSTRIES.length];
    const city = comp?.headquartersCity || loc.city;
    const country = comp?.headquartersCountry || loc.country;
    const profileId = randomUUID();

    profilesToInsert.push({
      id: profileId,
      displayName,
      headline: `${role.title} at ${comp?.name || 'Enterprise'} | ${role.function}`,
      summary: `${role.title} leading ${role.function.toLowerCase()} and strategic commercial initiatives at ${comp?.name || 'Enterprise'} in ${city}, ${country}.`,
      currentCompanyId: comp?.id || null,
      currentTitle: role.title,
      function: role.function,
      seniority: role.seniority,
      industry: ind,
      city,
      countryCode: country,
      visibility: 'PUBLIC',
      verificationStatus: VerificationStatus.VERIFIED,
      isSeedData: true,
      completenessScore: 85 + (i % 15),
    });

    // Intent: 1 Offering + 1 Looking For
    intentsToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      intentType: 'OFFERING',
      description: `Bilateral commercial collaboration, supply contracts, and industrial partnerships in ${ind}.`,
    });

    intentsToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      intentType: 'LOOKING_FOR',
      description: `Direct sourcing partners, qualified manufacturers, and distribution channels across ${loc.region}.`,
    });

    expertiseToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      term: role.function,
      normalizedTerm: role.function.toLowerCase(),
    });
  }

  // 3. Generate 10,000 Independent Professionals (Not associated with any company)
  console.log(`\n👤 Building ${INDEPENDENT_TARGET} Independent Professionals (No Company Affiliation)...`);
  for (let i = 0; i < INDEPENDENT_TARGET; i++) {
    const displayName = uniqueDisplayNames[LINKED_TARGET + i];
    const role = INDEPENDENT_ROLES[i % INDEPENDENT_ROLES.length];
    const loc = LOCATIONS[(i + 7) % LOCATIONS.length];
    const ind = INDUSTRIES[i % INDUSTRIES.length];
    const profileId = randomUUID();

    profilesToInsert.push({
      id: profileId,
      displayName,
      headline: `${role.title} | ${ind}`,
      summary: `Independent professional and advisor providing specialized ${role.function.toLowerCase()} advisory, sourcing execution, and commercial facilitation in ${loc.city}, ${loc.country}. Open to business bridge connections and mandate representation.`,
      currentCompanyId: null, // Strictly NULL (Independent, not associated with company)
      currentTitle: role.title,
      function: role.function,
      seniority: role.seniority,
      industry: ind,
      city: loc.city,
      countryCode: loc.country,
      visibility: 'PUBLIC',
      verificationStatus: VerificationStatus.VERIFIED,
      isSeedData: true,
      completenessScore: 80 + (i % 20),
    });

    intentsToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      intentType: 'OFFERING',
      description: `Independent domain expertise, contract negotiation, and operational consulting for ${ind} in ${loc.region}.`,
    });

    intentsToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      intentType: 'LOOKING_FOR',
      description: `Commercial bridge introductions, cross-border sourcing inquiries, and enterprise consulting mandates.`,
    });

    expertiseToInsert.push({
      id: randomUUID(),
      professionalProfileId: profileId,
      term: role.function,
      normalizedTerm: role.function.toLowerCase(),
    });
  }

  // 4. Batch Insertion into Database
  console.log(`\n💾 Inserting ${profilesToInsert.length} profiles into database (chunks of 2,000)...`);
  const profileChunks = chunkArray(profilesToInsert, 2000);
  for (let p = 0; p < profileChunks.length; p++) {
    await prisma.professionalProfile.createMany({
      data: profileChunks[p],
      skipDuplicates: true,
    });
    console.log(`   ✓ Profile batch ${p + 1}/${profileChunks.length} inserted (${profileChunks[p].length} records)`);
  }

  console.log(`\n🎯 Inserting ${intentsToInsert.length} intents (chunks of 3,000)...`);
  const intentChunks = chunkArray(intentsToInsert, 3000);
  for (let t = 0; t < intentChunks.length; t++) {
    await prisma.professionalIntent.createMany({
      data: intentChunks[t],
      skipDuplicates: true,
    });
    console.log(`   ✓ Intent batch ${t + 1}/${intentChunks.length} inserted`);
  }

  console.log(`\n🏷️ Inserting ${expertiseToInsert.length} expertise tags (chunks of 3,000)...`);
  const expChunks = chunkArray(expertiseToInsert, 3000);
  for (let e = 0; e < expChunks.length; e++) {
    await prisma.professionalExpertise.createMany({
      data: expChunks[e],
      skipDuplicates: true,
    });
    console.log(`   ✓ Expertise batch ${e + 1}/${expChunks.length} inserted`);
  }

  console.log('\n======================================================');
  console.log(`🎉 SUCCESS: 25,000 UNIQUE RECORDS SEEDED!`);
  console.log(`- Total Unique Names Generated: ${uniqueDisplayNames.length}`);
  console.log(`- Corporate-Linked Decision Makers: ${LINKED_TARGET}`);
  console.log(`- Independent / Unlinked Professionals: ${INDEPENDENT_TARGET}`);
  console.log(`- Total Profiles in DB now verified.`);
  console.log('======================================================\n');
}

seed25kUnique()
  .catch((err) => {
    console.error('❌ Error during 25k seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
