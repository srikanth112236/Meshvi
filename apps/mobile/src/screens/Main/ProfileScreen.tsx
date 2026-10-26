import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { ImageResult } from '../../services/mediaService';
import { Profile, Intent } from '../../types';

const { width } = Dimensions.get('window');

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
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', defaultCity: 'Riyadh' },
  { name: 'France', code: 'FR', flag: '🇫🇷', defaultCity: 'Paris' },
];

const SENIORITY_LEVELS = [
  'C-Level / Founder',
  'VP / Managing Director',
  'Director / Head of Dept',
  'Lead / Principal Specialist',
];

const DEPARTMENT_LIST = [
  'Commercial Partnerships & Alliances',
  'Corporate Strategy & M&A',
  'Procurement & Strategic Sourcing',
  'Supply Chain, Logistics & Distribution',
  'Technology, AI & Platform Engineering',
  'Enterprise Sales & Business Development',
  'Finance, Treasury & Trade Operations',
  'Executive Leadership & Board',
];

const INDUSTRY_LIST = [
  'Renewable Energy & CleanTech',
  'Supply Chain & Logistics',
  'FinTech & Digital Banking',
  'Healthcare & Life Sciences',
  'Retail & Cross-Border E-Commerce',
  'Maritime, Aerospace & Freight',
  'Manufacturing & Industrial Infrastructure',
  'Enterprise Software & AI Infrastructure',
];

export interface ProfileScreenProps {
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { user, logout, updateOnboarding } = useAuth();
  const { showConfirm, showSuccess, showError } = useModal();
  const profile = user?.profile;

  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>(
    profile?.avatarUrl ||
      user?.avatarUrl ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  );

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editActiveTab, setEditActiveTab] = useState<'IDENTITY' | 'COMPANY' | 'MANDATES'>('IDENTITY');
  const [isSaving, setIsSaving] = useState(false);

  // Edit Fields State (Prepopulated from user profile or onboarding defaults)
  const [editDisplayName, setEditDisplayName] = useState(
    profile?.displayName || user?.name || 'Aditi Park'
  );
  const [editHeadline, setEditHeadline] = useState(
    profile?.headline || 'VP of Global Strategic Sourcing & Partnerships'
  );
  const [editTitle, setEditTitle] = useState(
    profile?.currentTitle || 'VP of Global Strategic Sourcing & Partnerships'
  );
  const [editSeniority, setEditSeniority] = useState(
    profile?.seniority || 'VP / Managing Director'
  );
  const [editFunction, setEditFunction] = useState(
    profile?.function || profile?.department || 'Sourcing & Supply Chain'
  );
  const [editSummary, setEditSummary] = useState(
    profile?.summary ||
      'Seasoned decision maker leading strategic sourcing and cross-border commercial corridors across global hubs.'
  );

  // Company Data Fields
  const [editCompanyName, setEditCompanyName] = useState(
    profile?.currentCompanyName || 'Novus Infrastructure - Singapore Branch'
  );
  const [editCorporateLineage, setEditCorporateLineage] = useState(
    profile?.corporateLineage || 'Parent: Novus Global Holdings AG (Zurich)'
  );
  const [editIndustry, setEditIndustry] = useState(
    profile?.industry || 'Renewable Energy & CleanTech'
  );
  const [editSubIndustry, setEditSubIndustry] = useState(
    profile?.subIndustry || 'Cross-Border Infrastructure & Duty-Free Trade'
  );
  const [editCity, setEditCity] = useState(profile?.city || 'Singapore');
  const [editCountryCode, setEditCountryCode] = useState(profile?.countryCode || 'SG');
  const [editDomain, setEditDomain] = useState(profile?.domain || 'novus-infrastructure.com');

  // Strategic Mandates Fields
  const existingLooking =
    profile?.intents?.find((i) => i.intentType === 'LOOKING_FOR')?.description ||
    'Enterprise retail channel distribution partners and technology co-selling alliances across APAC & GCC transit corridors.';
  const existingOffering =
    profile?.intents?.find((i) => i.intentType === 'OFFERING')?.description ||
    'Direct access to 450+ verified enterprise buyer accounts and proprietary supply chain orchestration API.';

  const [editLookingFor, setEditLookingFor] = useState(existingLooking);
  const [editOffering, setEditOffering] = useState(existingOffering);

  // Firewall & Protocols
  const [firewallTags, setFirewallTags] = useState<string[]>(
    profile?.firewallRules || [
      'Unsolicited Lead Gen Agencies',
      'Offshore Staff Augmentation',
      'Cold Financial Advisory Sales',
      'Automated InMail Mass Blasts',
    ]
  );
  const [newTag, setNewTag] = useState('');
  const [protocols, setProtocols] = useState<Array<'DEAL_ROOM' | 'SCHEDULED_CALL'>>(
    profile?.receptionProtocols || ['DEAL_ROOM']
  );

  const toggleProtocol = async (proto: 'DEAL_ROOM' | 'SCHEDULED_CALL') => {
    let updated: Array<'DEAL_ROOM' | 'SCHEDULED_CALL'>;
    if (protocols.includes(proto)) {
      if (protocols.length === 1) return;
      updated = protocols.filter((p) => p !== proto);
    } else {
      updated = [...protocols, proto];
    }
    setProtocols(updated);
    await updateOnboarding({ receptionProtocols: updated });
  };

  const addTag = async () => {
    if (!newTag.trim() || firewallTags.includes(newTag.trim())) return;
    const updated = [...firewallTags, newTag.trim()];
    setFirewallTags(updated);
    setNewTag('');
    await updateOnboarding({ firewallRules: updated });
  };

  const removeTag = async (tag: string) => {
    const updated = firewallTags.filter((t) => t !== tag);
    setFirewallTags(updated);
    await updateOnboarding({ firewallRules: updated });
  };

  const handleImageSelected = async (result: ImageResult) => {
    if (result.error) {
      showError('Media Permission Required', result.error);
      return;
    }
    const newUri = result.base64 || result.uri;
    if (newUri) {
      setCurrentAvatar(newUri);
      await updateOnboarding({ avatarUrl: newUri });
      showSuccess(
        'Executive Portrait Updated',
        'Your verified portrait has been synchronized across the enterprise network.'
      );
    }
  };

  const handleSaveProfileAndCompany = async () => {
    if (!editDisplayName.trim()) {
      showError('Name Required', 'Please provide a valid executive display name.');
      return;
    }
    if (!editCompanyName.trim()) {
      showError('Company Required', 'Please provide your organization name.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedIntents: Intent[] = [
        { intentType: 'LOOKING_FOR', description: editLookingFor.trim() },
        { intentType: 'OFFERING', description: editOffering.trim() },
      ];

      const patchData: Partial<Profile> = {
        displayName: editDisplayName.trim(),
        headline: editHeadline.trim(),
        currentTitle: editTitle.trim(),
        seniority: editSeniority,
        function: editFunction,
        department: editFunction,
        summary: editSummary.trim(),
        currentCompanyName: editCompanyName.trim(),
        corporateLineage: editCorporateLineage.trim(),
        industry: editIndustry,
        subIndustry: editSubIndustry.trim(),
        city: editCity.trim(),
        countryCode: editCountryCode,
        domain: editDomain.trim(),
        intents: updatedIntents,
        firewallRules: firewallTags,
        receptionProtocols: protocols,
      };

      const res = await updateOnboarding(patchData);
      if (res.success) {
        setIsEditModalVisible(false);
        showSuccess(
          'Dossier Synchronized 🎖️',
          'Your executive profile, company lineage, and commercial mandates have been updated successfully.'
        );
      } else {
        showError('Update Failed', res.error || 'Unable to synchronize profile.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Sign Out of Executive Node',
      message:
        'Are you sure you want to log out? Your encrypted enterprise session will be safely terminated on this terminal.',
      confirmText: 'Sign Out',
      cancelText: 'Stay Connected',
      isDestructive: true,
      badgeText: 'SECURITY PROTOCOL',
      onConfirm: logout,
    });
  };

  const currentCountry = COUNTRIES.find((c) => c.code === editCountryCode) || COUNTRIES[0];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* 1. Standard Top Header with Back Button */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={17} color={MeshviColors.primary} />
            </TouchableOpacity>
          )}
          <View style={{ marginLeft: onBack ? 8 : 0 }}>
            <View style={styles.headerKickerRow}>
              <Feather name="shield" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.headerKicker}>Executive Clearance Node</Text>
            </View>
            <Text style={styles.headerTitle}>Executive Profile</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editDossierBtn}
          onPress={() => setIsEditModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="edit-3" size={12} color={MeshviColors.white} style={{ marginRight: 4 }} />
          <Text style={styles.editDossierBtnText}>Edit All Data</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 2. Executive Portrait & Identity Dossier Card */}
        <View style={styles.dossierCard}>
          <View style={styles.dossierTop}>
            <TouchableOpacity
              onPress={() => setMediaPickerVisible(true)}
              style={styles.avatarTouchable}
              activeOpacity={0.8}
            >
              <Image source={{ uri: currentAvatar }} style={styles.avatar} />
              <View style={styles.cameraIconBadge}>
                <Feather name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {profile?.displayName || user?.name || editDisplayName}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified Node ✓</Text>
                </View>
              </View>
              <Text style={styles.userRole} numberOfLines={1}>
                {profile?.headline || editHeadline}
              </Text>
              <Text style={styles.userOrg} numberOfLines={1}>
                {profile?.currentCompanyName || editCompanyName} &bull; {profile?.city || editCity},{' '}
                {profile?.countryCode || editCountryCode}
              </Text>
            </View>
          </View>

          <View style={styles.seniorityRow}>
            <Text style={styles.seniorityLabel}>CLEARANCE TIER:</Text>
            <Text style={styles.seniorityValue}>
              {profile?.seniority || editSeniority} (Signing Authority)
            </Text>
          </View>

          {Boolean(profile?.summary || editSummary) && (
            <Text style={styles.summaryText}>{profile?.summary || editSummary}</Text>
          )}
        </View>

        {/* 3. Company & Corporate Credentials Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="briefcase" size={15} color={MeshviColors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Company & Corporate Affiliation</Text>
            </View>
            <TouchableOpacity onPress={() => { setEditActiveTab('COMPANY'); setIsEditModalVisible(true); }}>
              <Text style={styles.sectionEditLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridInfoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Entity Name:</Text>
              <Text style={styles.infoRowVal}>{profile?.currentCompanyName || editCompanyName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Corporate Lineage:</Text>
              <Text style={styles.infoRowVal}>
                {profile?.corporateLineage || editCorporateLineage}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Industry Sector:</Text>
              <Text style={styles.infoRowVal}>{profile?.industry || editIndustry}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Sub-Sector:</Text>
              <Text style={styles.infoRowVal}>{profile?.subIndustry || editSubIndustry}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Headquarters:</Text>
              <Text style={styles.infoRowVal}>
                {currentCountry.flag} {profile?.city || editCity}, {currentCountry.name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Verified Domain:</Text>
              <Text style={[styles.infoRowVal, { color: MeshviColors.accent }]}>
                {profile?.domain || editDomain}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Strategic Commercial Mandates Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="target" size={15} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Strategic Commercial Mandates</Text>
            </View>
            <TouchableOpacity onPress={() => { setEditActiveTab('MANDATES'); setIsEditModalVisible(true); }}>
              <Text style={styles.sectionEditLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mandateBox}>
            <Text style={styles.mandateHeader}>Seeking Alliances (Looking For)</Text>
            <Text style={styles.mandateBody}>"{editLookingFor}"</Text>
          </View>

          <View style={[styles.mandateBox, { marginTop: 8 }]}>
            <Text style={styles.mandateHeader}>Capabilities & Supply (Offering)</Text>
            <Text style={styles.mandateBody}>"{editOffering}"</Text>
          </View>
        </View>

        {/* 5. Live Pitch Firewall Manager */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="shield" size={15} color={COLORS.rose} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Anti-Spam Pitch Firewall</Text>
            </View>
            <Text style={styles.sectionCount}>{firewallTags.length} Interceptors</Text>
          </View>

          <Text style={styles.sectionDesc}>
            Incoming proposals containing these keywords are automatically intercepted and quarantined.
          </Text>

          {/* Tags Cloud */}
          <View style={styles.tagCloud}>
            {firewallTags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagPillText}>✕ {tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)} style={{ marginLeft: 6 }}>
                  <Feather name="x" size={12} color={COLORS.rose} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add Tag */}
          <View style={styles.addTagRow}>
            <TextInput
              style={styles.tagInput}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add blocked topic or vendor category..."
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addTag} activeOpacity={0.8}>
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Reception Protocols */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="lock" size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Reception Protocols</Text>
            </View>
            <Text style={styles.protocolCount}>
              {protocols.length === 2 ? 'Both Protocols Active' : '1 Active'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.protocolRow, protocols.includes('DEAL_ROOM') && styles.protocolRowActive]}
            onPress={() => toggleProtocol('DEAL_ROOM')}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.protocolName}>Micro Deal Room First</Text>
              <Text style={styles.protocolSub}>Require mutual agenda and NDA before unlocking calendar.</Text>
            </View>
            <View style={[styles.checkCircle, protocols.includes('DEAL_ROOM') && styles.checkCircleActive]}>
              {protocols.includes('DEAL_ROOM') && <Feather name="check" size={12} color={COLORS.white} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.protocolRow, protocols.includes('SCHEDULED_CALL') && styles.protocolRowActive]}
            onPress={() => toggleProtocol('SCHEDULED_CALL')}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.protocolName}>Direct Calendar Slot Lock</Text>
              <Text style={styles.protocolSub}>Allow 1-click in-stream calendar reservations upon verified match.</Text>
            </View>
            <View style={[styles.checkCircle, protocols.includes('SCHEDULED_CALL') && styles.checkCircleActive]}>
              {protocols.includes('SCHEDULED_CALL') && <Feather name="check" size={12} color={COLORS.white} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* 7. Logout Action */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Feather name="log-out" size={15} color={COLORS.rose} style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Sign Out of Executive Node</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================
          FULL EDIT DOSSIER MODAL (ALL ONBOARDING & COMPANY DATA)
         ======================================================== */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '92%' }]}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Edit Dossier & Company</Text>
                <Text style={styles.modalSubTitle}>
                  Update identity, enterprise credentials & mandates
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Segmented Form Tabs */}
            <View style={styles.formTabRow}>
              <TouchableOpacity
                style={[styles.formTab, editActiveTab === 'IDENTITY' && styles.formTabActive]}
                onPress={() => setEditActiveTab('IDENTITY')}
              >
                <Text style={[styles.formTabText, editActiveTab === 'IDENTITY' && styles.formTabTextActive]}>
                  👤 Identity
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formTab, editActiveTab === 'COMPANY' && styles.formTabActive]}
                onPress={() => setEditActiveTab('COMPANY')}
              >
                <Text style={[styles.formTabText, editActiveTab === 'COMPANY' && styles.formTabTextActive]}>
                  🏢 Company
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formTab, editActiveTab === 'MANDATES' && styles.formTabActive]}
                onPress={() => setEditActiveTab('MANDATES')}
              >
                <Text style={[styles.formTabText, editActiveTab === 'MANDATES' && styles.formTabTextActive]}>
                  🎯 Mandates
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1, maxHeight: 420, marginTop: 12 }}>
              {editActiveTab === 'IDENTITY' && (
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={styles.inputLabel}>Full Name / Display Name</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editDisplayName}
                      onChangeText={setEditDisplayName}
                      placeholder="e.g. Aditi Park"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Professional Headline</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editHeadline}
                      onChangeText={setEditHeadline}
                      placeholder="e.g. VP of Global Strategic Sourcing"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Current Executive Title</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      placeholder="e.g. Vice President, Strategic Partnerships"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Seniority Tier</Text>
                    <View style={styles.chipOptionRow}>
                      {SENIORITY_LEVELS.map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.chipOption, editSeniority === s && styles.chipOptionActive]}
                          onPress={() => setEditSeniority(s)}
                        >
                          <Text style={[styles.chipOptionText, editSeniority === s && styles.chipOptionTextActive]}>
                            {s}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Functional Department</Text>
                    <View style={styles.chipOptionRow}>
                      {DEPARTMENT_LIST.slice(0, 4).map((d) => (
                        <TouchableOpacity
                          key={d}
                          style={[styles.chipOption, editFunction === d && styles.chipOptionActive]}
                          onPress={() => setEditFunction(d)}
                        >
                          <Text style={[styles.chipOptionText, editFunction === d && styles.chipOptionTextActive]} numberOfLines={1}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Executive Bio & Scope</Text>
                    <TextInput
                      style={[styles.formInput, { height: 75, textAlignVertical: 'top' }]}
                      value={editSummary}
                      onChangeText={setEditSummary}
                      placeholder="Summarize your corporate mandate, deal approval thresholds, and scope..."
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                    />
                  </View>
                </View>
              )}

              {editActiveTab === 'COMPANY' && (
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={styles.inputLabel}>Company / Organization Name</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editCompanyName}
                      onChangeText={setEditCompanyName}
                      placeholder="e.g. Novus Infrastructure - Singapore Branch"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Parent Holding / Corporate Lineage</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editCorporateLineage}
                      onChangeText={setEditCorporateLineage}
                      placeholder="e.g. Parent: Novus Global Holdings AG (Zurich)"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Industry Sector</Text>
                    <View style={styles.chipOptionRow}>
                      {INDUSTRY_LIST.slice(0, 4).map((ind) => (
                        <TouchableOpacity
                          key={ind}
                          style={[styles.chipOption, editIndustry === ind && styles.chipOptionActive]}
                          onPress={() => setEditIndustry(ind)}
                        >
                          <Text style={[styles.chipOptionText, editIndustry === ind && styles.chipOptionTextActive]} numberOfLines={1}>
                            {ind}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Sub-Sector Specialization</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editSubIndustry}
                      onChangeText={setEditSubIndustry}
                      placeholder="e.g. Bonded Airport Logistics & Duty-Free Trade"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Headquarters City</Text>
                      <TextInput
                        style={styles.formInput}
                        value={editCity}
                        onChangeText={setEditCity}
                        placeholder="e.g. Singapore"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Country Code</Text>
                      <View style={styles.countryPillRow}>
                        {COUNTRIES.slice(0, 4).map((c) => (
                          <TouchableOpacity
                            key={c.code}
                            style={[styles.countryChip, editCountryCode === c.code && styles.countryChipActive]}
                            onPress={() => {
                              setEditCountryCode(c.code);
                              if (!editCity) setEditCity(c.defaultCity);
                            }}
                          >
                            <Text style={styles.countryChipText}>{c.flag} {c.code}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Corporate Website / Domain</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editDomain}
                      onChangeText={setEditDomain}
                      placeholder="e.g. novus-infrastructure.com"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}

              {editActiveTab === 'MANDATES' && (
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={styles.inputLabel}>Strategic Mandates Seeking (Looking For)</Text>
                    <TextInput
                      style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                      value={editLookingFor}
                      onChangeText={setEditLookingFor}
                      placeholder="Describe the cross-border distribution channels, technology integrations, or volume procurement mandates your organization is looking for..."
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Institutional Capabilities (Offering)</Text>
                    <TextInput
                      style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                      value={editOffering}
                      onChangeText={setEditOffering}
                      placeholder="Describe the regional customer access, licensed distribution corridors, API infrastructure, or verified capacity your organization offers..."
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bottom Modal Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSaveProfileAndCompany}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="check" size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalSaveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Media Picker Modal */}
      <MediaPickerModal
        visible={mediaPickerVisible}
        onClose={() => setMediaPickerVisible(false)}
        onImageSelected={handleImageSelected}
        title="Executive Portrait & Biometrics"
        subtitle="Take an instant selfie or select a verified corporate headshot from your library."
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
    borderRadius: 7,
    backgroundColor: COLORS.surfaceMuted,
  },
  headerKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  headerKicker: {
    fontSize: 9.5,
    fontWeight: '800',
    color: MeshviColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  editDossierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  editDossierBtnText: {
    color: MeshviColors.white,
    fontSize: 10.5,
    fontWeight: '800',
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  dossierCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dossierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    color: COLORS.text,
    fontSize: 14.5,
    fontWeight: '900',
    marginRight: 6,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    color: COLORS.emerald,
    fontSize: 8.5,
    fontWeight: '800',
  },
  userRole: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  userOrg: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  seniorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  seniorityLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginRight: 6,
  },
  seniorityValue: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
  },
  summaryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 15,
    marginTop: 8,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionEditLink: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  sectionCount: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  sectionDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    marginBottom: 8,
  },

  // Grid Info
  gridInfoBox: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  infoRowLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    width: 115,
  },
  infoRowVal: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },

  // Mandate Box
  mandateBox: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mandateHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  mandateBody: {
    fontSize: 10.5,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 14,
  },

  // Firewall Tags
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.rose,
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    color: COLORS.text,
  },
  addTagBtn: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addTagBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },

  // Protocols
  protocolCount: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  protocolRowActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  protocolName: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
  protocolSub: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 6,
  },
  logoutBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.rose,
  },

  // Modal Styles
  modalOverlayDark: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheetBox: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  modalSubTitle: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted,
  },

  // Form Tabs
  formTabRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  formTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: COLORS.surfaceMuted,
  },
  formTabActive: {
    backgroundColor: COLORS.primary,
  },
  formTabText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  formTabTextActive: {
    color: '#FFF',
  },

  // Form Inputs
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11.5,
    color: COLORS.text,
  },
  chipOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chipOption: {
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipOptionActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipOptionText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  chipOptionTextActive: {
    color: COLORS.primary,
  },
  countryPillRow: {
    flexDirection: 'row',
    gap: 4,
  },
  countryChip: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  countryChipText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Modal Actions
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  modalSaveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.primary,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalSaveBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFF',
  },
});
