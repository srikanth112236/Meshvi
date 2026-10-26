import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { ImageResult } from '../../services/mediaService';

const { width } = Dimensions.get('window');

const DEPARTMENT_OPTIONS = [
  { value: 'Commercial Partnerships & Alliances', label: 'Commercial Partnerships & Alliances', desc: 'Strategic JVs, retail distribution' },
  { value: 'Corporate Strategy & M&A', label: 'Corporate Strategy & M&A', desc: 'Cross-border expansion, venture investment' },
  { value: 'Procurement & Strategic Sourcing', label: 'Procurement & Strategic Sourcing', desc: 'Vendor qualification, RFPs, contracts' },
  { value: 'Supply Chain, Logistics & Distribution', label: 'Supply Chain, Logistics & Distribution', desc: 'Freight forwarding, cross-border fulfillment' },
  { value: 'Technology, AI & Platform Engineering', label: 'Technology, AI & Platform Engineering', desc: 'Enterprise software, infrastructure' },
  { value: 'Enterprise Sales & Business Development', label: 'Enterprise Sales & Business Development', desc: 'B2B commercial growth' },
  { value: 'Finance, Treasury & Trade Operations', label: 'Finance, Treasury & Trade Operations', desc: 'Trade finance, capital deployment' },
  { value: 'Executive Leadership & Board', label: 'Executive Leadership & Board', desc: 'C-Suite oversight, board stewardship' },
];

const SENIORITY_OPTIONS = [
  { value: 'C-Level / Founder', label: 'C-Level', badge: 'Tier 1 Signer' },
  { value: 'VP / Managing Director', label: 'VP / MD', badge: 'Commercial Lead' },
  { value: 'Director / Head of Dept', label: 'Director', badge: 'Sourcing Lead' },
  { value: 'Lead / Principal Specialist', label: 'Lead', badge: 'Evaluator' },
];

const SUGGESTED_HEADLINES = [
  'Head of Commercial Partnerships & Strategic Alliances',
  'VP of Global Corporate Development & Cross-Border M&A',
  'Director of Strategic Sourcing & Enterprise Procurement',
];

const SUGGESTED_SEEKING = [
  'Enterprise retail channel distribution partners across APAC & GCC.',
  'Tier-1 SOC-2 compliant cloud infrastructure & AI integration providers.',
  'B2B co-marketing & co-selling alliances with zero direct product conflict.',
];

const SUGGESTED_OFFERING = [
  'Direct access to 450+ verified enterprise buyer accounts across regions.',
  'Proprietary supply chain orchestration and routing API architecture.',
  'Cross-border B2B co-marketing & co-selling alliance network.',
];

const POPULAR_FIREWALL_PRESETS = [
  'Cold Crypto Pitching',
  'Automated Mass InMails',
  'Offshore Dev Shops',
  'Junior Hiring Headhunters',
];

const COUNTRIES = [
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', defaultCity: 'Singapore' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', defaultCity: 'Dubai' },
  { name: 'United States', code: 'US', flag: '🇺🇸', defaultCity: 'New York' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', defaultCity: 'London' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', defaultCity: 'Frankfurt' },
  { name: 'India', code: 'IN', flag: '🇮🇳', defaultCity: 'Bengaluru' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', defaultCity: 'Tokyo' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', defaultCity: 'Sydney' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭', defaultCity: 'Zurich' },
  { name: 'Hong Kong', code: 'HK', flag: '🇭🇰', defaultCity: 'Hong Kong' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', defaultCity: 'Riyadh' },
  { name: 'France', code: 'FR', flag: '🇫🇷', defaultCity: 'Paris' },
];

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, updateOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Identity & Photo
  const [displayName, setDisplayName] = useState(user?.profile?.displayName || user?.name || 'Aditi Park');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80');
  const [headline, setHeadline] = useState(user?.profile?.headline || 'VP of Global Strategic Sourcing & Partnerships');
  const [summary, setSummary] = useState(user?.profile?.summary || 'Seasoned decision maker leading strategic sourcing and cross-border commercial corridors across global hubs.');
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);

  const handleImageSelected = (result: ImageResult) => {
    const selected = result.base64 || result.uri;
    if (selected) {
      setAvatarUrl(selected);
    }
  };

  // Step 2: Affiliation & Scope
  const [currentCompany, setCurrentCompany] = useState(user?.profile?.currentCompanyName || 'Novus Infrastructure - Singapore Branch');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedCity, setSelectedCity] = useState('Singapore');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [seniority, setSeniority] = useState('VP / Managing Director');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    'Commercial Partnerships & Alliances',
    'Corporate Strategy & M&A',
  ]);

  // Step 3: Commercial Business Intent
  const [lookingFor, setLookingFor] = useState(
    'Enterprise retail channel distribution partners and technology co-selling alliances across APAC.'
  );
  const [offering, setOffering] = useState(
    'Direct access to 450+ verified enterprise buyer accounts and proprietary supply chain orchestration API.'
  );

  // Step 4: Anti-Spam Pitch Firewall & Protocol
  const [firewallTags, setFirewallTags] = useState<string[]>([
    'Unsolicited Lead Gen Agencies',
    'Offshore Staff Augmentation',
    'Cold Financial Advisory Sales',
    'Automated InMail Mass Blasts',
  ]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedProtocols, setSelectedProtocols] = useState<Array<'DEAL_ROOM' | 'SCHEDULED_CALL'>>([
    'DEAL_ROOM',
  ]);

  // Step 5: 5-Second Calibration Modal
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(5);

  const toggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      if (selectedDepartments.length === 1) return;
      setSelectedDepartments(selectedDepartments.filter((d) => d !== dept));
    } else {
      if (selectedDepartments.length >= 5) return;
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  const toggleProtocol = (proto: 'DEAL_ROOM' | 'SCHEDULED_CALL') => {
    if (selectedProtocols.includes(proto)) {
      if (selectedProtocols.length === 1) return;
      setSelectedProtocols(selectedProtocols.filter((p) => p !== proto));
    } else {
      setSelectedProtocols([...selectedProtocols, proto]);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    await updateOnboarding({
      displayName,
      headline,
      summary,
      avatarUrl,
      currentCompanyName: currentCompany,
      countryCode: selectedCountry.code,
      city: selectedCity,
      seniority,
      function: selectedDepartments.join('; '),
      department: selectedDepartments[0],
      firewallRules: firewallTags,
      receptionProtocols: selectedProtocols,
      isCompleted: false,
    });
    setLoading(false);
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // 5-Second Workspace Initialization
  const handleLaunchWorkspace = () => {
    setIsProvisioning(true);
    setProgress(0);
    setSecondsRemaining(5);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
      setSecondsRemaining((prev) => Math.max(0, prev - 0.1));
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      await updateOnboarding({ isCompleted: true });
      setIsProvisioning(false);
    }, 5000);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 34, height: 34, borderRadius: 9, marginRight: 8 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>MESHVI</Text>
            <Text style={styles.brandSubtitle}>Executive Onboarding &bull; Step {step}/5</Text>
          </View>
        </View>

        {step > 1 && (
          <TouchableOpacity onPress={handleBack} style={styles.headerBackBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={14} color={COLORS.primary} />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stepper Navigation Pills */}
      <View style={styles.stepperContainer}>
        {['Identity', 'Scope', 'Intent', 'Firewall', 'Review'].map((title, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isPassed = step > stepNum;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => setStep(stepNum)}
              style={[
                styles.stepPill,
                isActive ? styles.stepPillActive : isPassed ? styles.stepPillPassed : styles.stepPillInactive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.stepPillNum,
                  isActive ? styles.stepPillNumActive : isPassed ? styles.stepPillNumPassed : styles.stepPillNumInactive,
                ]}
              >
                {isPassed ? '✓' : stepNum}
              </Text>
              <Text
                style={[
                  styles.stepPillTitle,
                  isActive ? styles.stepPillTitleActive : isPassed ? styles.stepPillTitlePassed : styles.stepPillTitleInactive,
                ]}
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Body */}
      <ScrollView contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ======================================================== */}
        {/* STEP 1: IDENTITY & EXECUTIVE PORTRAIT                    */}
        {/* ======================================================== */}
        {step === 1 && (
          <View style={styles.cardContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconWrap}>
                <Feather name="user" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.stepTitle}>Executive Identity & Portrait</Text>
                <Text style={styles.stepSubtitle}>Your verified credentials on the MESHVI network.</Text>
              </View>
            </View>

            {/* Avatar Preview */}
            <View style={styles.avatarRow}>
              <TouchableOpacity
                onPress={() => setMediaPickerVisible(true)}
                activeOpacity={0.8}
                style={{ position: 'relative' }}
              >
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                <View style={styles.avatarCameraBadge}>
                  <Feather name="camera" size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <View style={styles.avatarMeta}>
                <Text style={styles.avatarLabel}>Executive Headshot</Text>
                <Text style={styles.avatarSub}>Stored securely with cryptographic ledger hash.</Text>
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={() => setMediaPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="camera" size={13} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.changePhotoText}>Take Selfie or Upload</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Display Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Display Name *</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Rajiv Menon"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Headline */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Executive Headline *</Text>
              <TextInput
                style={styles.input}
                value={headline}
                onChangeText={setHeadline}
                placeholder="e.g. Head of Commercial Partnerships"
                placeholderTextColor={COLORS.textMuted}
              />
              <View style={styles.presetRow}>
                {SUGGESTED_HEADLINES.map((h, i) => (
                  <TouchableOpacity key={i} onPress={() => setHeadline(h)} style={styles.presetChip} activeOpacity={0.7}>
                    <Text style={styles.presetChipText} numberOfLines={1}>+ {h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Executive Summary */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bio & Executive Mandate</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={summary}
                onChangeText={setSummary}
                placeholder="Summary of commercial leadership..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* STEP 2: AFFILIATION & SCOPE                              */}
        {/* ======================================================== */}
        {step === 2 && (
          <View style={styles.cardContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconWrap}>
                <Feather name="briefcase" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.stepTitle}>Corporate Affiliation & Clearance</Text>
                <Text style={styles.stepSubtitle}>Organization scope and department domain.</Text>
              </View>
            </View>

            {/* Company */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Company / Enterprise *</Text>
              <TextInput
                style={styles.input}
                value={currentCompany}
                onChangeText={setCurrentCompany}
                placeholder="e.g. Acme Global Ventures"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Country & City */}
            <View style={styles.dualFieldRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Country (Auto ISO)</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setCountryModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>
                    {selectedCountry.flag} {selectedCountry.code}
                  </Text>
                  <Feather name="chevron-down" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Operating City *</Text>
                <TextInput
                  style={styles.input}
                  value={selectedCity}
                  onChangeText={setSelectedCity}
                  placeholder="e.g. Singapore"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            {/* Seniority Tier */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Seniority & Signing Authority</Text>
              <View style={styles.seniorityGrid}>
                {SENIORITY_OPTIONS.map((s) => {
                  const isSel = seniority === s.value;
                  return (
                    <TouchableOpacity
                      key={s.value}
                      onPress={() => setSeniority(s.value)}
                      style={[styles.seniorityCard, isSel && styles.seniorityCardActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.seniorityTitle, isSel && styles.seniorityTitleActive]}>
                        {s.label}
                      </Text>
                      <Text style={[styles.seniorityBadge, isSel && styles.seniorityBadgeActive]}>{s.badge}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Multi-Department Scope (Up to 5) */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelCountRow}>
                <Text style={styles.fieldLabel}>Primary Department Scope (Up to 5)</Text>
                <Text style={styles.countBadge}>{selectedDepartments.length}/5 Selected</Text>
              </View>
              <View style={styles.deptList}>
                {DEPARTMENT_OPTIONS.map((d) => {
                  const isSel = selectedDepartments.includes(d.value);
                  return (
                    <TouchableOpacity
                      key={d.value}
                      onPress={() => toggleDepartment(d.value)}
                      style={[styles.deptCard, isSel && styles.deptCardActive]}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, paddingRight: 6 }}>
                        <Text style={[styles.deptTitle, isSel && styles.deptTitleActive]}>
                          {d.label}
                        </Text>
                        <Text style={styles.deptDesc}>{d.desc}</Text>
                      </View>
                      <View style={[styles.checkCircle, isSel && styles.checkCircleActive]}>
                        {isSel && <Feather name="check" size={12} color={COLORS.white} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* STEP 3: COMMERCIAL BUSINESS INTENT                       */}
        {/* ======================================================== */}
        {step === 3 && (
          <View style={styles.cardContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconWrap}>
                <MaterialCommunityIcons name="target" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.stepTitle}>Commercial Business Intent</Text>
                <Text style={styles.stepSubtitle}>Calibrate MESHVI's AI Synergy Radar.</Text>
              </View>
            </View>

            {/* Seeking Mandate */}
            <View style={styles.intentCard}>
              <View style={styles.intentCardHeader}>
                <Feather name="search" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.intentCardTitle}>Seeking Mandate (Demand) *</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={lookingFor}
                onChangeText={setLookingFor}
                multiline
                numberOfLines={3}
                placeholder="What partners or solutions are you sourcing?"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.presetLabel}>Quick Presets:</Text>
              {SUGGESTED_SEEKING.map((s, i) => (
                <TouchableOpacity key={i} onPress={() => setLookingFor(s)} style={styles.presetRowItem} activeOpacity={0.7}>
                  <Text style={styles.presetRowText} numberOfLines={1}>+ {s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Offering Value Proposition */}
            <View style={styles.intentCard}>
              <View style={styles.intentCardHeader}>
                <Feather name="star" size={14} color={COLORS.amber} style={{ marginRight: 6 }} />
                <Text style={styles.intentCardTitle}>Value Proposition (Supply) *</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={offering}
                onChangeText={setOffering}
                multiline
                numberOfLines={3}
                placeholder="What distribution or capability does your enterprise offer?"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.presetLabel}>Quick Presets:</Text>
              {SUGGESTED_OFFERING.map((o, i) => (
                <TouchableOpacity key={i} onPress={() => setOffering(o)} style={styles.presetRowItem} activeOpacity={0.7}>
                  <Text style={styles.presetRowText} numberOfLines={1}>+ {o}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Synergy Guarantee Strip */}
            <View style={styles.guaranteeStrip}>
              <MaterialCommunityIcons name="radar" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.guaranteeText}>
                <Text style={{ fontWeight: '800', color: COLORS.text }}>Synergy Radar: </Text>
                Counterparties are matched by bilateral reciprocal alignment. Zero cold spam.
              </Text>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* STEP 4: ANTI-SPAM PITCH FIREWALL & RECEPTION PROTOCOL    */}
        {/* ======================================================== */}
        {step === 4 && (
          <View style={styles.cardContainer}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconWrap, { backgroundColor: '#FFF1F2' }]}>
                <Feather name="shield" size={18} color={COLORS.rose} />
              </View>
              <View>
                <Text style={styles.stepTitle}>Anti-Spam Pitch Firewall</Text>
                <Text style={styles.stepSubtitle}>Intercept unsolicited pitches at the perimeter.</Text>
              </View>
            </View>

            {/* Active Blocked Tags Cloud */}
            <View style={styles.firewallCard}>
              <View style={styles.firewallCardHeader}>
                <Text style={styles.firewallCardTitle}>Active Blocked Tags ({firewallTags.length})</Text>
                <Text style={styles.firewallCardHint}>Tap ✕ to unblock</Text>
              </View>

              <View style={styles.tagCloud}>
                {firewallTags.map((tag) => (
                  <View key={tag} style={styles.firewallPill}>
                    <Text style={styles.firewallPillText}>✕ {tag}</Text>
                    <TouchableOpacity
                      onPress={() => setFirewallTags(firewallTags.filter((t) => t !== tag))}
                      style={{ marginLeft: 6 }}
                    >
                      <Feather name="x" size={12} color={COLORS.rose} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Quick Add Presets */}
              <View style={styles.quickAddRow}>
                <Text style={styles.quickAddLabel}>Quick add: </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {POPULAR_FIREWALL_PRESETS.map((p, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        if (!firewallTags.includes(p)) setFirewallTags([...firewallTags, p]);
                      }}
                      style={styles.quickAddPill}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickAddPillText}>+ {p}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Custom Tag Input */}
              <View style={styles.addTagRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8, height: 42 }]}
                  value={customTagInput}
                  onChangeText={setCustomTagInput}
                  placeholder="Custom blocked keyword..."
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => {
                    if (customTagInput.trim() && !firewallTags.includes(customTagInput.trim())) {
                      setFirewallTags([...firewallTags, customTagInput.trim()]);
                      setCustomTagInput('');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addTagBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reception Protocols */}
            <View style={styles.protocolCard}>
              <View style={styles.protocolCardHeader}>
                <Text style={styles.protocolTitle}>Default Reception Protocol</Text>
                <Text style={styles.protocolBadge}>
                  {selectedProtocols.length === 2 ? 'Both Protocols Active ✓' : '1 Active'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => toggleProtocol('DEAL_ROOM')}
                style={[
                  styles.protocolItem,
                  selectedProtocols.includes('DEAL_ROOM') && styles.protocolItemActive,
                ]}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.protocolRowTitle}>
                    <Feather name="lock" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.protocolName}>Micro Deal Room First</Text>
                  </View>
                  <Text style={styles.protocolDesc}>
                    Require mutual agenda & bilateral NDA before releasing calendar.
                  </Text>
                </View>
                <View style={[styles.checkCircle, selectedProtocols.includes('DEAL_ROOM') && styles.checkCircleActive]}>
                  {selectedProtocols.includes('DEAL_ROOM') && <Feather name="check" size={12} color={COLORS.white} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleProtocol('SCHEDULED_CALL')}
                style={[
                  styles.protocolItem,
                  selectedProtocols.includes('SCHEDULED_CALL') && styles.protocolItemActive,
                ]}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.protocolRowTitle}>
                    <Feather name="calendar" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.protocolName}>Direct Calendar Slot Lock</Text>
                  </View>
                  <Text style={styles.protocolDesc}>
                    Permit 1-click in-stream calendar slot locks upon verified match.
                  </Text>
                </View>
                <View style={[styles.checkCircle, selectedProtocols.includes('SCHEDULED_CALL') && styles.checkCircleActive]}>
                  {selectedProtocols.includes('SCHEDULED_CALL') && <Feather name="check" size={12} color={COLORS.white} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Perimeter Seal Bar */}
            <View style={styles.perimeterSeal}>
              <Feather name="shield" size={16} color={COLORS.emerald} style={{ marginRight: 8 }} />
              <Text style={styles.perimeterSealText}>
                <Text style={{ fontWeight: '800', color: COLORS.emerald }}>Perimeter Engaged: </Text>
                100% of matching unsolicited proposals blocked automatically.
              </Text>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* STEP 5: EXECUTIVE DOSSIER REVIEW                         */}
        {/* ======================================================== */}
        {step === 5 && (
          <View style={styles.cardContainer}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Feather name="check-circle" size={18} color={COLORS.emerald} />
              </View>
              <View>
                <Text style={styles.stepTitle}>Executive Dossier & Credential Review</Text>
                <Text style={styles.stepSubtitle}>Review verified parameters before initializing workspace.</Text>
              </View>
            </View>

            {/* Dossier Card */}
            <View style={styles.dossierCard}>
              <View style={styles.dossierHeader}>
                <Image source={{ uri: avatarUrl }} style={styles.dossierAvatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.dossierName}>{displayName}</Text>
                    <View style={styles.verifiedNodeBadge}>
                      <Text style={styles.verifiedNodeText}>Verified Node ✓</Text>
                    </View>
                  </View>
                  <Text style={styles.dossierHeadline}>{headline}</Text>
                  <Text style={styles.dossierOrg}>
                    {currentCompany} &bull; {selectedCity}, {selectedCountry.code}
                  </Text>
                </View>
              </View>

              {/* Department Scope Chips */}
              <View style={styles.dossierSection}>
                <View style={styles.dossierSectionHeader}>
                  <Text style={styles.dossierSectionTitle}>Authorized Department Scope ({selectedDepartments.length}/5):</Text>
                  <TouchableOpacity onPress={() => setStep(2)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.deptChipRow}>
                  {selectedDepartments.map((dept) => (
                    <View key={dept} style={styles.dossierDeptChip}>
                      <Text style={styles.dossierDeptText}>{dept}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Intent Summary */}
              <View style={styles.dossierSection}>
                <View style={styles.dossierSectionHeader}>
                  <Text style={styles.dossierSectionTitle}>Bilateral Mandate:</Text>
                  <TouchableOpacity onPress={() => setStep(3)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.dossierIntentItem}>
                  <Text style={{ fontWeight: '800', color: COLORS.text }}>Seeking: </Text>
                  {lookingFor}
                </Text>
                <Text style={styles.dossierIntentItem}>
                  <Text style={{ fontWeight: '800', color: COLORS.text }}>Offering: </Text>
                  {offering}
                </Text>
              </View>

              {/* Firewall & Protocols */}
              <View style={styles.dossierSection}>
                <View style={styles.dossierSectionHeader}>
                  <Text style={styles.dossierSectionTitle}>Firewall & Protocol:</Text>
                  <TouchableOpacity onPress={() => setStep(4)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.dossierIntentItem}>
                  <Text style={{ fontWeight: '800', color: COLORS.rose }}>Blocked: </Text>
                  {firewallTags.slice(0, 3).join(', ')} +{Math.max(0, firewallTags.length - 3)} more
                </Text>
                <Text style={styles.dossierIntentItem}>
                  <Text style={{ fontWeight: '800', color: COLORS.primary }}>Reception: </Text>
                  {selectedProtocols.map((p) => (p === 'DEAL_ROOM' ? 'Micro Deal Room' : 'Calendar Lock')).join(' & ')}
                </Text>
              </View>
            </View>

            {/* Launch Workspace Button */}
            <TouchableOpacity
              style={styles.launchBtn}
              onPress={handleLaunchWorkspace}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[COLORS.primary, '#0040D0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.launchGradient}
              >
                <Text style={styles.launchBtnText}>Authorize & Initialize MESHVI Workspace (5s)</Text>
                <Feather name="arrow-right" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.bottomBackBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.bottomBackText}>Back to Step {step - 1}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.bottomStepLabel}>Step 1: Executive Identity</Text>
        )}

        {step < 5 ? (
          <TouchableOpacity
            style={styles.bottomNextBtn}
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.bottomNextText}>Continue to Step {step + 1}</Text>
                <Feather name="arrow-right" size={14} color={COLORS.white} style={{ marginLeft: 4 }} />
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bottomNextBtn}
            onPress={handleLaunchWorkspace}
            activeOpacity={0.88}
          >
            <Text style={styles.bottomNextText}>Launch (5s) →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Country Selection Modal */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Operating Country & Hub</Text>
              <TouchableOpacity onPress={() => { setCountryModalVisible(false); setCountrySearchQuery(''); }}>
                <Feather name="x" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Country Search Bar */}
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', marginBottom: 12, height: 42 }]}>
              <Feather name="search" size={15} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 13, color: COLORS.text }}
                placeholder="Search country or city..."
                placeholderTextColor={COLORS.textMuted}
                value={countrySearchQuery}
                onChangeText={setCountrySearchQuery}
              />
              {countrySearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearchQuery('')}>
                  <Feather name="x" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {COUNTRIES.filter(
                (c) =>
                  !countrySearchQuery.trim() ||
                  c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                  c.defaultCity.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                  c.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
              ).map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => {
                    setSelectedCountry(c);
                    setSelectedCity(c.defaultCity);
                    setCountryModalVisible(false);
                    setCountrySearchQuery('');
                  }}
                  style={styles.modalItem}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalItemFlag}>{c.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.modalItemName}>{c.name}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.textMuted }}>Hub: {c.defaultCity}</Text>
                  </View>
                  <Text style={styles.modalItemCode}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5-Second Calibration Modal */}
      <Modal visible={isProvisioning} transparent animationType="fade">
        <View style={styles.calibrationOverlay}>
          <View style={styles.calibrationCard}>
            <View style={styles.calibrationIconCircle}>
              <MaterialCommunityIcons name="radar" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.calibrationPill}>
              CALIBRATING WORKSPACE &bull; {Math.round(progress)}% &bull; {Math.ceil(secondsRemaining)}s
            </Text>
            <Text style={styles.calibrationTitle}>
              Initializing Node for {displayName}
            </Text>
            <Text style={styles.calibrationDesc}>
              Routing bilateral clearance across {selectedDepartments.length} departments and sealing pitch firewall barrier.
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.stageList}>
              <Text style={styles.stageItem}>✓ Cryptographic identity ledger sealed</Text>
              <Text style={styles.stageItem}>✓ {selectedDepartments.length} department routes cleared</Text>
              <Text style={styles.stageItem}>✓ {firewallTags.length} perimeter pitch filters engaged</Text>
              <Text style={styles.stageItem}>✓ Synergy radar activated</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Media Picker Modal for Identity Verification Selfie or Photo Upload */}
      <MediaPickerModal
        visible={mediaPickerVisible}
        onClose={() => setMediaPickerVisible(false)}
        onImageSelected={handleImageSelected}
        title="Executive Verification Portrait"
        subtitle="Capture an executive selfie or upload your corporate headshot to verify your signing identity."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  logoLetter: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  brandTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerBackText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  stepPillActive: {
    backgroundColor: COLORS.primary,
  },
  stepPillPassed: {
    backgroundColor: '#ECFDF5',
  },
  stepPillInactive: {
    backgroundColor: COLORS.cardAlt,
  },
  stepPillNum: {
    fontSize: 10,
    fontWeight: '900',
    marginRight: 3,
  },
  stepPillNumActive: {
    color: COLORS.white,
  },
  stepPillNumPassed: {
    color: COLORS.emerald,
  },
  stepPillNumInactive: {
    color: COLORS.textMuted,
  },
  stepPillTitle: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepPillTitleActive: {
    color: COLORS.white,
  },
  stepPillTitlePassed: {
    color: COLORS.emerald,
  },
  stepPillTitleInactive: {
    color: COLORS.textMuted,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 24,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  stepSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardAlt,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarMeta: {
    flex: 1,
    marginLeft: 14,
  },
  avatarLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  avatarSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  changePhotoText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: 13,
    paddingHorizontal: 12,
    height: 46,
  },
  textArea: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  presetChip: {
    backgroundColor: COLORS.cardAlt,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  dualFieldRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  dropdownText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  seniorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seniorityCard: {
    width: '48%',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 8,
  },
  seniorityCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  seniorityTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  seniorityTitleActive: {
    color: COLORS.primary,
  },
  seniorityBadge: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  seniorityBadgeActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  labelCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  countBadge: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  deptList: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  deptCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  deptTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  deptTitleActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  deptDesc: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  checkCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intentCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  intentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  intentCardTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  presetLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  presetRowItem: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetRowText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  guaranteeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  guaranteeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  firewallCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  firewallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  firewallCardTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  firewallCardHint: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  firewallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  firewallPillText: {
    color: COLORS.rose,
    fontSize: 11,
    fontWeight: '700',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickAddLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginRight: 6,
  },
  quickAddPill: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAddPillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTagBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  protocolCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  protocolCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  protocolTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  protocolBadge: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  protocolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  protocolItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  protocolRowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  protocolName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  protocolDesc: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  perimeterSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  perimeterSealText: {
    flex: 1,
    color: COLORS.emerald,
    fontSize: 11,
    lineHeight: 16,
  },
  dossierCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dossierAvatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dossierName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    marginRight: 6,
  },
  verifiedNodeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedNodeText: {
    color: COLORS.emerald,
    fontSize: 9,
    fontWeight: '800',
  },
  dossierHeadline: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  dossierOrg: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  dossierSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dossierSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dossierSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  editLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  deptChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dossierDeptChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dossierDeptText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '600',
  },
  dossierIntentItem: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  launchBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  launchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  launchBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomBackText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomStepLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  bottomNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomNextText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemFlag: {
    fontSize: 20,
    marginRight: 10,
  },
  modalItemName: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalItemCode: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  calibrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calibrationCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  calibrationIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
  },
  calibrationPill: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  calibrationTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  calibrationDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.cardAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  stageList: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.cardAlt,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stageItem: {
    color: COLORS.emerald,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
});
