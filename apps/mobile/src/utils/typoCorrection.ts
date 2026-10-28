export const B2B_TYPO_CORRECTIONS: Record<string, string> = {
  // Prepositions & common typo slips
  fro: 'for',
  fo: 'for',
  fpr: 'for',
  fr: 'for',
  wit: 'with',
  wth: 'with',
  adn: 'and',
  nad: 'and',

  // Manufacturing & Industrial
  manfacturog: 'manufacturing',
  manfacturing: 'manufacturing',
  manfacutring: 'manufacturing',
  manufacuring: 'manufacturing',
  manfacturer: 'manufacturer',
  manufacuter: 'manufacturer',
  fabricatn: 'fabrication',
  industral: 'industrial',
  machinary: 'machinery',
  equpment: 'equipment',

  // Aviation, Airport, and Travel typos
  airpotrt: 'airport',
  airprot: 'airport',
  airprt: 'airport',
  aiport: 'airport',
  airpot: 'airport',
  arport: 'airport',
  airpoort: 'airport',
  airpport: 'airport',
  aeroport: 'airport',
  aerodrome: 'airport',
  aviaton: 'aviation',
  avation: 'aviation',
  avaiation: 'aviation',

  // Lounge & Concession typos
  longe: 'lounge',
  luonge: 'lounge',
  lounj: 'lounge',
  launge: 'lounge',
  loung: 'lounge',
  lounges: 'lounges',
  luonges: 'lounges',
  launges: 'lounges',
  concesion: 'concession',
  concessionaire: 'concessionaire',
  concesionaire: 'concessionaire',

  // Beverage, Food, Feed & FMCG
  bevrg: 'beverage',
  beverag: 'beverage',
  bevergs: 'beverages',
  bevarges: 'beverages',
  bevearge: 'beverage',
  bevearges: 'beverages',
  ingredent: 'ingredient',
  ingredents: 'ingredients',
  ingridients: 'ingredients',
  agri: 'agriculture',
  agriclture: 'agriculture',
  livestok: 'livestock',
  poltry: 'poultry',

  // Intent & Action typos
  seking: 'seeking',
  skeing: 'seeking',
  seeeking: 'seeking',
  seaking: 'seeking',
  loking: 'looking',
  lokking: 'looking',
  lookin: 'looking',
  serch: 'search',
  serchin: 'searching',
  seacrhing: 'searching',

  // Partnership & Alliances
  partnrship: 'partnership',
  partenship: 'partnership',
  partenrship: 'partnership',
  patnership: 'partnership',
  patnerships: 'partnerships',
  pratnership: 'partnership',
  partnershp: 'partnership',
  patner: 'partner',
  patners: 'partners',
  partenr: 'partner',
  partenrs: 'partners',

  // Procurement & Sourcing
  procurmenet: 'procurement',
  procurment: 'procurement',
  procur: 'procurement',
  procurer: 'procurement',
  procurring: 'procuring',
  sourcng: 'sourcing',
  purchesing: 'purchasing',
  suplier: 'supplier',
  supliers: 'suppliers',
  supllier: 'supplier',
  suppler: 'supplier',

  // Distribution & Logistics
  distributer: 'distributor',
  distributon: 'distribution',
  distribtion: 'distribution',
  distributr: 'distributor',
  distributers: 'distributors',
  suppy: 'supply',
  suplly: 'supply',
  chan: 'chain',
  chian: 'chain',
  logitics: 'logistics',
  logistcs: 'logistics',
  logisitcs: 'logistics',
  logisitic: 'logistics',
  packging: 'packaging',
  packagng: 'packaging',
  warehous: 'warehouse',
  coridor: 'corridor',
  coridoor: 'corridor',

  // Energy & Cleantech
  solor: 'solar',
  enrgy: 'energy',
  cleantch: 'cleantech',
  chemcials: 'chemicals',
  chemcal: 'chemical',

  // Corporate & Executive
  oprortunity: 'opportunity',
  oppurtunity: 'opportunity',
  oppertunity: 'opportunity',
  decison: 'decision',
  decisonmaker: 'decision maker',
  comapny: 'company',
  comapnies: 'companies',
  compnay: 'company',
  compnaies: 'companies',
  eneterprise: 'enterprise',
  leadre: 'leader',
  leadres: 'leaders',
  directore: 'director',
  directer: 'director',
  dircetor: 'director',
  direcor: 'director',
  manger: 'manager',
  mnaager: 'manager',
  managr: 'manager',
  executiv: 'executive',
  exective: 'executive',
  exceutive: 'executive',
  comercial: 'commercial',
  commerical: 'commercial',
  commercal: 'commercial',
  buisness: 'business',
  bussiness: 'business',
  busines: 'business',
  bizness: 'business',
  contrat: 'contract',
  cotnract: 'contract',
  contrct: 'contract',
  hosptality: 'hospitality',
  hospitallity: 'hospitality',
  retial: 'retail',
  retal: 'retail',
  retaill: 'retail',

  // Grammatical typos
  shsoud: 'should',
  corretev: 'correct',
  corect: 'correct',
  tehre: 'there',
  swlel: 'well',
  wlel: 'well',
  thsi: 'this',
};

export const CANONICAL_B2B_VOCABULARY: string[] = [
  // Manufacturing & Industrial
  'manufacturing', 'manufacturer', 'manufacturers', 'production', 'factory', 'fabrication', 'assembly', 'industrial', 'machinery', 'equipment', 'tooling', 'processing',
  // Food, Feed & Agriculture
  'food', 'feed', 'agriculture', 'agricultural', 'farming', 'livestock', 'poultry', 'dairy', 'beverage', 'beverages', 'ingredient', 'ingredients', 'organic', 'spices', 'grains', 'crops', 'horticulture', 'agro', 'fertilizer', 'cattle', 'aquaculture',
  // Logistics & Supply Chain
  'logistics', 'logistic', 'supply', 'chain', 'warehouse', 'warehousing', 'storage', 'coldchain', 'freight', 'shipping', 'distribution', 'distributor', 'distributors', 'fulfillment', 'customs', 'transport', 'cargo', 'corridor', 'corridors',
  // Aviation, Aerospace & Travel
  'airport', 'airports', 'airline', 'airlines', 'aviation', 'aerospace', 'lounge', 'lounges', 'terminal', 'concession', 'concessionaire', 'retail', 'dutyfree', 'hospitality',
  // Technology & Software
  'software', 'technology', 'cloud', 'saas', 'platform', 'cybersecurity', 'artificial', 'intelligence', 'enterprise', 'infrastructure', 'developer', 'engineering', 'analytics', 'automation', 'telecom', 'semiconductor',
  // Healthcare & Life Sciences
  'pharmaceutical', 'pharma', 'biotech', 'healthcare', 'medical', 'devices', 'clinical', 'hospital', 'laboratory', 'diagnostic', 'formulation',
  // Energy & Materials
  'energy', 'renewable', 'solar', 'cleantech', 'wind', 'power', 'battery', 'chemicals', 'chemical', 'polymers', 'petrochemical', 'minerals', 'metals', 'steel',
  // Retail, Consumer & Packaging
  'fmcg', 'consumer', 'goods', 'apparel', 'garments', 'textile', 'textiles', 'packaging', 'ecommerce', 'wholesale',
  // Commercial, Contracting & Partnerships
  'partnership', 'partnerships', 'partner', 'partners', 'procurement', 'procuring', 'sourcing', 'purchasing', 'buyer', 'buyers', 'supplier', 'suppliers', 'vendor', 'vendors', 'contract', 'contracts', 'tender', 'tenders', 'bids', 'alliance', 'alliances', 'commercial', 'business', 'development', 'corporate',
  // Executive Roles
  'director', 'directors', 'manager', 'managers', 'executive', 'executives', 'officer', 'head', 'lead', 'president', 'founder', 'ceo', 'cfo', 'coo', 'cto', 'cpo', 'managing',
  // Prepositions & Connectors
  'and', 'for', 'from', 'with', 'into', 'about', 'across', 'seeking', 'looking', 'between', 'global', 'regional'
];

export function damerauLevenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > 3) return 99;
  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }
  return matrix[al][bl];
}

export function autoCorrectB2BWord(rawWord: string): { corrected: string; wasCorrected: boolean } {
  const clean = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean || clean.length < 2) return { corrected: rawWord, wasCorrected: false };

  // 1. Direct dictionary lookup
  if (B2B_TYPO_CORRECTIONS[clean]) {
    return { corrected: B2B_TYPO_CORRECTIONS[clean], wasCorrected: true };
  }

  // If already canonical, keep as-is
  if (CANONICAL_B2B_VOCABULARY.includes(clean)) {
    return { corrected: clean, wasCorrected: false };
  }

  // 2. Fuzzy Damerau-Levenshtein distance matching
  let bestMatch: string | null = null;
  let minDistance = 99;

  for (const target of CANONICAL_B2B_VOCABULARY) {
    const dist = damerauLevenshteinDistance(clean, target);
    const maxAllowedDist = clean.length <= 3 ? 1 : clean.length <= 6 ? 1 : clean.length <= 9 ? 2 : 3;
    if (dist <= maxAllowedDist && dist < minDistance) {
      minDistance = dist;
      bestMatch = target;
    }
  }

  if (bestMatch && minDistance <= 3) {
    return { corrected: bestMatch, wasCorrected: true };
  }

  return { corrected: rawWord, wasCorrected: false };
}

export function autoCorrectQuery(query: string): { hasCorrection: boolean; originalQuery: string; correctedQuery: string } {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { hasCorrection: false, originalQuery: trimmed, correctedQuery: trimmed };
  }
  const rawWords = trimmed.split(/\s+/).filter(Boolean);
  let changed = false;
  const correctedTokens = rawWords.map((w) => {
    const { corrected, wasCorrected } = autoCorrectB2BWord(w);
    if (wasCorrected && corrected.toLowerCase() !== w.toLowerCase()) {
      changed = true;
      return corrected;
    }
    return w;
  });
  return {
    hasCorrection: changed,
    originalQuery: trimmed,
    correctedQuery: correctedTokens.join(' '),
  };
}
