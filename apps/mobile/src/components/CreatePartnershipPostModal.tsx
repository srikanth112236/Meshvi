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
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, MeshviColors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { validatePartnershipMandateApi, MandateValidationAnalysis } from '../services/aiService';
import { PartnershipPost } from '../screens/Main/PartnershipsScreen';

const { width, height } = Dimensions.get('window');

export const CORPORATE_BANNER_PRESETS = [
  {
    id: 'supply-chain',
    label: 'Supply Chain & Logistics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cross-border',
    label: 'Cross-Border JV & Trade',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tech-cloud',
    label: 'Enterprise Infrastructure',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pharma-health',
    label: 'Pharma & Biotech Corridors',
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
];

export const MANDATE_TYPES = [
  { id: 'jointventure', label: '🤝 Joint Venture', tag: 'jointventure' },
  { id: 'distribution', label: '📦 Distribution & Channel', tag: 'distribution' },
  { id: 'sourcing', label: '🏭 OEM & Sourcing', tag: 'oemsourcing' },
  { id: 'investment', label: '💰 Co-Investment', tag: 'coinvestment' },
  { id: 'licensing', label: '⚡ Tech Licensing', tag: 'techlicensing' },
  { id: 'crossborder', label: '🌐 Cross-Border Corridor', tag: 'crossborder' },
];

interface CreatePartnershipPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: PartnershipPost) => void;
}

export const CreatePartnershipPostModal: React.FC<CreatePartnershipPostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showSuccess, showError } = useModal();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('jointventure');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CONNECTIONS_ONLY'>('PUBLIC');
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');

  const [tags, setTags] = useState<string[]>(['partnership', 'b2bcommerce']);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const [isPreview, setIsPreview] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<MandateValidationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authorDisplayName = user?.profile?.displayName || user?.name || 'Srikanth';
  const authorRole = user?.profile?.currentTitle || 'Verified Business Executive';
  const authorCompany = user?.profile?.currentCompanyName || 'Corporate Enterprise';
  const authorInitial = authorDisplayName.trim()[0]?.toUpperCase() || 'S';

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsPreview(false);
      setIsAudienceDropdownOpen(false);
    }
  }, [isOpen]);

  // Debounced auto-evaluate with AI
  useEffect(() => {
    if (!isOpen) {
      setValidationResult(null);
      setIsValidating(false);
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 5 && trimmedContent.length < 15) {
      setValidationResult(null);
      setIsValidating(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      const res = await validatePartnershipMandateApi({
        title: trimmedTitle,
        content: trimmedContent,
        tags,
      });
      setValidationResult(res);
      setIsValidating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [title, content, tags, isOpen]);

  const handleManualValidate = async () => {
    if (!title.trim() && !content.trim()) {
      setError('Please enter a title and requirements before verifying.');
      return;
    }
    setError(null);
    setIsValidating(true);
    const res = await validatePartnershipMandateApi({
      title: title.trim(),
      content: content.trim(),
      tags,
    });
    setValidationResult(res);
    setIsValidating(false);
  };

  const handleApplySuggestedRewrite = () => {
    if (!validationResult?.suggestedRewrite) return;
    setTitle(validationResult.suggestedRewrite.title);
    setContent(validationResult.suggestedRewrite.content);
    setValidationResult({
      isCompliant: true,
      score: 95,
      classification: 'COMMERCIAL_PARTNERSHIP',
      flagReason: null,
      politeFeedback: 'Converted to executive B2B format with clear bilateral scope and counterpart criteria.',
      suggestedRemedy: null,
      suggestedRewrite: null,
      detectedThemes: ['B2BPartnership', 'CommercialMandate'],
    });
    setError(null);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showError('Permission Required', 'Please allow photo gallery access to upload corporate banners.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setImageName('Corporate Visual Banner');
        setError(null);
      }
    } catch {
      showError('Upload Error', 'Could not access device media gallery.');
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.replace(/^#/, '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) return;
    if (tags.length >= 12) {
      setError('Maximum 12 tags allowed per mandate.');
      return;
    }
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
    setShowTagInput(false);
    setError(null);
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please provide a partnership title.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide a partnership description.');
      return;
    }

    // Strict AI Guardrail check before submission
    let check = validationResult;
    if (!check) {
      setIsValidating(true);
      check = await validatePartnershipMandateApi({
        title: title.trim(),
        content: content.trim(),
        tags,
      });
      setIsValidating(false);
      setValidationResult(check);
    }

    if (check && !check.isCompliant) {
      setError(
        'Submission Blocked: MESHVI Partnerships is reserved exclusively for bilateral commercial partnerships, joint ventures, co-investments, supplier alliances, or corporate business interests. Please review the AI guidance below and revise your post or tap "Convert to Mandate".'
      );
      setIsPreview(false);
      return;
    }

    setIsSubmitting(true);

    const newPost: PartnershipPost = {
      id: `post-${Date.now()}`,
      authorId: user?.id || 'usr-srikanth-01',
      authorName: authorDisplayName,
      authorRole: authorRole,
      authorCompany: authorCompany,
      authorAvatar: user?.profile?.avatarUrl || null,
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUri || null,
      visibility,
      tags,
      likesCount: 0,
      commentsCount: 0,
      resharesCount: 0,
      impressionsCount: 1,
      createdAt: 'Just now',
      isLiked: false,
      dealTeaser: {
        scope: selectedIntent === 'jointventure' ? 'Joint Venture' : 'Distribution',
        volumeThreshold: '$5M - $25M USD Annualized',
        geographicReach: 'Global Bilateral Corridors',
        isGated: false,
      },
    };

    setTimeout(() => {
      onPostCreated(newPost);
      setIsSubmitting(false);
      setTitle('');
      setContent('');
      setImageUri(null);
      setImageName('');
      setTags(['partnership', 'b2bcommerce']);
      setValidationResult(null);
      setError(null);
      onClose();
      showSuccess('Mandate Broadcast Live', 'Your commercial mandate is active on the Corporate Deal Exchange.');
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.overlay, { paddingTop: Math.max(insets.top, 14), paddingBottom: Math.max(insets.bottom, 14) }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* ======================================================== */}
          {/* 1. TOP HEADER (Exact Web Replica)                         */}
          {/* ======================================================== */}
          <View style={styles.headerRow}>
            {/* Author Avatar & Identity Block */}
            <View style={styles.authorSection}>
              {user?.profile?.avatarUrl ? (
                <Image source={{ uri: user.profile.avatarUrl }} style={styles.authorAvatarImg} />
              ) : (
                <View style={styles.authorAvatarBox}>
                  <Text style={styles.authorAvatarText}>{authorInitial}</Text>
                </View>
              )}

              <View style={styles.authorMetaBox}>
                <View style={styles.nameAudienceRow}>
                  <Text style={styles.authorName} numberOfLines={1}>
                    {authorDisplayName}
                  </Text>

                  {/* Audience Visibility Pill */}
                  <TouchableOpacity
                    style={styles.audiencePill}
                    onPress={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={visibility === 'PUBLIC' ? 'globe' : 'lock'}
                      size={11}
                      color={visibility === 'PUBLIC' ? MeshviColors.accent : '#D97706'}
                      style={{ marginRight: 3.5 }}
                    />
                    <Text style={styles.audiencePillText}>
                      {visibility === 'PUBLIC' ? 'Public' : 'Connections'}
                    </Text>
                    <Feather name="chevron-down" size={10} color={MeshviColors.textSecondary} style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.authorSubtitle} numberOfLines={1}>
                  {authorRole} • {authorCompany}
                </Text>
              </View>
            </View>

            {/* Right Buttons: Preview Pill & Close Button */}
            <View style={styles.headerRightControls}>
              <TouchableOpacity
                style={[styles.previewToggleBtn, isPreview && styles.previewToggleBtnActive]}
                onPress={() => setIsPreview(!isPreview)}
                activeOpacity={0.75}
              >
                <Feather
                  name={isPreview ? 'edit-3' : 'eye'}
                  size={12}
                  color={isPreview ? '#FFFFFF' : MeshviColors.accent}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.previewToggleText, isPreview && { color: '#FFFFFF' }]}>
                  {isPreview ? 'Edit' : 'Preview'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Feather name="x" size={17} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Visibility Dropdown Menu Popover */}
          {isAudienceDropdownOpen && (
            <View style={styles.dropdownPopover}>
              <TouchableOpacity
                style={[styles.dropdownItem, visibility === 'PUBLIC' && styles.dropdownItemActive]}
                onPress={() => {
                  setVisibility('PUBLIC');
                  setIsAudienceDropdownOpen(false);
                }}
              >
                <Feather name="globe" size={13} color={MeshviColors.accent} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownItemTitle, visibility === 'PUBLIC' && { color: MeshviColors.accent }]}>
                    Global Deal Exchange
                  </Text>
                  <Text style={styles.dropdownItemDesc}>All verified members + institutional network</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownItem, visibility === 'CONNECTIONS_ONLY' && styles.dropdownItemActive]}
                onPress={() => {
                  setVisibility('CONNECTIONS_ONLY');
                  setIsAudienceDropdownOpen(false);
                }}
              >
                <Feather name="lock" size={13} color="#D97706" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownItemTitle, visibility === 'CONNECTIONS_ONLY' && { color: MeshviColors.accent }]}>
                    Only Connections
                  </Text>
                  <Text style={styles.dropdownItemDesc}>1st-degree verified counterparty network only</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================== */}
          {/* 2. BODY SCROLL CONTENT                                    */}
          {/* ======================================================== */}
          <ScrollView
            style={styles.modalBodyScroll}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {error && (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={14} color="#B42318" style={{ marginRight: 6, marginTop: 1 }} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {isPreview ? (
              /* ========================================================
                 PREVIEW MODE (Live Broadcast Replica)
                 ======================================================== */
              <View style={styles.previewContainer}>
                <View style={styles.previewCard}>
                  <View style={styles.previewCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.previewAuthorName}>{authorDisplayName}</Text>
                      <Feather name="check-circle" size={12} color="#059669" style={{ marginLeft: 4 }} />
                      <Text style={styles.previewVisibilityMeta}>
                        • {visibility === 'PUBLIC' ? 'Public' : 'Connections Only'}
                      </Text>
                    </View>
                    <Text style={styles.previewTimeText}>Just now</Text>
                  </View>

                  <View style={styles.previewBadgesRow}>
                    <View style={styles.previewBadgePrimary}>
                      <Text style={styles.previewBadgePrimaryText}>Authorized Commercial Signatory</Text>
                    </View>
                    <View style={styles.previewBadgeMuted}>
                      <Text style={styles.previewBadgeMutedText}>Verified Fulfillment: $10M+</Text>
                    </View>
                  </View>

                  <Text style={styles.previewTitle}>
                    {title || 'Partnership Title will appear here...'}
                  </Text>

                  <Text style={styles.previewContent}>
                    {content || 'Mandate scope, target credentials, and co-investment volume...'}
                  </Text>

                  {imageUri && (
                    <View style={styles.previewImageContainer}>
                      <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                    </View>
                  )}

                  {tags.length > 0 && (
                    <View style={styles.previewTagsRow}>
                      {tags.map((t) => (
                        <View key={t} style={styles.previewTagChip}>
                          <Text style={styles.previewTagText}>#{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {validationResult && (
                  <View
                    style={[
                      styles.previewValidationBanner,
                      validationResult.isCompliant ? styles.previewValidationPass : styles.previewValidationFail,
                    ]}
                  >
                    <Feather
                      name={validationResult.isCompliant ? 'shield' : 'alert-triangle'}
                      size={14}
                      color={validationResult.isCompliant ? '#059669' : '#DC2626'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.previewValidationText,
                        { color: validationResult.isCompliant ? '#065F46' : '#991B1B' },
                      ]}
                    >
                      {validationResult.isCompliant
                        ? `Ready to Broadcast: Bilateral Intent Confirmed (${validationResult.score}/100)`
                        : `Mandate Flagged: Revision Required (${validationResult.score}/100)`}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              /* ========================================================
                 EDIT MODE (Exact Screenshot Layout)
                 ======================================================== */
              <View style={styles.editContainer}>
                {/* 1. Partnership Title Input */}
                <View style={styles.inputBoxWrap}>
                  <TextInput
                    style={styles.titleInput}
                    placeholder="Partnership Title (e.g. Seeking Joint Venture Supplier for Regional Aviation Concessions)"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={180}
                  />
                </View>

                {/* 2. Mandate TYPE Selector */}
                <View style={styles.typeSelectorWrap}>
                  <Text style={styles.typeLabel}>TYPE:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.typeScrollContent}
                  >
                    {MANDATE_TYPES.map((m) => {
                      const isSelected = selectedIntent === m.id || tags.includes(m.tag);
                      return (
                        <TouchableOpacity
                          key={m.id}
                          style={[styles.typePill, isSelected && styles.typePillActive]}
                          onPress={() => {
                            setSelectedIntent(m.id);
                            if (!tags.includes(m.tag)) {
                              setTags([...tags, m.tag]);
                            }
                          }}
                          activeOpacity={0.75}
                        >
                          <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                            {m.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 3. Mandate Description Textarea */}
                <View style={styles.textareaWrap}>
                  <TextInput
                    style={styles.contentTextarea}
                    multiline
                    numberOfLines={4}
                    placeholder="Outline your bilateral objective, target counterparty credentials, volume requirements, or co-investment scope..."
                    placeholderTextColor="#94A3B8"
                    value={content}
                    onChangeText={setContent}
                    textAlignVertical="top"
                  />
                </View>

                {/* 4. AI Sentinel Validation Feedback Banner */}
                {isValidating && (
                  <View style={styles.aiLoadingBanner}>
                    <ActivityIndicator size="small" color={MeshviColors.accent} style={{ marginRight: 8 }} />
                    <Text style={styles.aiLoadingText}>
                      Evaluating bilateral commercial mandate with Gemini Flash...
                    </Text>
                  </View>
                )}

                {!isValidating && validationResult && !validationResult.isCompliant && (
                  <View style={styles.aiAlertBanner}>
                    <View style={styles.aiAlertTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="shield" size={13} color="#DC2626" style={{ marginRight: 5 }} />
                        <Text style={styles.aiAlertTitle}>Corporate Mandate Required</Text>
                      </View>
                      <View style={styles.aiScoreBadgeRed}>
                        <Text style={styles.aiScoreBadgeRedText}>Score: {validationResult.score}/100</Text>
                      </View>
                    </View>

                    <Text style={styles.aiAlertBody}>
                      {validationResult.flagReason || 'Mandate lacks specified bilateral terms or trade scope.'}
                    </Text>

                    {validationResult.suggestedRewrite && (
                      <View style={styles.rewriteRow}>
                        <Text style={styles.rewriteNotice}>1-click convert to executive B2B proposal</Text>
                        <TouchableOpacity
                          style={styles.rewriteBtn}
                          onPress={handleApplySuggestedRewrite}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons name="star-four-points" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.rewriteBtnText}>Convert to Mandate</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {!isValidating && validationResult && validationResult.isCompliant && (
                  <View style={styles.aiSuccessBanner}>
                    <View style={styles.aiAlertTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="check-circle" size={13} color="#059669" style={{ marginRight: 5 }} />
                        <Text style={styles.aiSuccessTitle}>Verified Bilateral Mandate</Text>
                      </View>
                      <View style={styles.aiScoreBadgeGreen}>
                        <Text style={styles.aiScoreBadgeGreenText}>Quality: {validationResult.score}/100</Text>
                      </View>
                    </View>
                    <Text style={styles.aiSuccessBody}>{validationResult.politeFeedback}</Text>
                  </View>
                )}

                {/* 5. Attach Corporate Visual Banner / Media Section */}
                {imageUri ? (
                  <View style={styles.attachedImageBox}>
                    <Image source={{ uri: imageUri }} style={styles.attachedImageThumb} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.attachedImageTitle} numberOfLines={1}>
                        {imageName || 'Corporate Visual Banner'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Feather name="check" size={11} color="#059669" style={{ marginRight: 3 }} />
                        <Text style={styles.attachedImageReady}>Ready to broadcast</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={handlePickImage} style={styles.imageActionBtn}>
                      <Text style={styles.imageActionBtnText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setImageUri(null);
                        setImageName('');
                      }}
                      style={styles.imageDeleteBtn}
                    >
                      <Feather name="trash-2" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.bannerDashedCard}>
                    {/* Header in Dashed Box */}
                    <View style={styles.bannerDashedHeader}>
                      <View style={styles.bannerTitleRow}>
                        <Feather name="image" size={15} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                        <Text style={styles.bannerDashedTitle}>Attach Corporate Visual Banner / Media</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.uploadImageBtn}
                        onPress={handlePickImage}
                        activeOpacity={0.8}
                      >
                        <Feather name="upload" size={12} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                        <Text style={styles.uploadImageBtnText}>Upload Image</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.presetsSubtext}>Or select an executive preset:</Text>

                    {/* 4 Preset Thumbnails */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.presetsScrollContent}
                    >
                      {CORPORATE_BANNER_PRESETS.map((preset) => (
                        <TouchableOpacity
                          key={preset.id}
                          style={styles.presetCard}
                          onPress={() => {
                            setImageUri(preset.url);
                            setImageName(preset.label);
                          }}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: preset.url }} style={styles.presetThumb} />
                          <Text style={styles.presetLabel} numberOfLines={1}>
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 6. Tags Section */}
                <View style={styles.tagsContainer}>
                  <View style={styles.tagsFlexRow}>
                    {tags.map((t) => (
                      <View key={t} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>#{t}</Text>
                        <TouchableOpacity onPress={() => handleRemoveTag(t)} style={styles.tagRemoveBtn}>
                          <Feather name="x" size={11} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {showTagInput ? (
                      <View style={styles.inlineTagInputBox}>
                        <TextInput
                          style={styles.inlineTagInput}
                          placeholder="tag..."
                          placeholderTextColor="#94A3B8"
                          value={tagInput}
                          onChangeText={setTagInput}
                          autoFocus
                          onSubmitEditing={handleAddTag}
                          returnKeyType="done"
                        />
                        <TouchableOpacity onPress={handleAddTag} style={styles.inlineTagAddBtn}>
                          <Feather name="check" size={13} color={MeshviColors.accent} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addTagBtn}
                        onPress={() => setShowTagInput(true)}
                        activeOpacity={0.7}
                      >
                        <Feather name="plus" size={11} color="#64748B" style={{ marginRight: 3 }} />
                        <Text style={styles.addTagBtnText}>Tag</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* ======================================================== */}
          {/* 3. FIXED FOOTER TOOLBAR (Exact Screenshot)               */}
          {/* ======================================================== */}
          <View style={[styles.footerToolbar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {/* Left Action Buttons: Photo, Tags, Verify AI */}
            <View style={styles.footerLeftActions}>
              <TouchableOpacity
                style={[styles.footerIconBtn, imageUri && styles.footerIconBtnActive]}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <Feather
                  name="image"
                  size={15}
                  color={imageUri ? MeshviColors.accent : MeshviColors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.footerIconText, imageUri && { color: MeshviColors.accent, fontWeight: '800' }]}>
                  Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerIconBtn}
                onPress={() => setShowTagInput(!showTagInput)}
                activeOpacity={0.7}
              >
                <Feather name="hash" size={14} color={MeshviColors.textSecondary} style={{ marginRight: 3 }} />
                <Text style={styles.footerIconText}>Tags</Text>
              </TouchableOpacity>

              {isValidating ? (
                <View style={styles.footerAiStatusPill}>
                  <ActivityIndicator size="small" color={MeshviColors.accent} style={{ marginRight: 4 }} />
                  <Text style={styles.footerAiStatusText}>Analyzing</Text>
                </View>
              ) : validationResult ? (
                <TouchableOpacity
                  style={[
                    styles.footerAiScorePill,
                    validationResult.isCompliant ? styles.footerAiScorePass : styles.footerAiScoreFail,
                  ]}
                  onPress={handleManualValidate}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={validationResult.isCompliant ? 'check' : 'alert-circle'}
                    size={11}
                    color={validationResult.isCompliant ? '#059669' : '#DC2626'}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.footerAiScoreText,
                      { color: validationResult.isCompliant ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {validationResult.score}%
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.footerIconBtn}
                  onPress={handleManualValidate}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="star-four-points" size={14} color={MeshviColors.accent} style={{ marginRight: 3 }} />
                  <Text style={[styles.footerIconText, { color: MeshviColors.accent }]}>Verify AI</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Right Buttons: Cancel & Publish */}
            <View style={styles.footerRightActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isSubmitting}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.publishBtn,
                  validationResult !== null && !validationResult.isCompliant && styles.publishBtnBlocked,
                  isValidating && styles.publishBtnLoading,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || isValidating || (validationResult !== null && !validationResult.isCompliant)}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isValidating ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.publishBtnText}>Checking...</Text>
                  </>
                ) : validationResult !== null && !validationResult.isCompliant ? (
                  <>
                    <Feather name="shield" size={13} color="#991B1B" style={{ marginRight: 5 }} />
                    <Text style={[styles.publishBtnText, { color: '#991B1B' }]}>Revise Mandate</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="star-four-points" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.publishBtnText}>Publish</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 580,
    maxHeight: '92%',
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // 1. Header Styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  authorAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  authorAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  authorMetaBox: {
    marginLeft: 10,
    flex: 1,
  },
  nameAudienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
    maxWidth: 130,
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  audiencePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  authorSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1.5,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  previewToggleBtnActive: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },
  previewToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },

  // Dropdown Popover
  dropdownPopover: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
  },
  dropdownItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownItemDesc: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },

  // 2. Body Scroll Styles
  modalBodyScroll: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 16,
    paddingBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
    fontWeight: '600',
  },

  // Edit Mode Styles
  editContainer: {
    gap: 12,
  },
  inputBoxWrap: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  titleInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Mandate TYPE Selector
  typeSelectorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginRight: 8,
  },
  typeScrollContent: {
    gap: 6,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  typePillActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderColor: MeshviColors.accent,
  },
  typePillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  typePillTextActive: {
    color: MeshviColors.accent,
    fontWeight: '800',
  },

  // Textarea
  textareaWrap: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 105,
  },
  contentTextarea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 18,
    minHeight: 105,
  },

  // AI Sentinel Validation Banner
  aiLoadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 9,
  },
  aiLoadingText: {
    color: '#1D4ED8',
    fontSize: 10.5,
    fontWeight: '600',
    flex: 1,
  },
  aiAlertBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
  },
  aiAlertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiAlertTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
  },
  aiScoreBadgeRed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  aiScoreBadgeRedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B91C1C',
  },
  aiAlertBody: {
    fontSize: 10.5,
    color: '#7F1D1D',
    lineHeight: 15,
  },
  rewriteRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewriteNotice: {
    fontSize: 9.5,
    color: '#64748B',
    fontStyle: 'italic',
    flex: 1,
  },
  rewriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
  },
  rewriteBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiSuccessBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
  },
  aiSuccessTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  aiScoreBadgeGreen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  aiScoreBadgeGreenText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },
  aiSuccessBody: {
    fontSize: 10.5,
    color: '#064E3B',
    lineHeight: 15,
    marginTop: 2,
  },

  // Dashed Media Card (Exact Screenshot)
  bannerDashedCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  bannerDashedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  bannerDashedTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  uploadImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
  },
  uploadImageBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  presetsSubtext: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 6,
  },
  presetsScrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  presetCard: {
    width: 125,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  presetThumb: {
    width: '100%',
    height: 44,
  },
  presetLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F172A',
    padding: 4,
    textAlign: 'center',
  },

  // Attached Image Preview
  attachedImageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  attachedImageThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  attachedImageTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  attachedImageReady: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  imageActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    marginRight: 4,
  },
  imageActionBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  imageDeleteBtn: {
    padding: 6,
  },

  // Tags Chips
  tagsContainer: {
    marginTop: 2,
  },
  tagsFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.accent,
    marginRight: 4,
  },
  tagRemoveBtn: {
    padding: 1,
  },
  addTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  addTagBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  inlineTagInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.accent,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FFFFFF',
  },
  inlineTagInput: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 60,
    padding: 0,
  },
  inlineTagAddBtn: {
    padding: 3,
  },

  // Preview Mode Render
  previewContainer: {
    gap: 12,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewAuthorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  previewVisibilityMeta: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 3,
  },
  previewTimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  previewBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  previewBadgePrimary: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  previewBadgePrimaryText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  previewBadgeMuted: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  previewBadgeMutedText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#334155',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 19,
  },
  previewContent: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
  },
  previewImageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    height: 140,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  previewTagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  previewTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: MeshviColors.accent,
  },
  previewValidationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  previewValidationPass: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  previewValidationFail: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  previewValidationText: {
    fontSize: 10.5,
    fontWeight: '800',
    flex: 1,
  },

  // 3. Footer Toolbar Styles
  footerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  footerLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  footerIconBtnActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
  },
  footerIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  footerAiStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  footerAiStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  footerAiScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  footerAiScorePass: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  footerAiScoreFail: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  footerAiScoreText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  // Right Actions
  footerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: MeshviColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  publishBtnBlocked: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowOpacity: 0,
    elevation: 0,
  },
  publishBtnLoading: {
    backgroundColor: MeshviColors.accent,
    opacity: 0.7,
  },
  publishBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
