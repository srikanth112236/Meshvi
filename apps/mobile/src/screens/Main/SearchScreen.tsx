import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  Share,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { apiRequest } from '../../services/api';
import { SearchCardSkeleton, SkeletonBox } from '../../components/SkeletonLoader';
import { getSavedProfiles, toggleSavedProfile, SavedProfileItem } from '../../services/savedProfilesStorage';
import { autoCorrectQuery } from '../../utils/typoCorrection';

const { width } = Dimensions.get('window');

export type SearchMode = 'DECISION_MAKERS' | 'ENTERPRISES' | 'TRADE_CORRIDORS' | 'OPPORTUNITY_GRAPH';
export type MatchTier = 'ALL' | 'BEST' | 'STRONG' | 'DIRECTORY';

export interface DecisionMakerItem {
  id: string;
  userId?: string;
  displayName: string;
  currentTitle: string;
  headline: string;
  companyName: string;
  corporateLineage?: string;
  function: string;
  seniority: string;
  industry: string;
  city: string;
  countryCode: string;
  flag: string;
  avatarUrl: string;
  verificationStatus: string;
  fitScore: number;
  matchTier: 'BEST' | 'STRONG' | 'DIRECTORY';
  seekingSummary: string;
  offeringSummary: string;
  whyConnectRationale: string;
  scoreExplanation: string;
  connectionStatus: 'NONE' | 'PENDING' | 'CONNECTED';
  email?: string;
  phoneNumber?: string;
}

export interface EnterpriseItem {
  id: string;
  name: string;
  legalName: string;
  domain: string;
  industry: string;
  subIndustry: string;
  headquartersCity: string;
  headquartersCountry: string;
  flag: string;
  companyType: string;
  decisionMakerCount: number;
  intakeStatus: string;
  verified: boolean;
  matchScore: number;
  matchExplanation: string;
  description?: string;
}

export interface TradeCorridorItem {
  id: string;
  originCountry: string;
  originCode: string;
  originFlag: string;
  destCountry: string;
  destCode: string;
  destFlag: string;
  sector: string;
  annualVolume: string;
  complianceAttestation: string;
  activeDealCount: number;
  bilateralSynergy: number;
  tier: 'BEST' | 'STRONG' | 'DIRECTORY';
}

export interface OpportunityGraphNode {
  id: string;
  companyName: string;
  flag: string;
  commercialGoal: string;
  fitScore: number;
  committee: Array<{ role: string; name: string; avatar: string; authority: string }>;
  warmRoute: string;
  complianceClearance: string;
}

// ============================================================================
// COMPREHENSIVE VERIFIED DIRECTORY SEED DATA
// ============================================================================
export const SEED_DECISION_MAKERS: DecisionMakerItem[] = [
  {
    id: 'dm-1',
    userId: 'usr-elena-01',
    displayName: 'Elena Rostova',
    currentTitle: 'Chief Commercial Officer & VP Alliances',
    headline: 'Chief Commercial Officer at Aura Logistics APAC',
    companyName: 'Aura Logistics APAC',
    corporateLineage: 'Parent: Aura Global Holdings AG (Zurich)',
    function: 'Commercial Partnerships',
    seniority: 'C-Level / Founder',
    industry: 'Logistics & Supply Chain',
    city: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    verificationStatus: 'VERIFIED',
    fitScore: 96,
    matchTier: 'BEST',
    seekingSummary: 'Cross-border B2B supply chain routing platform with direct enterprise buyer accounts.',
    offeringSummary: 'Exclusive bonded distribution channels in 8 APAC hubs with expedited customs clearance.',
    whyConnectRationale: 'Direct authority over $40M regional distribution contracts with immediate bilateral mandate alignment.',
    scoreExplanation: 'Score 96/100 based on functional authority, geographic nexus (Singapore), and zero conflict overlap.',
    connectionStatus: 'CONNECTED',
    email: 'elena.rostova@auralogistics.com',
    phoneNumber: '+65 6789 0123',
  },
  {
    id: 'dm-2',
    userId: 'usr-vikram-02',
    displayName: 'Vikram Sethi',
    currentTitle: 'VP Corporate Strategy & M&A',
    headline: 'VP Corporate Strategy & M&A at Vertex Nexus Global',
    companyName: 'Vertex Nexus Global',
    corporateLineage: 'HQ: Dubai International Financial Centre (DIFC)',
    function: 'Corporate Strategy & M&A',
    seniority: 'VP / Managing Director',
    industry: 'FinTech & Digital Banking',
    city: 'Dubai',
    countryCode: 'AE',
    flag: '🇦🇪',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    verificationStatus: 'VERIFIED',
    fitScore: 94,
    matchTier: 'BEST',
    seekingSummary: 'Tier-1 SOC-2 compliant cross-border enterprise settlement rails with high liquidity.',
    offeringSummary: '$50M deployment facility for corporate JV distribution infrastructure.',
    whyConnectRationale: 'Authorized budget allocator for corporate venture deals across GCC & South Asia corridors.',
    scoreExplanation: 'Score 94/100 for verified capital deployment facility and reciprocal Treasury match.',
    connectionStatus: 'NONE',
  },
  {
    id: 'dm-3',
    userId: 'usr-sarah-03',
    displayName: 'Sarah Jenkins',
    currentTitle: 'Head of Global Procurement',
    headline: 'Head of Global Procurement at Novus Retail Group',
    companyName: 'Novus Retail Group SE',
    corporateLineage: 'HQ: London, United Kingdom',
    function: 'Procurement & Sourcing',
    seniority: 'Director / Head of Dept',
    industry: 'FMCG & Consumer Goods',
    city: 'London',
    countryCode: 'GB',
    flag: '🇬🇧',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    verificationStatus: 'VERIFIED',
    fitScore: 89,
    matchTier: 'STRONG',
    seekingSummary: 'FMCG and organic beverage manufacturers with EU/UK Halal & ISO 22000 certifications.',
    offeringSummary: 'Direct shelf placement across 850 retail supermarket doors in Western Europe.',
    whyConnectRationale: 'Sourcing lead seeking immediate supplier onboarding for Q3 category review.',
    scoreExplanation: 'Score 89/100 matching FMCG food & beverage export requirements.',
    connectionStatus: 'NONE',
  },
  {
    id: 'dm-4',
    userId: 'usr-klaus-04',
    displayName: 'Dr. Klaus Becker',
    currentTitle: 'Director of Strategic Sourcing',
    headline: 'Director Strategic Sourcing at Rhine-Main Industrial SE',
    companyName: 'Rhine-Main Industrial SE',
    corporateLineage: 'HQ: Frankfurt, Germany',
    function: 'Procurement & Sourcing',
    seniority: 'Director / Head of Dept',
    industry: 'Industrial Manufacturing',
    city: 'Frankfurt',
    countryCode: 'DE',
    flag: '🇩🇪',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    verificationStatus: 'VERIFIED',
    fitScore: 88,
    matchTier: 'STRONG',
    seekingSummary: 'AS9100 certified precision CNC aluminum casting suppliers with verified ESG reporting.',
    offeringSummary: '$18M multi-year framework contracts for Tier-1 automotive and industrial robotics components.',
    whyConnectRationale: 'Key buyer actively reviewing India and ASEAN industrial supply accords.',
    scoreExplanation: 'Score 88/100 reflecting strict AS9100 compliance and precision manufacturing alignment.',
    connectionStatus: 'NONE',
  },
  {
    id: 'dm-5',
    userId: 'usr-hiroshi-05',
    displayName: 'Hiroshi Tanaka',
    currentTitle: 'EVP of Alliances & Global Platforms',
    headline: 'EVP Alliances & Platforms at Nippon Systems Consortium',
    companyName: 'Nippon Systems Consortium',
    corporateLineage: 'HQ: Marunouchi, Tokyo',
    function: 'AI & Technology',
    seniority: 'C-Level / Founder',
    industry: 'Enterprise Software & Cloud',
    city: 'Tokyo',
    countryCode: 'JP',
    flag: '🇯🇵',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    verificationStatus: 'VERIFIED',
    fitScore: 92,
    matchTier: 'BEST',
    seekingSummary: 'Zero-conflict enterprise AI middleware co-selling partners with direct Fortune 500 accounts.',
    offeringSummary: 'Proprietary AI middleware orchestration architecture with dedicated Tokyo localization engineering.',
    whyConnectRationale: 'Key decision maker for Japan and ASEAN enterprise software distribution partnerships.',
    scoreExplanation: 'Score 92/100 for reciprocal software co-selling mandate and verified node authorization.',
    connectionStatus: 'NONE',
  },
  {
    id: 'dm-6',
    userId: 'usr-priya-06',
    displayName: 'Priya Sharma',
    currentTitle: 'Head of Treasury & Trade Finance',
    headline: 'Head of Treasury at Bharat Global Corridors',
    companyName: 'Bharat Global Corridors Ltd',
    corporateLineage: 'HQ: Bandra-Kurla Complex, Mumbai',
    function: 'Finance & Treasury',
    seniority: 'Director / Head of Dept',
    industry: 'FinTech & Digital Banking',
    city: 'Mumbai',
    countryCode: 'IN',
    flag: '🇮🇳',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    verificationStatus: 'VERIFIED',
    fitScore: 78,
    matchTier: 'STRONG',
    seekingSummary: 'Letter-of-credit and factoring discount rails for bilateral cross-border merchandise export.',
    offeringSummary: 'Direct origination of $120M annual SME merchandise invoices for secondary liquidity purchase.',
    whyConnectRationale: 'Trade finance corridor manager connecting South Asia export flows with GCC liquidity.',
    scoreExplanation: 'Score 78/100 with high bilateral trade flow nexus.',
    connectionStatus: 'NONE',
  },
  {
    id: 'dm-7',
    userId: 'usr-david-07',
    displayName: 'David Miller',
    currentTitle: 'SVP Channel Operations',
    headline: 'SVP Channel Operations at Pacific Cloud Systems',
    companyName: 'Pacific Cloud Systems Inc',
    corporateLineage: 'HQ: San Francisco, United States',
    function: 'Commercial Sales & Channel',
    seniority: 'VP / Managing Director',
    industry: 'Enterprise Software & Cloud',
    city: 'San Francisco',
    countryCode: 'US',
    flag: '🇺🇸',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    verificationStatus: 'VERIFIED',
    fitScore: 68,
    matchTier: 'DIRECTORY',
    seekingSummary: 'Regional systems integrators in Southeast Asia for cloud data sovereignty deployments.',
    offeringSummary: '30% recurring margin software licensing and tier-1 vendor co-op marketing fund.',
    whyConnectRationale: 'Channel executive with active regional reseller program.',
    scoreExplanation: 'Score 68/100 matching general software distribution criteria.',
    connectionStatus: 'NONE',
  },
];

export const SEED_ENTERPRISES: EnterpriseItem[] = [
  {
    id: 'ent-1',
    name: 'Aura Logistics Global AG',
    legalName: 'Aura Logistics Global Corporation AG',
    domain: 'aura-logistics.com',
    industry: 'Logistics & Supply Chain',
    subIndustry: 'Cold-Chain & Bonded Warehousing',
    headquartersCity: 'Singapore',
    headquartersCountry: 'SG',
    flag: '🇸🇬',
    companyType: 'Regional Headquarters',
    decisionMakerCount: 8,
    intakeStatus: 'OPEN',
    verified: true,
    matchScore: 97,
    matchExplanation: 'Bilateral APAC bonded cold-chain warehouse routing across 8 regional hubs.',
  },
  {
    id: 'ent-2',
    name: 'Vertex Nexus Capital Holdings',
    legalName: 'Vertex Nexus Global Holdings DIFC Ltd',
    domain: 'vertex-nexus.com',
    industry: 'FinTech & Digital Banking',
    subIndustry: 'B2B Trade Liquidity & Treasury',
    headquartersCity: 'Dubai',
    headquartersCountry: 'AE',
    flag: '🇦🇪',
    companyType: 'Investment Holding',
    decisionMakerCount: 6,
    intakeStatus: 'OPEN',
    verified: true,
    matchScore: 94,
    matchExplanation: 'Direct institutional trade liquidity settlement match for enterprise corporate treasury.',
  },
  {
    id: 'ent-3',
    name: 'Novus Retail Group SE',
    legalName: 'Novus Retail International SE',
    domain: 'novus-retail.co.uk',
    industry: 'FMCG & Consumer Goods',
    subIndustry: 'Supermarket Channel Distribution',
    headquartersCity: 'London',
    headquartersCountry: 'GB',
    flag: '🇬🇧',
    companyType: 'Public Corporation',
    decisionMakerCount: 12,
    intakeStatus: 'RFP_ONLY',
    verified: true,
    matchScore: 89,
    matchExplanation: 'High-volume European supermarket shelf-space expansion mandate with bilateral terms.',
  },
  {
    id: 'ent-4',
    name: 'Rhine-Main Industrial SE',
    legalName: 'Rhine-Main Industrial Technologies SE',
    domain: 'rhine-main-industrial.de',
    industry: 'Industrial Manufacturing',
    subIndustry: 'Precision Machining & Robotics',
    headquartersCity: 'Frankfurt',
    headquartersCountry: 'DE',
    flag: '🇩🇪',
    companyType: 'Public Corporation',
    decisionMakerCount: 9,
    intakeStatus: 'OPEN',
    verified: true,
    matchScore: 91,
    matchExplanation: 'Precision robotics and automated tooling bilateral sourcing partnership.',
  },
  {
    id: 'ent-5',
    name: 'Nippon Systems Consortium',
    legalName: 'Nippon Systems Consortium Co., Ltd.',
    domain: 'nippon-systems.jp',
    industry: 'Enterprise Software & Cloud',
    subIndustry: 'AI & Machine Learning Orchestration',
    headquartersCity: 'Tokyo',
    headquartersCountry: 'JP',
    flag: '🇯🇵',
    companyType: 'Corporate Conglomerate',
    decisionMakerCount: 14,
    intakeStatus: 'OPEN',
    verified: true,
    matchScore: 95,
    matchExplanation: 'APAC Enterprise AI middleware distribution and co-selling platform agreement.',
  },
];

export const SEED_CORRIDORS: TradeCorridorItem[] = [
  {
    id: 'cor-1',
    originCountry: 'India',
    originCode: 'IN',
    originFlag: '🇮🇳',
    destCountry: 'Malaysia',
    destCode: 'MY',
    destFlag: '🇲🇾',
    sector: 'FMCG & Food Beverages',
    annualVolume: '$240M Bilateral Trade',
    complianceAttestation: 'Halal JAKIM & ESMA Certified',
    activeDealCount: 18,
    bilateralSynergy: 96,
    tier: 'BEST',
  },
  {
    id: 'cor-2',
    originCountry: 'Singapore',
    originCode: 'SG',
    originFlag: '🇸🇬',
    destCountry: 'United Arab Emirates',
    destCode: 'AE',
    destFlag: '🇦🇪',
    sector: 'Cold-Chain & Logistics Infrastructure',
    annualVolume: '$180M Bilateral Flow',
    complianceAttestation: 'SOC-2 Type II, ISO 27001, AEO Certified',
    activeDealCount: 14,
    bilateralSynergy: 95,
    tier: 'BEST',
  },
  {
    id: 'cor-3',
    originCountry: 'Japan',
    originCode: 'JP',
    originFlag: '🇯🇵',
    destCountry: 'Singapore',
    destCode: 'SG',
    destFlag: '🇸🇬',
    sector: 'Enterprise Cloud Software & Reseller Rights',
    annualVolume: '$110M Software Pipeline',
    complianceAttestation: 'APPI & GDPR Compliant',
    activeDealCount: 11,
    bilateralSynergy: 91,
    tier: 'BEST',
  },
  {
    id: 'cor-4',
    originCountry: 'India',
    originCode: 'IN',
    originFlag: '🇮🇳',
    destCountry: 'UAE / GCC',
    destCode: 'AE',
    destFlag: '🇦🇪',
    sector: 'Pharma & Clinical Healthcare Logistics',
    annualVolume: '$95M Medicine Flow',
    complianceAttestation: 'GDP & US-FDA Validated',
    activeDealCount: 8,
    bilateralSynergy: 84,
    tier: 'STRONG',
  },
  {
    id: 'cor-5',
    originCountry: 'Germany',
    originCode: 'DE',
    originFlag: '🇩🇪',
    destCountry: 'United States',
    destCode: 'US',
    destFlag: '🇺🇸',
    sector: 'Precision Industrial Tooling & Robotics',
    annualVolume: '$320M Sourcing Accord',
    complianceAttestation: 'AS9100D, NIST-800 Certified',
    activeDealCount: 22,
    bilateralSynergy: 89,
    tier: 'BEST',
  },
  {
    id: 'cor-6',
    originCountry: 'United Kingdom',
    originCode: 'GB',
    originFlag: '🇬🇧',
    destCountry: 'India',
    destCode: 'IN',
    destFlag: '🇮🇳',
    sector: 'FinTech Settlement & Open Banking Rails',
    annualVolume: '$410M Bilateral Flow',
    complianceAttestation: 'FCA & RBI Sandbox Regulated',
    activeDealCount: 25,
    bilateralSynergy: 93,
    tier: 'BEST',
  },
  {
    id: 'cor-7',
    originCountry: 'Singapore',
    originCode: 'SG',
    originFlag: '🇸🇬',
    destCountry: 'United States',
    destCode: 'US',
    destFlag: '🇺🇸',
    sector: 'Semiconductor & High-Tech Hardware Assembly',
    annualVolume: '$350M Supply Accord',
    complianceAttestation: 'ITAR & NIST Validated',
    activeDealCount: 29,
    bilateralSynergy: 90,
    tier: 'BEST',
  },
  {
    id: 'cor-8',
    originCountry: 'Japan',
    originCode: 'JP',
    originFlag: '🇯🇵',
    destCountry: 'Germany',
    destCode: 'DE',
    destFlag: '🇩🇪',
    sector: 'Industrial Robotics & Clean Energy Cells',
    annualVolume: '$280M Bilateral Route',
    complianceAttestation: 'CE & METI International Certified',
    activeDealCount: 16,
    bilateralSynergy: 92,
    tier: 'BEST',
  },
  {
    id: 'cor-9',
    originCountry: 'United States',
    originCode: 'US',
    originFlag: '🇺🇸',
    destCountry: 'United Arab Emirates',
    destCode: 'AE',
    destFlag: '🇦🇪',
    sector: 'AI Compute & Enterprise Cloud Hub',
    annualVolume: '$520M Cloud Infra',
    complianceAttestation: 'SOC-2 Type II, ISO 27001',
    activeDealCount: 31,
    bilateralSynergy: 97,
    tier: 'BEST',
  },
  {
    id: 'cor-10',
    originCountry: 'India',
    originCode: 'IN',
    originFlag: '🇮🇳',
    destCountry: 'Singapore',
    destCode: 'SG',
    destFlag: '🇸🇬',
    sector: 'Cross-Border Agritech & Cold Storage',
    annualVolume: '$190M Organic Flow',
    complianceAttestation: 'APEDA & SFA Validated',
    activeDealCount: 19,
    bilateralSynergy: 88,
    tier: 'STRONG',
  },
];

export const SEED_OPPORTUNITY_NODES: OpportunityGraphNode[] = [
  {
    id: 'op-1',
    companyName: 'Aura Logistics APAC',
    flag: '🇸🇬',
    commercialGoal: 'Airport lounge beverage partnerships & ASEAN cold-chain distribution',
    fitScore: 96,
    committee: [
      { role: 'Chief Commercial Officer', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', authority: 'Budget Sign-off' },
      { role: 'Head of Regional Logistics', name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', authority: 'Operational Routing' },
      { role: 'Director of Compliance', name: 'Chong Wei', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', authority: 'AEO Clearance' },
    ],
    warmRoute: 'Direct connection via Elena Rostova (Verified Node)',
    complianceClearance: 'Pre-vetted bilateral corridor',
  },
  {
    id: 'op-2',
    companyName: 'Vertex Nexus Global',
    flag: '🇦🇪',
    commercialGoal: 'Institutional trade finance liquidity & corporate treasury facility',
    fitScore: 94,
    committee: [
      { role: 'VP Corporate Strategy & M&A', name: 'Vikram Sethi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', authority: 'Treasury Allocation' },
      { role: 'Head of Credit & Risk', name: 'Farhan Al-Qasimi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', authority: 'Underwriting' },
    ],
    warmRoute: 'Direct connection via Vikram Sethi (Verified Node)',
    complianceClearance: 'DIFC DFSA Regulated Node',
  },
  {
    id: 'op-3',
    companyName: 'Rhine-Main Industrial SE',
    flag: '🇩🇪',
    commercialGoal: 'Precision robotics and Tier-1 automotive tooling procurement accord',
    fitScore: 91,
    committee: [
      { role: 'Director Strategic Sourcing', name: 'Dr. Klaus Becker', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', authority: 'Direct Procurement Sign-off' },
      { role: 'Head of Quality Assurance', name: 'Greta Weber', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', authority: 'AS9100 Clearance' },
    ],
    warmRoute: 'Direct connection via Dr. Klaus Becker (Verified Node)',
    complianceClearance: 'Frankfurt Chamber of Commerce Certified',
  },
  {
    id: 'op-4',
    companyName: 'Nippon Systems Consortium',
    flag: '🇯🇵',
    commercialGoal: 'APAC Enterprise AI middleware distribution and cloud expansion pipeline',
    fitScore: 93,
    committee: [
      { role: 'EVP of Alliances & Platforms', name: 'Hiroshi Tanaka', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', authority: 'Alliance Architecture' },
      { role: 'Director of Cloud Sourcing', name: 'Kenji Sato', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', authority: 'Infrastructure Sourcing' },
    ],
    warmRoute: 'Direct connection via Hiroshi Tanaka (Verified Node)',
    complianceClearance: 'METI Japan Standard Security Clearance',
  },
  {
    id: 'op-5',
    companyName: 'Novus Retail Group SE',
    flag: '🇬🇧',
    commercialGoal: 'FMCG and organic beverage direct shelf-space onboarding across 850 doors',
    fitScore: 89,
    committee: [
      { role: 'Head of Global Procurement', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', authority: 'Category Budget Lead' },
      { role: 'VP Merchandising', name: 'David Thompson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', authority: 'Floor Distribution' },
    ],
    warmRoute: 'Direct connection via Sarah Jenkins (Verified Node)',
    complianceClearance: 'UK ISO 22000 Food Safety Accord',
  },
];

// Staggered Animated Card Wrapper for High-Performance Native Animations
export const AnimatedResultCard: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 280,
      delay: Math.min(index * 45, 260),
      useNativeDriver: true,
    }).start();
  }, [animValue, index]);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

export const FUNCTION_FILTER_OPTIONS = [
  'All Functions',
  'Procurement & Sourcing',
  'Commercial Partnerships',
  'Supply Chain & Operations',
  'Commercial Sales & Channel',
  'Corporate Strategy & M&A',
  'AI & Technology',
  'Finance & Treasury',
];

export const INDUSTRY_FILTER_OPTIONS = [
  'All Industries',
  'Logistics & Supply Chain',
  'FinTech & Digital Banking',
  'FMCG & Consumer Goods',
  'Enterprise Software & Cloud',
  'Industrial Manufacturing',
  'Renewable Energy & CleanTech',
  'Healthcare & Life Sciences',
];

export const COUNTRY_FILTER_OPTIONS = [
  { code: 'ALL', label: 'Global / All' },
  { code: 'SG', label: '🇸🇬 Singapore' },
  { code: 'AE', label: '🇦🇪 UAE / GCC' },
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'IN', label: '🇮🇳 India' },
];

export const SENIORITY_FILTER_OPTIONS = [
  'All Seniorities',
  'C-Level / Founder',
  'VP / Managing Director',
  'Director / Head of Dept',
  'Manager / Lead',
];

const SUGGESTED_INQUIRIES = [
  'Procurement head at Nestle',
  'Cold storage logistics in Singapore',
  'Enterprise AI in Tokyo',
  'B2B Trade Liquidity in Dubai',
];

interface SearchScreenProps {
  initialQuery?: string;
  onNavigateToMessages?: (partner: { id?: string; name: string; company: string; role?: string; avatar?: string }) => void;
  onBack?: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ initialQuery = '', onNavigateToMessages, onBack }) => {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { showSuccess, showError } = useModal();

  // 1. Search Mode (Exact to Web: Leaders, Companies, Corridors, Opportunity Graph)
  const [mode, setMode] = useState<SearchMode>('DECISION_MAKERS');

  // 2. Query & Live Autocomplete
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(67055);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; subtitle: string; type: 'COMPANY' | 'EXECUTIVE'; badge: string }>>([]);
  const [suggestedCorrection, setSuggestedCorrection] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 3. Symmetrical Match Segregation Tier
  const [activeMatchTier, setActiveMatchTier] = useState<MatchTier>('ALL');

  // 4. Data Filters
  const [selectedFunction, setSelectedFunction] = useState('All Functions');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedSeniority, setSelectedSeniority] = useState('All Seniorities');
  const [minFitScore, setMinFitScore] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // 5. Market Corridor Selectors (Matching Web Corridor Finder)
  const [corridorOrigin, setCorridorOrigin] = useState('IN');
  const [corridorDestination, setCorridorDestination] = useState('MY');
  const [corridorCategory, setCorridorCategory] = useState('FMCG & Food Beverages');
  const [corridorCompliance, setCorridorCompliance] = useState('Halal JAKIM');

  // 6. Data Sets
  const [decisionMakers, setDecisionMakers] = useState<DecisionMakerItem[]>([]);
  const [matchedCompany, setMatchedCompany] = useState<any | null>(null);
  const [enterprises, setEnterprises] = useState<EnterpriseItem[]>(SEED_ENTERPRISES);
  const [corridors, setCorridors] = useState<TradeCorridorItem[]>(SEED_CORRIDORS);
  const [opportunityNodes, setOpportunityNodes] = useState<OpportunityGraphNode[]>(SEED_OPPORTUNITY_NODES);

  // 7. Watchlist / Dossier Modal
  const [savedIds, setSavedIds] = useState<string[]>(['dm-1', 'ent-1']);
  const [dossierTarget, setDossierTarget] = useState<DecisionMakerItem | null>(null);
  const [requestedIntros, setRequestedIntros] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 8. Say Hi Modal (Exact Web ConnectOpportunityModal replica)
  const [sayHiModalTarget, setSayHiModalTarget] = useState<DecisionMakerItem | null>(null);
  const [sayHiGreetingText, setSayHiGreetingText] = useState('');
  const [sayHiDraftIndex, setSayHiDraftIndex] = useState(0);
  const [isSubmittingSayHi, setIsSubmittingSayHi] = useState(false);

  // 9. Company Dossier Modal & Proposal Modal
  const [companyDossierTarget, setCompanyDossierTarget] = useState<EnterpriseItem | null>(null);
  const [proposalModalTarget, setProposalModalTarget] = useState<EnterpriseItem | null>(null);
  const [proposalCategory, setProposalCategory] = useState('Cross-Border Market Entry');
  const [proposalDealSize, setProposalDealSize] = useState('$1M - $5M');
  const [proposalNote, setProposalNote] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // 10. Lazy loading & Animated Results Controls
  const [displayedCorridorsCount, setDisplayedCorridorsCount] = useState(4);
  const [displayedOpportunitiesCount, setDisplayedOpportunitiesCount] = useState(3);
  const [corridorDetailTarget, setCorridorDetailTarget] = useState<TradeCorridorItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Sync initial query
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [initialQuery]);

  // Debounce query for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch live autocomplete suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSuggestedCorrection(null);
      return;
    }

    // Instant client-side typo auto-correction (0ms)
    const clientCorrection = autoCorrectQuery(trimmed);
    if (clientCorrection.hasCorrection) {
      setSuggestedCorrection(clientCorrection.correctedQuery);
    } else {
      setSuggestedCorrection(null);
    }

    const timer = setTimeout(async () => {
      // 1. Try backend suggest API
      try {
        const res = await apiRequest<{
          categorized?: Array<{ text: string; subtitle: string; type: 'COMPANY' | 'EXECUTIVE' | 'PERSON'; badge: string }>;
          suggestions?: string[];
          hasCorrection?: boolean;
          correctedQuery?: string | null;
        }>(`/search/suggest?q=${encodeURIComponent(trimmed)}`, { token });

        if (res.success && res.data) {
          if (Array.isArray(res.data.categorized) && res.data.categorized.length > 0) {
            setSuggestions(res.data.categorized as any);
          } else if (Array.isArray(res.data.suggestions) && res.data.suggestions.length > 0) {
            setSuggestions(
              res.data.suggestions.map((s: string) => ({
                text: s,
                subtitle: 'Verified Match',
                type: 'COMPANY',
                badge: 'Verified',
              }))
            );
          }
          if (res.data.hasCorrection && res.data.correctedQuery) {
            setSuggestedCorrection(res.data.correctedQuery);
          } else if (clientCorrection.hasCorrection) {
            setSuggestedCorrection(clientCorrection.correctedQuery);
          } else {
            setSuggestedCorrection(null);
          }
          return;
        }
      } catch {
        // Fallback to local offline catalog suggestions
      }

      // Offline instant catalog suggestions
      const qLower = trimmed.toLowerCase();
      const localMatches: Array<{ text: string; subtitle: string; type: 'COMPANY' | 'EXECUTIVE'; badge: string }> = [];

      // Check typo suggestions with full client engine
      if (clientCorrection.hasCorrection) {
        setSuggestedCorrection(clientCorrection.correctedQuery);
      } else {
        setSuggestedCorrection(null);
      }

      SEED_DECISION_MAKERS.forEach((dm) => {
        if (
          dm.displayName.toLowerCase().includes(qLower) ||
          dm.currentTitle.toLowerCase().includes(qLower) ||
          dm.companyName.toLowerCase().includes(qLower) ||
          dm.function.toLowerCase().includes(qLower)
        ) {
          localMatches.push({
            text: dm.displayName,
            subtitle: `${dm.currentTitle} • ${dm.companyName}`,
            type: 'EXECUTIVE',
            badge: `${dm.fitScore}% Fit`,
          });
        }
      });

      SEED_ENTERPRISES.forEach((ent) => {
        if (
          ent.name.toLowerCase().includes(qLower) ||
          ent.industry.toLowerCase().includes(qLower) ||
          ent.domain.toLowerCase().includes(qLower)
        ) {
          localMatches.push({
            text: ent.name,
            subtitle: `${ent.industry} • ${ent.headquartersCity}`,
            type: 'COMPANY',
            badge: `${ent.decisionMakerCount} Leaders`,
          });
        }
      });

      setSuggestions(localMatches.slice(0, 5));
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Execute Search
  useEffect(() => {
    executeSearch();
  }, [
    debouncedQuery,
    mode,
    activeMatchTier,
    selectedFunction,
    selectedIndustry,
    selectedCountry,
    selectedSeniority,
    minFitScore,
    verifiedOnly,
    corridorOrigin,
    corridorDestination,
    corridorCategory,
    corridorCompliance,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    async function initSaved() {
      try {
        const saved = await getSavedProfiles();
        setSavedIds(saved.map((s) => s.id));
      } catch {}
    }
    initSaved();
  }, []);

  const handleToggleSave = async (id: string, name: string) => {
    const dm = decisionMakers.find((d) => d.id === id);
    const ent = enterprises.find((e) => e.id === id);
    const itemToSave: SavedProfileItem = {
      id,
      type: ent ? 'ENTERPRISE' : 'EXECUTIVE',
      title: name,
      subtitle: dm?.currentTitle || ent?.legalName || dm?.headline || 'Corporate Entity',
      companyName: dm?.companyName || ent?.name,
      corporateLineage: dm?.corporateLineage,
      industry: dm?.industry || ent?.industry,
      location: dm?.city || ent?.headquartersCity,
      countryCode: dm?.countryCode || ent?.headquartersCountry,
      flag: dm?.flag || ent?.flag,
      avatarUrl: dm?.avatarUrl,
      fitScore: dm?.fitScore || ent?.matchScore || 90,
      matchTier: dm?.matchTier || 'BEST',
      seekingSummary: dm?.seekingSummary || ent?.matchExplanation,
      offeringSummary: dm?.offeringSummary,
      savedAt: new Date().toISOString(),
      userId: dm?.userId,
      rawItem: dm || ent,
    };

    try {
      const res = await toggleSavedProfile(itemToSave);
      setSavedIds(res.list.map((i) => i.id));
      if (res.isSaved) {
        showToast(`Saved "${name}" to executive watchlist`);
      } else {
        showToast(`Removed "${name}" from executive watchlist`);
      }
    } catch {
      setSavedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const handleShareItem = async (title: string, subtitle: string) => {
    try {
      await Share.share({
        title: `Meshvi Executive Dossier: ${title}`,
        message: `Verified Bilateral Dossier: ${title} (${subtitle}) on Meshvi Enterprise Network.`,
      });
    } catch {}
  };

  const handleClearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSuggestedCorrection(null);
    setSelectedFunction('All Functions');
    setSelectedIndustry('All Industries');
    setSelectedCountry('ALL');
    setSelectedSeniority('All Seniorities');
    setMinFitScore(0);
    setVerifiedOnly(false);
    setActiveMatchTier('ALL');
    showToast('Search and filters reset to clean directory browse');
  };

  const handleResetFiltersKeepQuery = () => {
    setSelectedFunction('All Functions');
    setSelectedIndustry('All Industries');
    setSelectedCountry('ALL');
    setSelectedSeniority('All Seniorities');
    setMinFitScore(0);
    setVerifiedOnly(false);
    setActiveMatchTier('ALL');
    showToast('Filters cleared');
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setDebouncedQuery(text);
    setShowSuggestions(false);
  };

  const executeSearch = async (targetPage: number = 1, isAppend: boolean = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }

    try {
      if (mode === 'DECISION_MAKERS') {
        const params = new URLSearchParams();
        const rawClean = debouncedQuery.startsWith('#')
          ? debouncedQuery.slice(1).trim()
          : debouncedQuery.trim();
        const clientCorrection = autoCorrectQuery(rawClean);
        const cleanQuery = clientCorrection.hasCorrection ? clientCorrection.correctedQuery : rawClean;
        if (cleanQuery) params.append('q', cleanQuery);
        if (clientCorrection.hasCorrection) {
          setSuggestedCorrection(clientCorrection.correctedQuery);
        }
        if (selectedFunction !== 'All Functions') params.append('function', selectedFunction);
        if (selectedIndustry !== 'All Industries') params.append('industry', selectedIndustry);
        if (selectedSeniority !== 'All Seniorities') params.append('seniority', selectedSeniority);
        if (selectedCountry !== 'ALL') params.append('countryCode', selectedCountry);
        if (verifiedOnly) params.append('verifiedOnly', 'true');
        if (activeMatchTier !== 'ALL') params.append('matchTier', activeMatchTier);
        if (minFitScore > 0) params.append('minFitScore', String(minFitScore));
        params.append('page', String(targetPage));
        params.append('limit', '30');

        const res = await apiRequest<{
          matches?: any[];
          results?: any[];
          totalMatches?: number;
          totalCount?: number;
          total?: number;
          matchedCompany?: any;
          queryCorrection?: { hasCorrection: boolean; correctedQuery: string };
        }>(`/search?${params.toString()}`, { token });

        if (res.data?.matchedCompany) {
          setMatchedCompany(res.data.matchedCompany);
        } else {
          setMatchedCompany(null);
        }

        if (res.data?.queryCorrection?.hasCorrection && res.data?.queryCorrection?.correctedQuery) {
          setSuggestedCorrection(res.data.queryCorrection.correctedQuery);
        } else {
          setSuggestedCorrection(null);
        }

        const total = res.data?.totalMatches ?? res.data?.totalCount ?? res.data?.total ?? 0;
        if (total > 0) {
          setTotalCount(total);
        }

        const rawList = res.data?.matches || res.data?.results || (Array.isArray(res.data) ? res.data : null);

        if (res.success && Array.isArray(rawList)) {
          if (rawList.length > 0) {
            const flagMap: Record<string, string> = { SG: '🇸🇬', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', JP: '🇯🇵', IN: '🇮🇳' };
            const mapped: DecisionMakerItem[] = rawList.map((r: any, idx: number) => {
              const p = r.profile || r;
              const countryCode = p.countryCode || 'SG';
              const rawFit = r.symmetricalFitScore || r.score || r.fitScore || (95 - ((idx + (targetPage - 1) * 30) % 12));
              const fit = typeof rawFit === 'number' ? (rawFit > 100 ? Math.round(rawFit / 10) : Math.round(rawFit)) : 88;
              const tier = fit >= 85 ? 'BEST' : fit >= 70 ? 'STRONG' : 'DIRECTORY';
              const compName = p.company?.name || p.companyName || 'Verified Enterprise';
              const corporateLineage =
                typeof p.corporateLineage === 'string'
                  ? p.corporateLineage
                  : p.corporateLineage?.parentHolding
                  ? `Parent: ${p.corporateLineage.parentHolding}`
                  : 'Verified Corporate Node';

              return {
                id: p.id || `dm-${targetPage}-${idx}`,
                userId: p.userId || p.id,
                displayName: p.displayName || 'Executive Leader',
                currentTitle: p.currentTitle || p.headline || 'Decision Maker',
                headline: p.headline || p.summary || '',
                companyName: compName,
                corporateLineage,
                function: p.function || 'Commercial Partnerships',
                seniority: p.seniority || 'VP / Executive',
                industry: p.industry || 'Logistics & Supply Chain',
                city: p.city || 'Singapore',
                countryCode,
                flag: flagMap[countryCode] || '🌐',
                avatarUrl: p.avatarUrl || null,
                verificationStatus: p.verificationStatus || 'VERIFIED',
                fitScore: fit,
                matchTier: tier,
                seekingSummary: r.laymanTransparency?.whyConnectRationale || p.intents?.[0]?.description || 'Seeking bilateral technology & distribution alliances.',
                offeringSummary: r.laymanTransparency?.scoreBreakdownExplanation || p.intents?.[1]?.description || 'Direct regional customer footprint and verified supply channel.',
                whyConnectRationale: r.laymanTransparency?.whyConnectRationale || r.explanation || 'Direct signing authority in relevant enterprise category.',
                scoreExplanation: r.laymanTransparency?.scoreBreakdownExplanation || 'High alignment on function, lineage, and compliance criteria.',
                connectionStatus: p.connectionStatus || 'NONE',
              };
            });

            if (isAppend) {
              setDecisionMakers((prev) => [...prev, ...mapped]);
              setPage(targetPage);
            } else {
              setDecisionMakers(mapped);
            }
          } else {
            if (!isAppend) {
              setDecisionMakers([]);
            }
          }
        } else {
          if (!isAppend) {
            filterLocalDecisionMakers();
          }
        }
      } else if (mode === 'ENTERPRISES') {
        const params = new URLSearchParams();
        const rawClean = debouncedQuery.startsWith('#')
          ? debouncedQuery.slice(1).trim()
          : debouncedQuery.trim();
        const clientCorrection = autoCorrectQuery(rawClean);
        const cleanQuery = clientCorrection.hasCorrection ? clientCorrection.correctedQuery : rawClean;
        if (cleanQuery) params.append('q', cleanQuery);
        if (clientCorrection.hasCorrection) {
          setSuggestedCorrection(clientCorrection.correctedQuery);
        }
        if (selectedCountry !== 'ALL') params.append('countryCode', selectedCountry);
        if (selectedIndustry !== 'All Industries') params.append('industry', selectedIndustry);
        params.append('page', String(targetPage));
        params.append('limit', '30');

        const res = await apiRequest<any>(`/companies?${params.toString()}`, { token });
        const list = res.data?.items || (Array.isArray(res.data) ? res.data : null);

        if (res.data?.totalCount) {
          setTotalCount(res.data.totalCount);
        }

        if (res.success && Array.isArray(list) && list.length > 0) {
          const flagMap: Record<string, string> = { SG: '🇸🇬', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', JP: '🇯🇵', IN: '🇮🇳' };
          const mapped: EnterpriseItem[] = list.map((c: any, idx: number) => ({
            id: c.id || `ent-${idx}`,
            name: c.name,
            legalName: c.legalName || c.name,
            domain: c.domain,
            industry: c.industry || 'Logistics & Supply Chain',
            subIndustry: c.subIndustry || 'Global Trade Operations',
            headquartersCity: c.headquartersCity || 'Singapore',
            headquartersCountry: c.headquartersCountry || 'SG',
            flag: flagMap[c.headquartersCountry] || '🌐',
            companyType: c.companyType || 'Corporate Entity',
            decisionMakerCount: c._count?.memberships || 6,
            intakeStatus: c.intakeStatus || 'OPEN',
            verified: true,
            matchScore: 94 - (idx % 8),
            matchExplanation: 'Bilateral enterprise procurement & supplier mandate matching your corporate criteria.',
          }));
          setEnterprises(mapped);
        } else {
          filterLocalEnterprises();
        }
      } else if (mode === 'TRADE_CORRIDORS') {
        filterLocalCorridors();
      } else {
        filterLocalOpportunityNodes();
      }
    } catch {
      if (!isAppend) {
        filterLocalDecisionMakers();
        filterLocalEnterprises();
        filterLocalCorridors();
        filterLocalOpportunityNodes();
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadNextPage = () => {
    if (loading || loadingMore || decisionMakers.length >= totalCount) return;
    executeSearch(page + 1, true);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    if (isCloseToBottom && !loading && !loadingMore) {
      if (mode === 'TRADE_CORRIDORS' && displayedCorridorsCount < corridors.length) {
        setLoadingMore(true);
        setTimeout(() => {
          setDisplayedCorridorsCount((prev) => Math.min(prev + 3, corridors.length));
          setLoadingMore(false);
        }, 450);
      } else if (mode === 'OPPORTUNITY_GRAPH' && displayedOpportunitiesCount < opportunityNodes.length) {
        setLoadingMore(true);
        setTimeout(() => {
          setDisplayedOpportunitiesCount((prev) => Math.min(prev + 2, opportunityNodes.length));
          setLoadingMore(false);
        }, 450);
      } else if (mode === 'DECISION_MAKERS' && decisionMakers.length < totalCount) {
        loadNextPage();
      }
    }
  };

  const filterLocalDecisionMakers = () => {
    const q = debouncedQuery.toLowerCase().trim();
    const filtered = SEED_DECISION_MAKERS.filter((item) => {
      const matchQuery =
        !q ||
        item.displayName.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.currentTitle.toLowerCase().includes(q) ||
        item.industry.toLowerCase().includes(q) ||
        item.function.toLowerCase().includes(q) ||
        item.seekingSummary.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q);

      const matchFunc =
        selectedFunction === 'All Functions' ||
        item.function.toLowerCase().includes(selectedFunction.toLowerCase());

      const matchInd =
        selectedIndustry === 'All Industries' ||
        item.industry.toLowerCase().includes(selectedIndustry.toLowerCase());

      const matchSeniority =
        selectedSeniority === 'All Seniorities' ||
        item.seniority.toLowerCase().includes(selectedSeniority.toLowerCase());

      const matchCountry = selectedCountry === 'ALL' || item.countryCode === selectedCountry;

      const matchFit = minFitScore === 0 || item.fitScore >= minFitScore;

      const matchTier =
        activeMatchTier === 'ALL' ||
        (activeMatchTier === 'BEST' && item.fitScore >= 90) ||
        (activeMatchTier === 'STRONG' && item.fitScore >= 75 && item.fitScore < 90) ||
        (activeMatchTier === 'DIRECTORY' && item.fitScore < 75);

      return matchQuery && matchFunc && matchInd && matchSeniority && matchCountry && matchFit && matchTier;
    });
    setDecisionMakers(filtered);
  };

  const filterLocalEnterprises = () => {
    const q = debouncedQuery.toLowerCase().trim();
    const filtered = SEED_ENTERPRISES.filter((item) => {
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.industry.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.headquartersCity.toLowerCase().includes(q);

      const matchCountry = selectedCountry === 'ALL' || item.headquartersCountry === selectedCountry;
      const matchInd = selectedIndustry === 'All Industries' || item.industry.toLowerCase().includes(selectedIndustry.toLowerCase());

      return matchQuery && matchCountry && matchInd;
    });
    setEnterprises(filtered);
  };

  const filterLocalCorridors = () => {
    const q = debouncedQuery.toLowerCase().trim();
    const filtered = SEED_CORRIDORS.filter((c) => {
      const matchQuery =
        !q ||
        c.originCountry.toLowerCase().includes(q) ||
        c.destCountry.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.originCode.toLowerCase().includes(q) ||
        c.destCode.toLowerCase().includes(q);

      const matchTerritory =
        selectedCountry === 'ALL' ||
        c.originCode === selectedCountry ||
        c.destCode === selectedCountry;

      return matchQuery && matchTerritory;
    });
    setCorridors(filtered.length > 0 ? filtered : SEED_CORRIDORS);
    setDisplayedCorridorsCount(4);
  };

  const filterLocalOpportunityNodes = () => {
    const q = debouncedQuery.toLowerCase().trim();
    const filtered = SEED_OPPORTUNITY_NODES.filter((op) => {
      const matchQuery =
        !q ||
        op.companyName.toLowerCase().includes(q) ||
        op.commercialGoal.toLowerCase().includes(q);

      const matchTerritory =
        selectedCountry === 'ALL' ||
        (selectedCountry === 'SG' && op.flag === '🇸🇬') ||
        (selectedCountry === 'AE' && op.flag === '🇦🇪') ||
        (selectedCountry === 'DE' && op.flag === '🇩🇪') ||
        (selectedCountry === 'JP' && op.flag === '🇯🇵') ||
        (selectedCountry === 'GB' && op.flag === '🇬🇧') ||
        (selectedCountry === 'US' && op.flag === '🇺🇸') ||
        (selectedCountry === 'IN' && op.flag === '🇮🇳');

      return matchQuery && matchTerritory;
    });
    setOpportunityNodes(filtered.length > 0 ? filtered : SEED_OPPORTUNITY_NODES);
    setDisplayedOpportunitiesCount(3);
  };

  const handleRequestIntro = async (dm: DecisionMakerItem) => {
    setRequestedIntros((prev) => [...prev, dm.id]);
    showSuccess(
      'Bilateral Mandate Dispatched',
      `Official introductory mandate successfully registered and dispatched to ${dm.displayName} at ${dm.companyName}. An encrypted Deal Room corridor will activate upon mutual sign-off.`,
      'Acknowledge'
    );

    if (token && dm.userId) {
      try {
        await apiRequest('/connections/requests', {
          method: 'POST',
          token,
          body: {
            targetUserId: dm.userId,
            initialNote: `Bilateral commercial partnership interest regarding ${dm.seekingSummary}`,
          },
        });
      } catch {}
    }
  };

  const SAY_HI_DRAFTS = [
    (name: string, company?: string) =>
      `Hi ${name}, I noticed your work${company ? ` at ${company}` : ''} and would love to connect. Open to a brief conversation?`,
    (name: string, company?: string) =>
      `Hi ${name}, our work closely aligns with your focus${company ? ` at ${company}` : ''}. Would value connecting with you here.`,
    (name: string, company?: string) =>
      `Hi ${name}, following your leadership${company ? ` at ${company}` : ''}. Would love to connect and exchange perspectives.`,
  ];

  const handleOpenSayHi = (dm: DecisionMakerItem) => {
    setSayHiModalTarget(dm);
    setSayHiDraftIndex(0);
    setSayHiGreetingText(SAY_HI_DRAFTS[0](dm.displayName, dm.companyName));
  };

  const handleCycleSayHiDraft = () => {
    if (!sayHiModalTarget) return;
    const nextIdx = (sayHiDraftIndex + 1) % SAY_HI_DRAFTS.length;
    setSayHiDraftIndex(nextIdx);
    setSayHiGreetingText(SAY_HI_DRAFTS[nextIdx](sayHiModalTarget.displayName, sayHiModalTarget.companyName));
  };

  const handleSendSayHi = async () => {
    if (!sayHiModalTarget) return;
    setIsSubmittingSayHi(true);
    try {
      if (token && sayHiModalTarget.userId) {
        await apiRequest('/connections/requests', {
          method: 'POST',
          token,
          body: {
            targetUserId: sayHiModalTarget.userId,
            initialNote: sayHiGreetingText.trim(),
          },
        });
      }
      setRequestedIntros((prev) => [...prev, sayHiModalTarget.id]);
      setDecisionMakers((prev) =>
        prev.map((d) => (d.id === sayHiModalTarget.id ? { ...d, connectionStatus: 'PENDING' } : d))
      );
      showSuccess(
        'Say Hi Dispatched! 👋',
        `Your introduction note was delivered to ${sayHiModalTarget.displayName}. Connection status set to pending.`
      );
      setSayHiModalTarget(null);
    } catch (err: any) {
      showError('Request Error', err?.message || 'Could not send introduction request.');
    } finally {
      setIsSubmittingSayHi(false);
    }
  };

  const handleSubmitProposal = () => {
    if (!proposalModalTarget) return;
    setIsSubmittingProposal(true);
    setTimeout(() => {
      setIsSubmittingProposal(false);
      showSuccess(
        'Proposal Delivered 🤝',
        `Your commercial proposal for "${proposalCategory}" (${proposalDealSize}) was submitted to ${proposalModalTarget.name}'s verified intake desk.`
      );
      setProposalModalTarget(null);
      setProposalNote('');
    }, 600);
  };

  const handleMessageUser = (dm: DecisionMakerItem) => {
    if (onNavigateToMessages) {
      onNavigateToMessages({
        id: dm.userId || dm.id,
        name: dm.displayName,
        company: dm.companyName,
        role: dm.currentTitle,
        avatar: dm.avatarUrl,
      });
    }
  };

  const activeFiltersCount =
    (selectedFunction !== 'All Functions' ? 1 : 0) +
    (selectedIndustry !== 'All Industries' ? 1 : 0) +
    (selectedSeniority !== 'All Seniorities' ? 1 : 0) +
    (selectedCountry !== 'ALL' ? 1 : 0) +
    (minFitScore > 0 ? 1 : 0) +
    (verifiedOnly ? 1 : 0);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Feather name="check-circle" size={15} color={MeshviColors.success} style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 1. Ultra-Compact Header: Title, Live Active Count, and Filter Button */}
      <View style={styles.compactHeader}>
        <View style={styles.compactHeaderLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.headerBackBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={17} color={MeshviColors.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.compactTitle}>
            {mode === 'TRADE_CORRIDORS'
              ? 'Trade Corridors'
              : mode === 'OPPORTUNITY_GRAPH'
              ? 'Opportunity Graph'
              : mode === 'DECISION_MAKERS'
              ? 'Decision Makers'
              : 'Enterprises'}
          </Text>
          <View style={styles.compactCountBadge}>
            <Text style={styles.compactCountText}>
              {mode === 'TRADE_CORRIDORS'
                ? `${corridors.length} Corridors`
                : mode === 'OPPORTUNITY_GRAPH'
                ? `${opportunityNodes.length} Committees`
                : `${totalCount.toLocaleString()}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.compactFilterBtn, activeFiltersCount > 0 && styles.compactFilterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <Feather
            name="sliders"
            size={12}
            color={activeFiltersCount > 0 ? '#FFFFFF' : MeshviColors.textPrimary}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.compactFilterBtnText, activeFiltersCount > 0 && styles.compactFilterBtnTextActive]}>
            Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>



      {/* 3. Compact Search Command Bar with Autocomplete Dropdown & Live Activity Indicator */}
      <View style={styles.compactSearchRowWrapper}>
        <View style={styles.compactSearchRow}>
          {isSearching || loading ? (
            <ActivityIndicator size="small" color={MeshviColors.accent} style={{ marginRight: 6 }} />
          ) : (
            <Feather name="search" size={15} color={MeshviColors.textMuted} style={{ marginRight: 6 }} />
          )}

          <TextInput
            style={styles.compactSearchInput}
            placeholder={
              mode === 'TRADE_CORRIDORS'
                ? 'Search corridors, countries, sectors...'
                : 'Search buying committees or commercial goals...'
            }
            placeholderTextColor={MeshviColors.textMuted}
            value={query}
            onChangeText={(txt) => {
              setQuery(txt);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            returnKeyType="search"
            onSubmitEditing={() => executeSearch(1, false)}
          />

          {query ? (
            <TouchableOpacity onPress={handleClearSearch} style={{ padding: 4 }}>
              <Feather name="x" size={14} color={MeshviColors.textMuted} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.compactSearchBtn}
            onPress={() => executeSearch(1, false)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="star-four-points" size={11} color="#FDE047" style={{ marginRight: 3 }} />
            <Text style={styles.compactSearchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Live Autocomplete Dropdown with Typo Correction & Categorized Results */}
        {showSuggestions && query.trim().length >= 2 && (suggestions.length > 0 || suggestedCorrection) && (
          <View style={styles.suggestionsDropdown}>
            {suggestedCorrection && (
              <TouchableOpacity
                style={styles.correctionBanner}
                onPress={() => handleSelectSuggestion(suggestedCorrection)}
                activeOpacity={0.88}
              >
                <Feather name="zap" size={13} color="#92400E" style={{ marginRight: 6 }} />
                <Text style={styles.correctionText}>
                  Did you mean: <Text style={styles.correctionHighlight}>{suggestedCorrection}</Text>?
                </Text>
                <View style={styles.oneClickBadge}>
                  <Text style={styles.oneClickText}>⚡ 1-Click Search</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsHeaderText}>SUGGESTIONS FOR "{query}"</Text>
              <TouchableOpacity onPress={() => setShowSuggestions(false)} style={{ padding: 2 }}>
                <Feather name="x" size={13} color={MeshviColors.textMuted} />
              </TouchableOpacity>
            </View>

            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionRow}
                onPress={() => handleSelectSuggestion(item.text)}
                activeOpacity={0.7}
              >
                <View style={[styles.suggestionIconWrap, item.type === 'COMPANY' ? styles.companyIconWrap : styles.userIconWrap]}>
                  {item.type === 'COMPANY' ? (
                    <Feather name="briefcase" size={13} color="#92400E" />
                  ) : (
                    <Feather name="user" size={13} color={MeshviColors.accent} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>{item.text}</Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>{item.subtitle}</Text>
                </View>
                <View style={styles.suggestionBadge}>
                  <Text style={styles.suggestionBadgeText}>{item.badge}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 4. Streamlined Horizontal Filter Chips (Territories + Quick Reset) */}
      <View style={styles.compactChipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}>
          {COUNTRY_FILTER_OPTIONS.map((c) => {
            const isSel = selectedCountry === c.code;
            return (
              <TouchableOpacity
                key={c.code}
                onPress={() => {
                  setSelectedCountry(c.code);
                  setDisplayedCorridorsCount(4);
                }}
                style={[styles.territoryPill, isSel && styles.territoryPillActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.territoryPillText, isSel && styles.territoryPillTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}

          {(query.length > 0 || activeFiltersCount > 0 || selectedCountry !== 'ALL') && (
            <TouchableOpacity
              style={styles.compactResetChip}
              onPress={() => {
                handleResetFiltersKeepQuery();
                setSelectedCountry('ALL');
                setQuery('');
                setDebouncedQuery('');
              }}
              activeOpacity={0.7}
            >
              <Feather name="rotate-ccw" size={10} color="#E11D48" style={{ marginRight: 3 }} />
              <Text style={styles.compactResetChipText}>Reset</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Main Results Feed */}
      {loading ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonHeaderBar}>
            <SkeletonBox width={200} height={14} borderRadius={4} />
            <SkeletonBox width={80} height={14} borderRadius={4} />
          </View>
          <SearchCardSkeleton />
          <SearchCardSkeleton />
          <SearchCardSkeleton />
          <SearchCardSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* ======================================================== */}
          {/* MODE 1: DECISION MAKERS                                  */}
          {/* ======================================================== */}
          {mode === 'DECISION_MAKERS' && (
            <>
              <View style={styles.resultCountBar}>
                <Text style={styles.resultCountText}>
                  {decisionMakers.length === 0
                    ? 'Showing 0 Decision-Makers Matched'
                    : `Showing 1 - ${decisionMakers.length} of ${totalCount.toLocaleString()} Decision-Makers Matched`}
                </Text>
                {activeFiltersCount > 0 && (
                  <TouchableOpacity onPress={handleResetFiltersKeepQuery}>
                    <Text style={styles.resetFiltersText}>Reset Filters ({activeFiltersCount})</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Typo / Suggested Query Auto-Correction Banner */}
              {suggestedCorrection && !loading && (
                <View style={styles.queryCorrectionBanner}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="star-four-points" size={13} color="#D97706" style={{ marginRight: 5 }} />
                      <Text style={styles.queryCorrectionText} numberOfLines={1}>
                        Showing results for <Text style={styles.queryCorrectionHighlight}>"{suggestedCorrection}"</Text>
                      </Text>
                    </View>
                    {query !== suggestedCorrection && (
                      <Text style={styles.queryCorrectionSubText} numberOfLines={1}>
                        Auto-corrected from "{query}"
                      </Text>
                    )}
                  </View>
                  {query !== suggestedCorrection && (
                    <TouchableOpacity
                      style={styles.queryCorrectionBtn}
                      onPress={() => {
                        setQuery(suggestedCorrection);
                        setDebouncedQuery(suggestedCorrection);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.queryCorrectionBtnText}>⚡ Update</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Target Organization Spotlight Card (Matching Web Exactly) */}
              {matchedCompany && !loading && (
                <View style={styles.matchedCompanyBanner}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
                      <View style={styles.matchedCompanyIcon}>
                        <Feather name="briefcase" size={13} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchedCompanyBadge}>TARGET ORGANIZATION SPOTLIGHT</Text>
                        <Text style={styles.matchedCompanyName} numberOfLines={1}>{matchedCompany.name}</Text>
                      </View>
                    </View>
                    <View style={styles.matchedCompanyStatusPill}>
                      <Text style={styles.matchedCompanyStatusText}>
                        {matchedCompany.verificationStatus === 'VERIFIED' ? 'DNS VERIFIED' : 'DIRECTORY'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.matchedCompanyMeta} numberOfLines={1}>
                    {[matchedCompany.industry, matchedCompany.headquartersCity, matchedCompany.headquartersCountry].filter(Boolean).join(' • ')}
                  </Text>
                </View>
              )}

              {/* Empty Results State */}
              {decisionMakers.length === 0 && !loading && (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Feather name="users" size={26} color={MeshviColors.textMuted} />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {query ? `No decision-makers matched "${query}"` : 'No decision-makers found'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {activeFiltersCount > 0
                      ? 'Your active search filters returned 0 exact matches. Reset filters to browse all verified leaders.'
                      : 'Zero profiles match this search query. Try broadening your criteria or reset search.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyResetBtn}
                    onPress={handleClearSearch}
                    activeOpacity={0.8}
                  >
                    <Feather name="rotate-ccw" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyResetBtnText}>Reset Search & Browse All</Text>
                  </TouchableOpacity>
                </View>
              )}

              {decisionMakers.map((dm, idx) => {
                const isConn = dm.connectionStatus === 'CONNECTED';
                const isPend = requestedIntros.includes(dm.id) || dm.connectionStatus === 'PENDING';
                const isSaved = savedIds.includes(dm.id);

                return (
                  <AnimatedResultCard key={dm.id} index={idx}>
                    <View style={styles.webCandidateCard}>
                      <TouchableOpacity
                        style={styles.webCandidateTop}
                        onPress={() => setDossierTarget(dm)}
                        activeOpacity={0.88}
                      >
                        {/* Left: Avatar initial / image */}
                        <View style={styles.candidateAvatarSquare}>
                          {dm.avatarUrl ? (
                            <Image source={{ uri: dm.avatarUrl }} style={styles.candidateAvatarImg} />
                          ) : (
                            <Text style={styles.candidateAvatarText}>
                              {dm.displayName?.[0]?.toUpperCase() || 'U'}
                            </Text>
                          )}
                        </View>

                        {/* Middle: Profile details */}
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.webCardName} numberOfLines={1}>{dm.displayName}</Text>
                            <Text style={styles.webCardFlag}>{dm.flag}</Text>
                            <MaterialCommunityIcons name="check-decagram" size={13} color="#166534" style={{ marginLeft: 3 }} />
                          </View>

                          <Text style={styles.webCardSubtitle} numberOfLines={1}>
                            <Text style={styles.webCardTitleBold}>{dm.currentTitle || 'Professional'}</Text>
                            {Boolean(dm.companyName) && ` • ${dm.companyName}`}
                            {Boolean(dm.city || dm.countryCode) && ` • ${[dm.city, dm.countryCode].filter(Boolean).join(', ')}`}
                          </Text>

                          {/* Contact Privacy Indicator (Exact Web Replica) */}
                          <View style={styles.webPrivacyRow}>
                            {isConn ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="mail" size={10} color="#166534" style={{ marginRight: 4 }} />
                                <Text style={styles.webPrivacyUnlockedText}>
                                  {dm.email || `${dm.displayName.toLowerCase().replace(/\s+/g, '.')}@enterprise.com`}
                                </Text>
                              </View>
                            ) : (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="lock" size={10} color="#94A3B8" style={{ marginRight: 4 }} />
                                <Text style={styles.webPrivacyLockedText}>Phone & email unlocked after connecting</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Bottom Action Footer */}
                      <View style={styles.webCardFooterRow}>
                        <TouchableOpacity
                          style={styles.webDossierBtn}
                          onPress={() => setDossierTarget(dm)}
                          activeOpacity={0.8}
                        >
                          <Feather name="file-text" size={11} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={styles.webDossierBtnText}>Dossier</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <TouchableOpacity
                            style={[styles.webIconActionBtn, isSaved && styles.webIconActionBtnActive]}
                            onPress={() => handleToggleSave(dm.id, dm.displayName)}
                            activeOpacity={0.7}
                          >
                            <Feather name="bookmark" size={13} color={isSaved ? MeshviColors.accent : MeshviColors.textSecondary} />
                          </TouchableOpacity>

                          {isConn ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={styles.webConnectedPill}>
                                <Feather name="check" size={11} color="#166534" />
                                <Text style={styles.webConnectedPillText}>Connected</Text>
                              </View>
                              <TouchableOpacity
                                style={styles.webMessageBtn}
                                onPress={() => handleMessageUser(dm)}
                                activeOpacity={0.8}
                              >
                                <Feather name="message-square" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={styles.webMessageBtnText}>Message</Text>
                              </TouchableOpacity>
                            </View>
                          ) : isPend ? (
                            <View style={styles.webPendingPill}>
                              <Feather name="clock" size={11} color="#92400E" />
                              <Text style={styles.webPendingPillText}>Pending</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.webSayHiBtn}
                              onPress={() => handleOpenSayHi(dm)}
                              activeOpacity={0.85}
                            >
                              <Feather name="send" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                              <Text style={styles.webSayHiBtnText}>👋 Say Hi</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </AnimatedResultCard>
                );
              })}

              {/* Pagination & Load More on Scroll */}
              {loadingMore && (
                <View style={styles.loadMoreWrap}>
                  <SearchCardSkeleton />
                </View>
              )}

              {!loadingMore && decisionMakers.length > 0 && (
                <View style={styles.paginationFooter}>
                  <Text style={styles.paginationFooterText}>
                    Showing {decisionMakers.length} of {totalCount.toLocaleString()} Verified Leaders
                  </Text>
                  {decisionMakers.length < totalCount && (
                    <TouchableOpacity
                      style={styles.loadMoreBtn}
                      onPress={loadNextPage}
                      activeOpacity={0.8}
                    >
                      <Feather name="chevron-down" size={14} color={MeshviColors.accent} style={{ marginRight: 5 }} />
                      <Text style={styles.loadMoreBtnText}>Load Next Page</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* MODE 2: ENTERPRISES                                      */}
          {/* ======================================================== */}
          {mode === 'ENTERPRISES' && (
            <>
              <View style={styles.resultCountBar}>
                <Text style={styles.resultCountText}>
                  {enterprises.length} Verified Global Corporate Entities
                </Text>
              </View>

              {enterprises.map((ent) => {
                const isSaved = savedIds.includes(ent.id);
                return (
                  <View key={ent.id} style={styles.webCandidateCard}>
                    <TouchableOpacity
                      style={styles.webCandidateTop}
                      onPress={() => setCompanyDossierTarget(ent)}
                      activeOpacity={0.88}
                    >
                      <View style={styles.companyMonogramSquare}>
                        <Text style={styles.companyMonogramInitial}>{ent.name.charAt(0)}</Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.webCardName} numberOfLines={1}>{ent.name}</Text>
                          <Text style={styles.webCardFlag}>{ent.flag}</Text>
                          <MaterialCommunityIcons name="check-decagram" size={13} color="#166534" style={{ marginLeft: 3 }} />
                        </View>

                        <Text style={styles.webCardSubtitle} numberOfLines={1}>
                          {ent.headquartersCity}, {ent.headquartersCountry} &bull; {ent.domain}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <View style={styles.metaBadgeChip}>
                            <Text style={styles.metaBadgeText}>{ent.industry}</Text>
                          </View>
                          <View style={styles.metaBadgeChip}>
                            <Text style={styles.metaBadgeText}>{ent.decisionMakerCount} Leaders</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.webCardFooterRow}>
                      <TouchableOpacity
                        style={styles.webDossierBtn}
                        onPress={() => setCompanyDossierTarget(ent)}
                        activeOpacity={0.8}
                      >
                        <Feather name="info" size={11} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.webDossierBtnText}>Company Dossier</Text>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          style={[styles.webIconActionBtn, isSaved && styles.webIconActionBtnActive]}
                          onPress={() => handleToggleSave(ent.id, ent.name)}
                          activeOpacity={0.7}
                        >
                          <Feather name="bookmark" size={13} color={isSaved ? MeshviColors.accent : MeshviColors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Pagination & Load More on Scroll */}
              {loadingMore && (
                <View style={styles.loadMoreWrap}>
                  <SearchCardSkeleton />
                </View>
              )}

              {!loadingMore && decisionMakers.length > 0 && (
                <View style={styles.paginationFooter}>
                  <Text style={styles.paginationFooterText}>
                    Showing {decisionMakers.length} of {totalCount.toLocaleString()} Verified Leaders
                  </Text>
                  {decisionMakers.length < totalCount && (
                    <TouchableOpacity
                      style={styles.loadMoreBtn}
                      onPress={loadNextPage}
                      activeOpacity={0.8}
                    >
                      <Feather name="chevron-down" size={14} color={MeshviColors.accent} style={{ marginRight: 5 }} />
                      <Text style={styles.loadMoreBtnText}>Load Next Page</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* MODE 3: TRADE CORRIDORS                                  */}
          {/* ======================================================== */}
          {mode === 'TRADE_CORRIDORS' && (
            <>
              <View style={styles.resultCountBar}>
                <Text style={styles.resultCountText}>
                  Showing {Math.min(displayedCorridorsCount, corridors.length)} of {corridors.length} Bilateral Corridors
                </Text>
                {selectedCountry !== 'ALL' && (
                  <TouchableOpacity onPress={() => setSelectedCountry('ALL')}>
                    <Text style={styles.resetFiltersText}>Clear Territory ({selectedCountry})</Text>
                  </TouchableOpacity>
                )}
              </View>

              {corridors.slice(0, displayedCorridorsCount).map((c, idx) => (
                <AnimatedResultCard key={c.id} index={idx}>
                  <TouchableOpacity
                    style={styles.corridorCard}
                    activeOpacity={0.88}
                    onPress={() => setCorridorDetailTarget(c)}
                  >
                    {/* Header Route & Synergy */}
                    <View style={styles.corridorHeader}>
                      <View style={styles.corridorFlagRow}>
                        <View style={styles.flagBubble}>
                          <Text style={styles.corridorFlagLarge}>{c.originFlag}</Text>
                        </View>
                        <View style={styles.routeArrowWrap}>
                          <Feather name="arrow-right" size={12} color={MeshviColors.accent} />
                        </View>
                        <View style={styles.flagBubble}>
                          <Text style={styles.corridorFlagLarge}>{c.destFlag}</Text>
                        </View>
                        <View style={{ marginLeft: 8, flex: 1 }}>
                          <Text style={styles.corridorTitle} numberOfLines={1}>
                            {c.originCountry} ➔ {c.destCountry}
                          </Text>
                          <Text style={styles.corridorSector} numberOfLines={1}>{c.sector}</Text>
                        </View>
                      </View>

                      <View style={styles.corridorSynergyPill}>
                        <MaterialCommunityIcons name="lightning-bolt" size={12} color="#059669" style={{ marginRight: 2 }} />
                        <Text style={styles.corridorSynergyText}>{c.bilateralSynergy}%</Text>
                      </View>
                    </View>

                    {/* Metrics Bar */}
                    <View style={styles.corridorMetrics}>
                      <View style={styles.corridorMetricBox}>
                        <Text style={styles.corridorMetricVal}>{c.annualVolume}</Text>
                        <Text style={styles.corridorMetricLabel}>Bilateral Flow</Text>
                      </View>
                      <View style={styles.corridorMetricDivider} />
                      <View style={styles.corridorMetricBox}>
                        <Text style={styles.corridorMetricVal}>{c.activeDealCount} Deals</Text>
                        <Text style={styles.corridorMetricLabel}>Active Deals</Text>
                      </View>
                      <View style={styles.corridorMetricDivider} />
                      <View style={styles.corridorMetricBox}>
                        <Text style={[styles.corridorMetricVal, { color: '#059669' }]}>Active</Text>
                        <Text style={styles.corridorMetricLabel}>Customs Rail</Text>
                      </View>
                    </View>

                    {/* Compliance & Action Footer */}
                    <View style={styles.corridorCardFooter}>
                      <View style={styles.complianceRow}>
                        <Feather name="shield" size={11} color={MeshviColors.success} style={{ marginRight: 5 }} />
                        <Text style={styles.complianceText} numberOfLines={1}>{c.complianceAttestation}</Text>
                      </View>

                      <View style={styles.corridorActionRow}>
                        <TouchableOpacity
                          style={styles.corridorExploreBtn}
                          onPress={() => setCorridorDetailTarget(c)}
                          activeOpacity={0.8}
                        >
                          <Feather name="info" size={11} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={styles.corridorExploreBtnText}>Route Intel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.corridorInitiateBtn}
                          onPress={() => {
                            setToastMessage(`Initiating Bilateral Corridor Room for ${c.originCountry} ➔ ${c.destCountry}`);
                            setTimeout(() => setToastMessage(null), 3200);
                          }}
                          activeOpacity={0.85}
                        >
                          <Feather name="zap" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.corridorInitiateBtnText}>Initiate Deal</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </AnimatedResultCard>
              ))}

              {/* Lazy Loading Indicator */}
              {loadingMore && (
                <View style={styles.lazyLoadingFooter}>
                  <ActivityIndicator size="small" color={MeshviColors.accent} />
                  <Text style={styles.lazyLoadingText}>Loading more corridor intelligence...</Text>
                </View>
              )}

              {!loadingMore && displayedCorridorsCount < corridors.length && (
                <TouchableOpacity
                  style={styles.loadMoreStrip}
                  onPress={() => {
                    setLoadingMore(true);
                    setTimeout(() => {
                      setDisplayedCorridorsCount((prev) => Math.min(prev + 3, corridors.length));
                      setLoadingMore(false);
                    }, 400);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loadMoreStripText}>
                    Load More Corridors ({corridors.length - displayedCorridorsCount} remaining)
                  </Text>
                  <Feather name="chevron-down" size={13} color={MeshviColors.accent} />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* MODE 4: OPPORTUNITY GRAPH                                */}
          {/* ======================================================== */}
          {mode === 'OPPORTUNITY_GRAPH' && (
            <>
              <View style={styles.resultCountBar}>
                <Text style={styles.resultCountText}>
                  Showing {Math.min(displayedOpportunitiesCount, opportunityNodes.length)} of {opportunityNodes.length} Enterprise Buying Committees
                </Text>
              </View>

              {opportunityNodes.slice(0, displayedOpportunitiesCount).map((op, idx) => (
                <AnimatedResultCard key={op.id} index={idx}>
                  <View style={styles.opCard}>
                    <View style={styles.opTop}>
                      <View style={styles.flagBubble}>
                        <Text style={styles.opFlag}>{op.flag}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.opCompanyName}>{op.companyName}</Text>
                        <Text style={styles.opGoalText} numberOfLines={2}>{op.commercialGoal}</Text>
                      </View>
                      <View style={styles.fitScoreBadge}>
                        <Text style={styles.fitScoreText}>{op.fitScore}% Fit</Text>
                      </View>
                    </View>

                    <Text style={styles.committeeLabel}>AUTHORIZED BUYING COMMITTEE (WARM ENTRY):</Text>
                    <View style={styles.committeeList}>
                      {op.committee.map((member, mIdx) => (
                        <View key={mIdx} style={styles.committeeMemberRow}>
                          <Image source={{ uri: member.avatar }} style={styles.committeeAvatar} />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.committeeName}>{member.name}</Text>
                            <Text style={styles.committeeRole}>{member.role}</Text>
                          </View>
                          <View style={styles.authorityPill}>
                            <Text style={styles.authorityText}>{member.authority}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.warmRouteBox}>
                      <Feather name="check-circle" size={12} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                      <Text style={styles.warmRouteText} numberOfLines={1}>{op.warmRoute}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.opWarmIntroBtn}
                      onPress={() => {
                        setToastMessage(`Warm introductory route requested for ${op.companyName}`);
                        setTimeout(() => setToastMessage(null), 3200);
                      }}
                      activeOpacity={0.85}
                    >
                      <Feather name="send" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
                      <Text style={styles.opWarmIntroBtnText}>Request Warm Entry via Committee</Text>
                    </TouchableOpacity>
                  </View>
                </AnimatedResultCard>
              ))}

              {/* Lazy Loading Indicator */}
              {loadingMore && (
                <View style={styles.lazyLoadingFooter}>
                  <ActivityIndicator size="small" color={MeshviColors.accent} />
                  <Text style={styles.lazyLoadingText}>Loading more buying committees...</Text>
                </View>
              )}

              {!loadingMore && displayedOpportunitiesCount < opportunityNodes.length && (
                <TouchableOpacity
                  style={styles.loadMoreStrip}
                  onPress={() => {
                    setLoadingMore(true);
                    setTimeout(() => {
                      setDisplayedOpportunitiesCount((prev) => Math.min(prev + 2, opportunityNodes.length));
                      setLoadingMore(false);
                    }, 400);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loadMoreStripText}>
                    Load More Committees ({opportunityNodes.length - displayedOpportunitiesCount} remaining)
                  </Text>
                  <Feather name="chevron-down" size={13} color={MeshviColors.accent} />
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* FILTER MODAL (EXACT REPLICA OF WEB DATA FILTERS)         */}
      {/* ======================================================== */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Executive Search Filters</Text>
                <Text style={styles.modalSubTitle}>Calibrate reciprocal intent criteria</Text>
              </View>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={{ padding: 4 }}>
                <Feather name="x" size={20} color={MeshviColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1, maxHeight: 420 }}>
              {/* Function Filter */}
              <Text style={styles.modalSectionLabel}>PRIMARY DEPARTMENT FUNCTION</Text>
              <View style={styles.modalChipsWrap}>
                {FUNCTION_FILTER_OPTIONS.map((fn) => {
                  const isSel = selectedFunction === fn;
                  return (
                    <TouchableOpacity
                      key={fn}
                      onPress={() => setSelectedFunction(fn)}
                      style={[styles.modalChip, isSel && styles.modalChipActive]}
                    >
                      <Text style={[styles.modalChipText, isSel && styles.modalChipTextActive]}>{fn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Industry Filter */}
              <Text style={styles.modalSectionLabel}>INDUSTRY VERTICAL & SECTOR</Text>
              <View style={styles.modalChipsWrap}>
                {INDUSTRY_FILTER_OPTIONS.map((ind) => {
                  const isSel = selectedIndustry === ind;
                  return (
                    <TouchableOpacity
                      key={ind}
                      onPress={() => setSelectedIndustry(ind)}
                      style={[styles.modalChip, isSel && styles.modalChipActive]}
                    >
                      <Text style={[styles.modalChipText, isSel && styles.modalChipTextActive]}>{ind}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Seniority Filter */}
              <Text style={styles.modalSectionLabel}>SIGNING AUTHORITY & SENIORITY</Text>
              <View style={styles.modalChipsWrap}>
                {SENIORITY_FILTER_OPTIONS.map((sn) => {
                  const isSel = selectedSeniority === sn;
                  return (
                    <TouchableOpacity
                      key={sn}
                      onPress={() => setSelectedSeniority(sn)}
                      style={[styles.modalChip, isSel && styles.modalChipActive]}
                    >
                      <Text style={[styles.modalChipText, isSel && styles.modalChipTextActive]}>{sn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Verified Only Toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setVerifiedOnly(!verifiedOnly)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>DNS Verified Node Clearance Only</Text>
                  <Text style={styles.toggleSub}>Exclude unverified third-party directory listings</Text>
                </View>
                <View style={[styles.checkbox, verifiedOnly && styles.checkboxActive]}>
                  {verifiedOnly && <Feather name="check" size={13} color={MeshviColors.white} />}
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => {
                  setSelectedFunction('All Functions');
                  setSelectedIndustry('All Industries');
                  setSelectedSeniority('All Seniorities');
                  setSelectedCountry('ALL');
                  setMinFitScore(0);
                  setVerifiedOnly(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalResetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyFilterBtn}
                onPress={() => setFilterModalVisible(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.applyFilterBtnText}>Apply Calibrated Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 75% SLIDING DETAILS DOSSIER SHEET (CLEAN & MODERN SCROLL) */}
      {/* ======================================================== */}
      <Modal visible={!!dossierTarget} transparent animationType="slide">
        <View style={styles.sheetModalOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdropDismiss}
            onPress={() => setDossierTarget(null)}
            activeOpacity={1}
          />
          {dossierTarget && (
            <View style={[styles.sheetContainer75, { paddingBottom: Math.max(insets.bottom + 8, 24) }]}>
              {/* Drag Handle Bar */}
              <View style={styles.sheetDragBarRow}>
                <View style={styles.sheetDragBar} />
              </View>

              {/* Header Profile Identity */}
              <View style={styles.sheetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={styles.sheetAvatarWrap}>
                    <Image source={{ uri: dossierTarget.avatarUrl }} style={styles.sheetAvatar} />
                    <View style={styles.onlineDot} />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={styles.sheetName}>{dossierTarget.displayName}</Text>
                      <Text style={styles.sheetFlag}>{dossierTarget.flag}</Text>
                      <View style={styles.verifiedNodeBadge}>
                        <Text style={styles.verifiedNodeText}>Verified Node ✓</Text>
                      </View>
                    </View>
                    <Text style={styles.sheetTitle} numberOfLines={1}>{dossierTarget.currentTitle}</Text>
                    <Text style={styles.sheetCompany} numberOfLines={1}>
                      {dossierTarget.companyName} &bull; {dossierTarget.city}, {dossierTarget.countryCode}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setDossierTarget(null)} style={styles.sheetCloseBtn}>
                  <Feather name="x" size={20} color={MeshviColors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Clean Momentum Scrollable Body */}
              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                {/* 1. Layman Transparency Match Rationale */}
                <View style={styles.sheetRationaleBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <MaterialCommunityIcons name="radar" size={17} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                    <Text style={styles.sheetRationaleTitle}>Why MESHVI Recommends This Match</Text>
                  </View>
                  <Text style={styles.sheetRationaleDesc}>{dossierTarget.whyConnectRationale}</Text>
                  <Text style={styles.sheetRationaleSub}>{dossierTarget.scoreExplanation}</Text>
                </View>

                {/* 2. Commercial Mandates (Demand & Supply) */}
                <View style={styles.sheetMandatesCard}>
                  <View style={styles.sheetSectionHeaderRow}>
                    <Feather name="target" size={14} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                    <Text style={styles.sheetSectionHeading}>Bilateral Commercial Mandate</Text>
                  </View>

                  {/* Seeking Mandate (Demand) */}
                  <View style={styles.mandateBlockSeeking}>
                    <View style={styles.mandateHeaderBadge}>
                      <View style={[styles.mandateDot, { backgroundColor: MeshviColors.warning }]} />
                      <Text style={styles.mandateSeekingTitle}>COMMERCIAL SEEKING MANDATE (DEMAND)</Text>
                    </View>
                    <Text style={styles.mandateBodyText}>{dossierTarget.seekingSummary}</Text>
                  </View>

                  {/* Offering Value Proposition (Supply) */}
                  <View style={styles.mandateBlockOffering}>
                    <View style={styles.mandateHeaderBadge}>
                      <View style={[styles.mandateDot, { backgroundColor: MeshviColors.accent }]} />
                      <Text style={styles.mandateOfferingTitle}>VALUE PROPOSITION (SUPPLY)</Text>
                    </View>
                    <Text style={styles.mandateBodyText}>{dossierTarget.offeringSummary}</Text>
                  </View>
                </View>

                {/* 3. Corporate Lineage & Authority Clearance */}
                <View style={styles.sheetMetaCard}>
                  <View style={styles.metaCardRow}>
                    <Feather name="git-branch" size={14} color={MeshviColors.textSecondary} style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metaCardLabel}>Corporate Lineage & Parent Holding</Text>
                      <Text style={styles.metaCardVal}>{dossierTarget.corporateLineage || 'Verified Corporate Enterprise'}</Text>
                    </View>
                  </View>

                  <View style={[styles.metaCardRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: MeshviColors.border }]}>
                    <Feather name="user-check" size={14} color={MeshviColors.accent} style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metaCardLabel}>Signing Authority & Function</Text>
                      <Text style={styles.metaCardVal}>{dossierTarget.seniority} &bull; {dossierTarget.function}</Text>
                    </View>
                  </View>

                  <View style={[styles.metaCardRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: MeshviColors.border }]}>
                    <Feather name="shield" size={14} color={MeshviColors.accent} style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metaCardLabel}>Reception Protocol</Text>
                      <Text style={styles.metaCardVal}>Encrypted Micro Deal Room &bull; Scheduled Video Call</Text>
                    </View>
                  </View>
                </View>

                <View style={{ height: 24 }} />
              </ScrollView>

              {/* Pinned Bottom Action Footer */}
              <View style={styles.sheetActionsFooter}>
                <TouchableOpacity
                  style={styles.sheetPrimaryBtn}
                  onPress={() => {
                    const target = dossierTarget;
                    setDossierTarget(null);
                    if (target) {
                      handleOpenSayHi(target);
                    }
                  }}
                  activeOpacity={0.88}
                >
                  <Text style={styles.sheetPrimaryBtnText}>👋 Say Hi / Connect</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetSecondaryBtn}
                  onPress={() => {
                    const t = dossierTarget;
                    setDossierTarget(null);
                    if (t) handleMessageUser(t);
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="message-square" size={14} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                  <Text style={styles.sheetSecondaryBtnText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ========================================================
          MODAL 1: SAY HI / CONNECT OPPORTUNITY MODAL (Feature-exact to Web)
         ======================================================== */}
      <Modal
        visible={!!sayHiModalTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setSayHiModalTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalSheetBox}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    Connect with {sayHiModalTarget?.displayName}
                  </Text>
                  <Feather name="check-circle" size={13} color={MeshviColors.accent} style={{ marginLeft: 6 }} />
                </View>
                <Text style={styles.modalSubTitle} numberOfLines={1}>
                  {sayHiModalTarget?.currentTitle || 'Leader'} • {sayHiModalTarget?.companyName || 'Enterprise'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSayHiModalTarget(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Smart Draft Suggestion Pill */}
            <View style={styles.smartDraftCard}>
              <View style={styles.smartDraftTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="zap" size={13} color={MeshviColors.accent} style={{ marginRight: 5 }} />
                  <Text style={styles.smartDraftTitle}>Smart Draft ({sayHiDraftIndex + 1}/{SAY_HI_DRAFTS.length})</Text>
                </View>
                <TouchableOpacity
                  style={styles.cycleDraftBtn}
                  onPress={handleCycleSayHiDraft}
                  activeOpacity={0.7}
                >
                  <Feather name="refresh-cw" size={12} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                  <Text style={styles.cycleDraftBtnText}>Cycle Draft</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.smartDraftHint}>
                Pre-vetted corporate greeting optimized for high executive response rates.
              </Text>
            </View>

            {/* Editable Greeting Message */}
            <Text style={styles.fieldLabel}>Greeting Note (Optional custom intro)</Text>
            <TextInput
              style={styles.modalTextArea}
              value={sayHiGreetingText}
              onChangeText={setSayHiGreetingText}
              placeholder="Hi, I noticed your work and would love to connect..."
              placeholderTextColor={MeshviColors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <View style={styles.charCountRow}>
              <Text style={styles.charCountText}>
                {sayHiGreetingText.length}/300 characters
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="shield" size={11} color={MeshviColors.accent} style={{ marginRight: 3 }} />
                <Text style={styles.charCountText}>Spam-filtered & Direct</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setSayHiModalTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, isSubmittingSayHi && { opacity: 0.7 }]}
                onPress={handleSendSayHi}
                disabled={isSubmittingSayHi}
                activeOpacity={0.85}
              >
                {isSubmittingSayHi ? (
                  <ActivityIndicator size="small" color={MeshviColors.white} />
                ) : (
                  <>
                    <Feather name="send" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.modalPrimaryBtnText}>Send Connection</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 2: COMPANY DOSSIER MODAL (Compact Enterprise Profile)
         ======================================================== */}
      <Modal
        visible={!!companyDossierTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setCompanyDossierTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '82%' }]}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {companyDossierTarget?.name}
                  </Text>
                  <View style={[styles.badgeMint, { marginLeft: 8 }]}>
                    <Text style={styles.badgeMintText}>DNS VERIFIED</Text>
                  </View>
                </View>
                <Text style={styles.modalSubTitle}>
                  {companyDossierTarget?.industry || 'Enterprise'} • {companyDossierTarget?.headquartersCity ? `${companyDossierTarget?.headquartersCity}, ` : ''}{companyDossierTarget?.headquartersCountry || 'Global'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCompanyDossierTarget(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1, marginTop: 10 }}>
              {/* Metric stats strip */}
              <View style={styles.companyMetricRow}>
                <View style={styles.companyMetricCard}>
                  <Text style={styles.companyMetricVal}>{companyDossierTarget?.decisionMakerCount ?? 12}</Text>
                  <Text style={styles.companyMetricLbl}>Leaders</Text>
                </View>
                <View style={styles.companyMetricCard}>
                  <Text style={styles.companyMetricVal}>3</Text>
                  <Text style={styles.companyMetricLbl}>Branches</Text>
                </View>
                <View style={styles.companyMetricCard}>
                  <Text style={[styles.companyMetricVal, { color: MeshviColors.accent }]}>98%</Text>
                  <Text style={styles.companyMetricLbl}>DNS Trust</Text>
                </View>
              </View>

              {/* Company Summary */}
              <Text style={styles.sheetSectionTitle}>Corporate Overview</Text>
              <Text style={styles.companyDossierDesc}>
                {companyDossierTarget?.description ||
                  `${companyDossierTarget?.name} is a verified enterprise operating in ${companyDossierTarget?.industry || 'Global Commerce'}. Certified corporate lineage and direct executive access.`}
              </Text>

              {/* Verified Capabilities */}
              <Text style={[styles.sheetSectionTitle, { marginTop: 14 }]}>Trade & Partnership Lines</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                <View style={styles.tagPill}><Text style={styles.tagPillText}>Corporate Procurement</Text></View>
                <View style={styles.tagPill}><Text style={styles.tagPillText}>SLA-Backed Sourcing</Text></View>
                <View style={styles.tagPill}><Text style={styles.tagPillText}>Commercial Tenders</Text></View>
                <View style={styles.tagPill}><Text style={styles.tagPillText}>Direct Supply Corridor</Text></View>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.modalActionRow, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[styles.modalSecondaryBtn, { flex: 1 }]}
                onPress={() => setCompanyDossierTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 3: SUBMIT COMPANY PROPOSAL MODAL (Exact to Web RFP)
         ======================================================== */}
      <Modal
        visible={!!proposalModalTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setProposalModalTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '85%' }]}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  Submit RFP to {proposalModalTarget?.name}
                </Text>
                <Text style={styles.modalSubTitle}>
                  Formal B2B Commercial & Partnership Proposal
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setProposalModalTarget(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1, marginTop: 10 }}>
              {/* Category Selection */}
              <Text style={styles.fieldLabel}>Proposal Category</Text>
              <View style={styles.proposalCategoryWrap}>
                {['Commercial RFP & Tender', 'Distribution Rights', 'Joint Venture / Equity', 'Technology Integration'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catOptionPill, proposalCategory === cat && styles.catOptionPillActive]}
                    onPress={() => setProposalCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.catOptionText, proposalCategory === cat && styles.catOptionTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Deal Size Tier */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Projected Deal Size</Text>
              <View style={styles.proposalCategoryWrap}>
                {['$25k - $100k', '$100k - $500k', '$500k - $2M', '$2M+ Enterprise'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.catOptionPill, proposalDealSize === size && styles.catOptionPillActive]}
                    onPress={() => setProposalDealSize(size)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.catOptionText, proposalDealSize === size && styles.catOptionTextActive]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Executive Summary / Scope Note */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Executive Summary & Scope</Text>
              <TextInput
                style={styles.modalTextArea}
                value={proposalNote}
                onChangeText={setProposalNote}
                placeholder="Detail your commercial requirements, SLA timelines, target regional markets, and strategic value add..."
                placeholderTextColor={MeshviColors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <View style={styles.ndaBanner}>
                <Feather name="shield" size={13} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                <Text style={styles.ndaBannerText}>
                  Routed via SETU verified enterprise escrow with Mutual NDA protection option.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.modalActionRow, { marginTop: 14 }]}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setProposalModalTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, isSubmittingProposal && { opacity: 0.7 }]}
                onPress={handleSubmitProposal}
                disabled={isSubmittingProposal}
                activeOpacity={0.85}
              >
                {isSubmittingProposal ? (
                  <ActivityIndicator size="small" color={MeshviColors.white} />
                ) : (
                  <>
                    <Feather name="send" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.modalPrimaryBtnText}>Transmit Proposal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 10. Corridor Route Intelligence Bottom Sheet Modal */}
      <Modal visible={!!corridorDetailTarget} transparent animationType="slide">
        <View style={styles.sheetModalOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdropTouchable}
            activeOpacity={1}
            onPress={() => setCorridorDetailTarget(null)}
          />
          <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
            <View style={styles.sheetHandle} />
            {corridorDetailTarget && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 24, marginRight: 6 }}>{corridorDetailTarget.originFlag}</Text>
                      <Feather name="arrow-right" size={16} color={MeshviColors.accent} style={{ marginHorizontal: 6 }} />
                      <Text style={{ fontSize: 24, marginLeft: 2 }}>{corridorDetailTarget.destFlag}</Text>
                    </View>
                    <Text style={styles.sheetTargetName}>
                      {corridorDetailTarget.originCountry} ➔ {corridorDetailTarget.destCountry} Corridor
                    </Text>
                    <Text style={styles.sheetTargetTitle}>{corridorDetailTarget.sector}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setCorridorDetailTarget(null)} style={styles.sheetCloseBtn}>
                    <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Metrics */}
                <View style={[styles.corridorMetrics, { marginVertical: 12 }]}>
                  <View style={styles.corridorMetricBox}>
                    <Text style={styles.corridorMetricVal}>{corridorDetailTarget.annualVolume}</Text>
                    <Text style={styles.corridorMetricLabel}>Bilateral Flow</Text>
                  </View>
                  <View style={styles.corridorMetricDivider} />
                  <View style={styles.corridorMetricBox}>
                    <Text style={styles.corridorMetricVal}>{corridorDetailTarget.activeDealCount} Deals</Text>
                    <Text style={styles.corridorMetricLabel}>Active Rooms</Text>
                  </View>
                  <View style={styles.corridorMetricDivider} />
                  <View style={styles.corridorMetricBox}>
                    <Text style={styles.corridorMetricVal}>{corridorDetailTarget.bilateralSynergy}%</Text>
                    <Text style={styles.corridorMetricLabel}>Synergy Index</Text>
                  </View>
                </View>

                {/* Compliance Accord */}
                <View style={[styles.complianceRow, { backgroundColor: MeshviColors.surfaceMuted, padding: 12, borderRadius: 10, marginVertical: 8 }]}>
                  <Feather name="shield" size={15} color={MeshviColors.success} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: MeshviColors.textPrimary }}>
                      Compliance & Customs Protocol
                    </Text>
                    <Text style={{ fontSize: 11, color: MeshviColors.textSecondary, marginTop: 2 }}>
                      {corridorDetailTarget.complianceAttestation}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.webSayHiBtn, { marginTop: 14, justifyContent: 'center', height: 44 }]}
                  onPress={() => {
                    const corr = corridorDetailTarget;
                    setCorridorDetailTarget(null);
                    setToastMessage(`Initiating bilateral corridor connection for ${corr.originCountry} ➔ ${corr.destCountry}...`);
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="zap" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={[styles.webSayHiBtnText, { fontSize: 13, fontWeight: '800' }]}>
                    Initiate Bilateral Corridor
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MeshviColors.background,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 99,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    color: MeshviColors.success,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: MeshviColors.surface,
  },
  compactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  headerBackBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: MeshviColors.textPrimary,
    letterSpacing: -0.3,
  },
  compactCountBadge: {
    backgroundColor: 'rgba(15, 118, 110, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  compactCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  compactFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  compactFilterBtnActive: {
    backgroundColor: MeshviColors.textPrimary,
    borderColor: MeshviColors.textPrimary,
  },
  compactFilterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  compactFilterBtnTextActive: {
    color: '#FFFFFF',
  },
  compactSegmentedBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  compactSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  compactSegmentBtnActive: {
    backgroundColor: MeshviColors.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  compactSegmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  compactSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  compactSearchRowWrapper: {
    paddingHorizontal: 16,
    marginBottom: 6,
    zIndex: 99,
  },
  compactSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  compactSearchInput: {
    flex: 1,
    fontSize: 12,
    color: MeshviColors.textPrimary,
    paddingVertical: 0,
  },
  compactSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    marginLeft: 6,
  },
  compactSearchBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  compactChipsRow: {
    marginBottom: 8,
  },
  territoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginRight: 6,
  },
  territoryPillActive: {
    backgroundColor: MeshviColors.textPrimary,
    borderColor: MeshviColors.textPrimary,
  },
  territoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  territoryPillTextActive: {
    color: '#FFFFFF',
  },
  compactResetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  compactResetChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E11D48',
  },
  flagBubble: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  routeArrowWrap: {
    marginHorizontal: 3,
  },
  corridorMetricDivider: {
    width: 1,
    height: 22,
    backgroundColor: MeshviColors.border,
  },
  corridorCardFooter: {
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  corridorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  corridorExploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  corridorExploreBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  corridorInitiateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: MeshviColors.textPrimary,
  },
  corridorInitiateBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lazyLoadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  lazyLoadingText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  loadMoreStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    gap: 6,
  },
  loadMoreStripText: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  opWarmIntroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.textPrimary,
    paddingVertical: 9,
    borderRadius: 9,
    marginTop: 8,
  },
  opWarmIntroBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sheetContainer: {
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetBackdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: MeshviColors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTargetName: {
    fontSize: 16,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  sheetTargetTitle: {
    fontSize: 12,
    color: MeshviColors.textSecondary,
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: MeshviColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  title: {
    color: MeshviColors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginLeft: 10,
  },
  filterIconBtnActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: MeshviColors.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: MeshviColors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  modeTabActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.25)',
  },
  modeTabText: {
    color: MeshviColors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: MeshviColors.accent,
    fontWeight: '800',
  },
  searchBarWrapper: {
    marginHorizontal: 16,
    marginTop: 10,
    zIndex: 50,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    color: MeshviColors.textPrimary,
    fontSize: 13,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 99,
    overflow: 'hidden',
  },
  correctionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  correctionText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  correctionHighlight: {
    fontWeight: '900',
    color: '#172B4D',
    textDecorationLine: 'underline',
  },
  oneClickBadge: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  oneClickText: {
    color: '#78350F',
    fontSize: 9,
    fontWeight: '800',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: MeshviColors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  suggestionsHeaderText: {
    color: MeshviColors.textMuted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyIconWrap: {
    backgroundColor: '#FEF3C7',
  },
  userIconWrap: {
    backgroundColor: MeshviColors.surfaceMint,
  },
  suggestionTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  suggestionSub: {
    color: MeshviColors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  suggestionBadge: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  suggestionBadgeText: {
    color: MeshviColors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  suggestedStrip: {
    paddingVertical: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  promptChipText: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  territoryRow: {
    paddingBottom: 8,
  },
  territoryChip: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  territoryChipActive: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },
  territoryText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  territoryTextActive: {
    color: MeshviColors.white,
    fontWeight: '800',
  },
  tiersBar: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  tierTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  tierTabActive: {
    backgroundColor: MeshviColors.primary,
    borderColor: MeshviColors.primary,
  },
  tierTabActiveAmber: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  tierTabActiveTeal: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },
  tierTabText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  tierTabTextActive: {
    color: MeshviColors.white,
    fontWeight: '800',
  },
  tierTabTextActiveAmber: {
    color: MeshviColors.white,
    fontWeight: '800',
  },
  tierTabTextActiveTeal: {
    color: MeshviColors.white,
    fontWeight: '800',
  },
  tierCountBadge: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  tierCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tierCountText: {
    color: MeshviColors.textPrimary,
    fontSize: 9.5,
    fontWeight: '800',
  },
  tierCountTextActive: {
    color: MeshviColors.white,
  },
  resultCountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  resultCountText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetFiltersText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: MeshviColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  dmCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dmTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dmAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: MeshviColors.accent,
  },
  dmName: {
    color: MeshviColors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginRight: 4,
  },
  dmFlag: {
    fontSize: 12,
    marginRight: 4,
  },
  verifiedNodeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedNodeText: {
    color: MeshviColors.success,
    fontSize: 9,
    fontWeight: '800',
  },
  fitScoreBadge: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  fitScoreText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '900',
  },
  dmRole: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  dmCompany: {
    color: MeshviColors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  neutralChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  neutralChipText: {
    color: MeshviColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  intentBox: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  intentItem: {},
  intentLabelSeeking: {
    color: MeshviColors.success,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 1,
  },
  intentLabelOffering: {
    color: MeshviColors.accent,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 1,
  },
  intentText: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
  },
  laymanRationaleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  laymanRationaleText: {
    color: MeshviColors.textSecondary,
    fontSize: 10.5,
    lineHeight: 15,
    flex: 1,
  },
  dmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  introBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    shadowColor: MeshviColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 40,
  },
  introBtnRequested: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  introBtnText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  introBtnTextRequested: {
    color: MeshviColors.success,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginLeft: 6,
  },
  secondaryActionBtnActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  entCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  entTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entMonogram: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  entMonogramLetter: {
    color: MeshviColors.accent,
    fontSize: 20,
    fontWeight: '900',
  },
  entName: {
    color: MeshviColors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  entFlag: {
    fontSize: 14,
    marginLeft: 6,
  },
  entDomain: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  entChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  entMatchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  matchIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  matchIndicatorText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  decisionCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decisionCountText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  matchExplanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  matchExplanationText: {
    color: MeshviColors.textSecondary,
    fontSize: 10.5,
    lineHeight: 15,
    flex: 1,
  },
  entActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  entSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginRight: 8,
    height: 40,
  },
  entSaveBtnActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  entSaveBtnText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  entSaveBtnTextActive: {
    color: MeshviColors.accent,
    fontWeight: '800',
  },
  entActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.accent,
    borderRadius: 10,
    paddingVertical: 9,
    height: 40,
  },
  entActionBtnText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  corridorFilterCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 12,
  },
  corridorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  corridorCardTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  corridorCardSub: {
    color: MeshviColors.textSecondary,
    fontSize: 10.5,
    marginBottom: 10,
  },
  corridorSelectorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  corridorSelectorCol: {
    flex: 1,
  },
  corridorSelectorLabel: {
    color: MeshviColors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  corridorPillSmall: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  corridorPillText: {
    color: MeshviColors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  corridorCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  corridorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  corridorFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corridorFlagLarge: {
    fontSize: 22,
  },
  corridorSynergyPill: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  corridorSynergyText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '900',
  },
  corridorTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  corridorSector: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  corridorMetrics: {
    flexDirection: 'row',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  corridorMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  corridorMetricVal: {
    color: MeshviColors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  corridorMetricLabel: {
    color: MeshviColors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  complianceText: {
    color: MeshviColors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  opportunityIntroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
    marginBottom: 12,
  },
  opportunityIntroTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  opportunityIntroSub: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  opCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 12,
  },
  opTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  opFlag: {
    fontSize: 22,
  },
  opCompanyName: {
    color: MeshviColors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  opGoalText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  committeeLabel: {
    color: MeshviColors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  committeeList: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  committeeMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  committeeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  committeeName: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  committeeRole: {
    color: MeshviColors.textSecondary,
    fontSize: 9.5,
  },
  authorityPill: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  authorityText: {
    color: MeshviColors.accent,
    fontSize: 9,
    fontWeight: '800',
  },
  warmRouteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  warmRouteText: {
    color: MeshviColors.success,
    fontSize: 10.5,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  modalSubTitle: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  modalSectionLabel: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  modalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalChip: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  modalChipActive: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },
  modalChipText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  modalChipTextActive: {
    color: MeshviColors.white,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
    marginTop: 14,
  },
  toggleTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  toggleSub: {
    color: MeshviColors.textSecondary,
    fontSize: 10.5,
    marginTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: MeshviColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },
  modalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  modalResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  modalResetBtnText: {
    color: MeshviColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  applyFilterBtn: {
    flex: 1,
    backgroundColor: MeshviColors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFilterBtnText: {
    color: MeshviColors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  // ==========================================
  // COMPACT SEARCH CARDS (CLEAN ENTERPRISE UI)
  // ==========================================
  compactDmCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  compactCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  compactAvatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  compactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: MeshviColors.surface,
  },
  compactIdentity: {
    flex: 1,
    justifyContent: 'center',
  },
  compactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactName: {
    color: MeshviColors.textPrimary,
    fontSize: 13.5,
    fontWeight: '800',
    flexShrink: 1,
  },
  compactFlag: {
    fontSize: 12,
    marginLeft: 5,
  },
  compactTierBadge: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  compactTierText: {
    color: MeshviColors.accent,
    fontSize: 9.5,
    fontWeight: '800',
  },
  compactRole: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  compactCompany: {
    color: MeshviColors.textSecondary,
    fontSize: 10.5,
    marginTop: 1,
  },
  compactTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  compactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  compactChipText: {
    color: MeshviColors.textSecondary,
    fontSize: 9.5,
    fontWeight: '600',
  },
  compactActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
    gap: 6,
  },
  compactDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  compactDetailsBtnText: {
    color: MeshviColors.primary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  compactIntroBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.accent,
    paddingVertical: 7,
    borderRadius: 8,
  },
  compactIntroBtnRequested: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  compactIntroBtnText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  compactIntroBtnTextRequested: {
    color: MeshviColors.success,
  },
  compactIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIconBtnActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  compactEntFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  compactEntActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  compactEntActionBtnText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '800',
  },

  // ==========================================
  // 75% SLIDING DETAILS DOSSIER MODAL
  // ==========================================
  sheetModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetBackdropDismiss: {
    flex: 1,
  },
  sheetContainer75: {
    height: '75%',
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetDragBarRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sheetDragBar: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: MeshviColors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  sheetAvatarWrap: {
    position: 'relative',
  },
  sheetAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  sheetName: {
    color: MeshviColors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  sheetFlag: {
    fontSize: 14,
    marginLeft: 6,
  },
  sheetTitle: {
    color: MeshviColors.accent,
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  sheetCompany: {
    color: MeshviColors.textSecondary,
    fontSize: 10.5,
    marginTop: 1,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    flex: 1,
    marginTop: 12,
  },
  sheetRationaleBox: {
    backgroundColor: MeshviColors.surfaceMint,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  sheetRationaleTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  sheetRationaleDesc: {
    color: MeshviColors.textPrimary,
    fontSize: 11.5,
    lineHeight: 16.5,
    fontWeight: '600',
  },
  sheetRationaleSub: {
    color: MeshviColors.accent,
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 4,
  },
  sheetMandatesCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 12,
  },
  sheetSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sheetSectionHeading: {
    color: MeshviColors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  mandateBlockSeeking: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  mandateBlockOffering: {
    backgroundColor: MeshviColors.surfaceMint,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  mandateHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mandateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  mandateSeekingTitle: {
    color: MeshviColors.warning,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mandateOfferingTitle: {
    color: MeshviColors.accent,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mandateBodyText: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  sheetMetaCard: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 14,
  },
  metaCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaCardLabel: {
    color: MeshviColors.textMuted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metaCardVal: {
    color: MeshviColors.textPrimary,
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  sheetActionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  sheetPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.accent,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sheetPrimaryBtnText: {
    color: MeshviColors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  sheetSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  sheetSecondaryBtnText: {
    color: MeshviColors.accent,
    fontSize: 12,
    fontWeight: '800',
  },

  // Skeleton & Infinite Pagination Controls
  skeletonHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  loadMoreWrap: {
    marginTop: 8,
    marginBottom: 12,
  },
  paginationFooter: {
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  paginationFooterText: {
    color: MeshviColors.textSecondary,
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.25)',
  },
  loadMoreBtnText: {
    color: MeshviColors.accent,
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Web Exact: Search Action & Data Filters Strip
  searchSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  searchSubmitBtnText: {
    color: MeshviColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  dataFiltersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: MeshviColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
    gap: 8,
  },
  dataFilterPrefix: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataFilterPill: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  dataFilterPillActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  dataFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: MeshviColors.textPrimary,
  },
  dataFilterTextActive: {
    color: MeshviColors.accent,
    fontWeight: '700',
  },
  dataFilterReset: {
    paddingHorizontal: 8,
    paddingVertical: 4.5,
  },
  dataFilterResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.accent,
  },

  // Web Exact: Candidate & Enterprise Compact Cards
  webCandidateCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  webCandidateTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  candidateAvatarSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  candidateAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  candidateAvatarText: {
    color: MeshviColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  webCardName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  webCardFlag: {
    fontSize: 12,
    marginLeft: 4,
  },
  webCardSubtitle: {
    fontSize: 11.5,
    color: MeshviColors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  webCardTitleBold: {
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  webPrivacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  webPrivacyUnlockedText: {
    fontSize: 10.5,
    color: '#166534',
    fontWeight: '600',
  },
  webPrivacyLockedText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  webCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  webDossierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  webDossierBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  webIconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webIconActionBtnActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  webConnectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
  },
  webConnectedPillText: {
    color: '#065F46',
    fontSize: 10.5,
    fontWeight: '700',
  },
  webMessageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 7,
  },
  webMessageBtnText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  webPendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 3,
  },
  webPendingPillText: {
    color: '#92400E',
    fontSize: 10.5,
    fontWeight: '700',
  },
  webSayHiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 7,
  },
  webSayHiBtnText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  companyMonogramSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  companyMonogramInitial: {
    color: MeshviColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  metaBadgeChip: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: MeshviColors.textSecondary,
  },
  badgeMint: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeMintText: {
    color: '#065F46',
    fontSize: 9.5,
    fontWeight: '800',
  },
  sheetSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },

  // Modals (Say Hi, Company Dossier, Submit Proposal)
  modalOverlayDark: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheetBox: {
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  modalCloseBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagPill: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  tagPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: MeshviColors.textPrimary,
  },
  dataFiltersLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  dataFiltersLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  dataFiltersCountPill: {
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  dataFiltersCountText: {
    color: MeshviColors.white,
    fontSize: 9.5,
    fontWeight: '800',
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  quickFilterChipActive: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },
  quickFilterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: MeshviColors.textPrimary,
  },
  quickFilterChipTextActive: {
    color: MeshviColors.white,
    fontWeight: '700',
  },
  resetFiltersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  resetFiltersChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  clearSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  clearSearchChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  smartDraftCard: {
    backgroundColor: MeshviColors.surfaceMint,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.25)',
    padding: 10,
    marginTop: 12,
    marginBottom: 10,
  },
  smartDraftTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  smartDraftTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  cycleDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  cycleDraftBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: MeshviColors.accent,
  },
  smartDraftHint: {
    fontSize: 10.5,
    color: MeshviColors.accent,
    lineHeight: 14,
    opacity: 0.85,
  },
  modalTextArea: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 12.5,
    color: MeshviColors.textPrimary,
    minHeight: 88,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  charCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  charCountText: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalSecondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  modalSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  companyMetricRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  companyMetricCard: {
    flex: 1,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  companyMetricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  companyMetricLbl: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  companyDossierDesc: {
    fontSize: 12,
    color: MeshviColors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  proposalCategoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  catOptionPill: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  catOptionPillActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  catOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: MeshviColors.textPrimary,
  },
  catOptionTextActive: {
    color: MeshviColors.accent,
    fontWeight: '700',
  },
  ndaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
    padding: 8,
    marginTop: 12,
  },
  ndaBannerText: {
    fontSize: 10.5,
    color: MeshviColors.accent,
    flex: 1,
    lineHeight: 14,
  },
  queryCorrectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  queryCorrectionText: {
    fontSize: 11.5,
    color: '#92400E',
    fontWeight: '500',
  },
  queryCorrectionSubText: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
    fontStyle: 'italic',
  },
  queryCorrectionHighlight: {
    fontWeight: '800',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  queryCorrectionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    marginLeft: 6,
  },
  queryCorrectionBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1F2937',
  },
  matchedCompanyBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  matchedCompanyIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedCompanyBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 0.5,
  },
  matchedCompanyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  matchedCompanyStatusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  matchedCompanyStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6EE7B7',
  },
  matchedCompanyMeta: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: MeshviColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: MeshviColors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
    marginBottom: 16,
  },
  emptyResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyResetBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  webFitScorePill: {
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  webFitScoreText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
});
