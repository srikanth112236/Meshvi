import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../../theme/colors';
import { useModal } from '../../context/ModalContext';
import {
  getSavedProfiles,
  removeSavedProfileItem,
  SavedProfileItem,
} from '../../services/savedProfilesStorage';

export interface SavedProfilesScreenProps {
  onNavigateTab?: (tab: string, initialQuery?: string, partner?: any) => void;
  onNavigateToMessages?: (partner: {
    id?: string;
    name: string;
    company: string;
    role?: string;
  }) => void;
  onBack?: () => void;
}

export const SavedProfilesScreen: React.FC<SavedProfilesScreenProps> = ({
  onNavigateTab,
  onNavigateToMessages,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { showSuccess, showInfo } = useModal();

  const [savedList, setSavedList] = useState<SavedProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXECUTIVE' | 'ENTERPRISE'>('ALL');
  const [dossierTarget, setDossierTarget] = useState<SavedProfileItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getSavedProfiles();
      setSavedList(items);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemove = async (item: SavedProfileItem) => {
    Alert.alert(
      'Remove from Watchlist',
      `Are you sure you want to remove ${item.title} from your saved watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = await removeSavedProfileItem(item.id);
            setSavedList(updated);
            if (dossierTarget?.id === item.id) {
              setDossierTarget(null);
            }
            showInfo('Removed from Watchlist', `${item.title} was removed from your saved profiles.`);
          },
        },
      ]
    );
  };

  const filteredList = useMemo(() => {
    return savedList.filter((item) => {
      const matchType =
        filterType === 'ALL' || item.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        (item.industry && item.industry.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q));
      return matchType && matchQuery;
    });
  }, [savedList, filterType, searchQuery]);

  const executiveCount = useMemo(
    () => savedList.filter((p) => p.type === 'EXECUTIVE').length,
    [savedList]
  );
  const enterpriseCount = useMemo(
    () => savedList.filter((p) => p.type === 'ENTERPRISE').length,
    [savedList]
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={18} color={MeshviColors.primary} />
            </TouchableOpacity>
          )}
          <View style={{ marginLeft: onBack ? 8 : 0 }}>
            <View style={styles.headerKickerRow}>
              <Feather name="bookmark" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.headerKicker}>Executive Watchlist</Text>
            </View>
            <Text style={styles.headerTitle}>Saved Profiles</Text>
          </View>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{savedList.length} saved</Text>
        </View>
      </View>

      {/* 2. Search & Filter Bar */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchInputBox}>
          <Feather name="search" size={13} color={MeshviColors.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter saved leaders, enterprises, or sectors..."
            placeholderTextColor={MeshviColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={13} color={MeshviColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterChipsRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilterType('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterType === 'ALL' && styles.filterChipTextActive]}>
              All ({savedList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterType === 'EXECUTIVE' && styles.filterChipActive]}
            onPress={() => setFilterType('EXECUTIVE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterType === 'EXECUTIVE' && styles.filterChipTextActive]}>
              Decision Makers ({executiveCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterType === 'ENTERPRISE' && styles.filterChipActive]}
            onPress={() => setFilterType('ENTERPRISE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterType === 'ENTERPRISE' && styles.filterChipTextActive]}>
              Enterprises ({enterpriseCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Main List Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={MeshviColors.primary} />
            <Text style={styles.loadingText}>Loading saved executive records...</Text>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <View style={styles.emptyIconCircle}>
              <Feather name="bookmark" size={28} color={MeshviColors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching saved profiles' : 'No Saved Profiles Yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? 'Try tweaking your search keyword or switching between Decision Makers and Enterprises.'
                : 'Bookmark executives and enterprise accounts in the Search page to monitor them and deploy warm intros.'}
            </Text>
            <TouchableOpacity
              style={styles.exploreSearchBtn}
              onPress={() => onNavigateTab ? onNavigateTab('search') : null}
              activeOpacity={0.85}
            >
              <Feather name="compass" size={13} color={MeshviColors.white} style={{ marginRight: 6 }} />
              <Text style={styles.exploreSearchBtnText}>Explore Search Network</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {filteredList.map((item) => {
              const isExec = item.type === 'EXECUTIVE';
              return (
                <View key={item.id} style={styles.savedCard}>
                  {/* Card Top Row: Avatar/Type + Details + Delete */}
                  <TouchableOpacity
                    style={styles.cardHeaderRow}
                    onPress={() => setDossierTarget(item)}
                    activeOpacity={0.8}
                  >
                    {item.avatarUrl ? (
                      <Image source={{ uri: item.avatarUrl }} style={styles.cardAvatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Feather
                          name={isExec ? 'user' : 'briefcase'}
                          size={16}
                          color={MeshviColors.primary}
                        />
                      </View>
                    )}

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Feather
                          name="check-circle"
                          size={12}
                          color="#059669"
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                      {item.companyName && (
                        <Text style={styles.cardCompany} numberOfLines={1}>
                          {item.companyName}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.removeIconBtn}
                      onPress={() => handleRemove(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="bookmark" size={15} color={MeshviColors.accent} />
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Meta Tag Strip */}
                  <View style={styles.metaTagsRow}>
                    <View style={styles.metaTag}>
                      <Text style={styles.metaTagText}>
                        {item.flag || '🌐'} {item.location || 'Global'}
                      </Text>
                    </View>
                    {item.industry && (
                      <View style={styles.metaTag}>
                        <Text style={styles.metaTagText} numberOfLines={1}>
                          {item.industry}
                        </Text>
                      </View>
                    )}
                    {item.fitScore && (
                      <View style={styles.scoreTag}>
                        <Feather name="award" size={10} color="#065F46" style={{ marginRight: 3 }} />
                        <Text style={styles.scoreTagText}>{item.fitScore}% Fit</Text>
                      </View>
                    )}
                  </View>

                  {/* Summary / Mandate Snippet */}
                  {item.seekingSummary && (
                    <TouchableOpacity
                      style={styles.mandateSnippetBox}
                      onPress={() => setDossierTarget(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.mandateSnippetLabel}>Commercial Mandate</Text>
                      <Text style={styles.mandateSnippetText} numberOfLines={2}>
                        "{item.seekingSummary}"
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Bottom Action Strip */}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={styles.dossierBtn}
                      onPress={() => setDossierTarget(item)}
                      activeOpacity={0.8}
                    >
                      <Feather name="file-text" size={11} color={MeshviColors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.dossierBtnText}>View Dossier</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.introActionBtn}
                      onPress={() => {
                        if (onNavigateTab) {
                          onNavigateTab('introductions');
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <Feather name="share-2" size={11} color={MeshviColors.white} style={{ marginRight: 4 }} />
                      <Text style={styles.introActionBtnText}>Warm Intro</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.chatActionBtn}
                      onPress={() => {
                        if (onNavigateToMessages) {
                          onNavigateToMessages({
                            id: item.userId || item.id,
                            name: item.title,
                            company: item.companyName || 'Verified Enterprise',
                            role: item.subtitle,
                          });
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <Feather name="message-square" size={11} color={MeshviColors.white} style={{ marginRight: 4 }} />
                      <Text style={styles.chatActionBtnText}>Direct Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 4. Complete Dossier Modal */}
      <Modal
        visible={Boolean(dossierTarget)}
        transparent
        animationType="slide"
        onRequestClose={() => setDossierTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '85%' }]}>
            {dossierTarget && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Feather name="bookmark" size={15} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                      <Text style={styles.modalTitle} numberOfLines={1}>
                        Watchlist Candidate Dossier
                      </Text>
                    </View>
                    <Text style={styles.modalSubTitle}>
                      Added {new Date(dossierTarget.savedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setDossierTarget(null)} style={styles.modalCloseBtn}>
                    <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
                  {/* Candidate Header in Modal */}
                  <View style={styles.modalCandidateCard}>
                    {dossierTarget.avatarUrl ? (
                      <Image source={{ uri: dossierTarget.avatarUrl }} style={styles.modalAvatar} />
                    ) : (
                      <View style={styles.modalAvatarPlaceholder}>
                        <Feather name="user" size={20} color={MeshviColors.primary} />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.modalCandidateName}>{dossierTarget.title}</Text>
                      <Text style={styles.modalCandidateRole}>{dossierTarget.subtitle}</Text>
                      {dossierTarget.companyName && (
                        <Text style={styles.modalCandidateCompany}>{dossierTarget.companyName}</Text>
                      )}
                      <Text style={styles.modalCandidateLocation}>
                        {dossierTarget.flag || '🌐'} {dossierTarget.location || 'Global Headquarters'}
                      </Text>
                    </View>
                  </View>

                  {/* Corporate Lineage */}
                  {dossierTarget.corporateLineage && (
                    <View style={styles.modalLineageBox}>
                      <Feather name="git-branch" size={12} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                      <Text style={styles.modalLineageText}>{dossierTarget.corporateLineage}</Text>
                    </View>
                  )}

                  {/* Seeking Mandate */}
                  <Text style={styles.modalSectionLabel}>Active Strategic Mandate</Text>
                  <View style={styles.modalPropBox}>
                    <Text style={styles.modalPropText}>
                      "{dossierTarget.seekingSummary || 'Bilateral technology, trade, and commercial syndicate alignment.'}"
                    </Text>
                  </View>

                  {/* Offering Capability */}
                  {dossierTarget.offeringSummary && (
                    <>
                      <Text style={styles.modalSectionLabel}>Institutional Capabilities</Text>
                      <View style={styles.modalPropBox}>
                        <Text style={styles.modalPropText}>"{dossierTarget.offeringSummary}"</Text>
                      </View>
                    </>
                  )}

                  {/* Notes */}
                  {dossierTarget.notes && (
                    <>
                      <Text style={styles.modalSectionLabel}>Watchlist Notes</Text>
                      <View style={styles.modalNotesBox}>
                        <Feather name="edit-2" size={12} color="#059669" style={{ marginRight: 6 }} />
                        <Text style={styles.modalNotesText}>{dossierTarget.notes}</Text>
                      </View>
                    </>
                  )}
                </ScrollView>

                {/* Modal Action Row */}
                <View style={styles.modalBottomActionRow}>
                  <TouchableOpacity
                    style={styles.modalRemoveBtn}
                    onPress={() => handleRemove(dossierTarget)}
                    activeOpacity={0.75}
                  >
                    <Feather name="trash-2" size={12} color="#DC2626" style={{ marginRight: 4 }} />
                    <Text style={styles.modalRemoveBtnText}>Remove</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalConnectBtn}
                    onPress={() => {
                      const tgt = dossierTarget;
                      setDossierTarget(null);
                      if (onNavigateToMessages) {
                        onNavigateToMessages({
                          id: tgt.userId || tgt.id,
                          name: tgt.title,
                          company: tgt.companyName || 'Verified Enterprise',
                          role: tgt.subtitle,
                        });
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Feather name="message-square" size={13} color={MeshviColors.white} style={{ marginRight: 5 }} />
                    <Text style={styles.modalConnectBtnText}>Start Conversation</Text>
                  </TouchableOpacity>
                </View>
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
  headerBar: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
    borderRadius: 7,
    backgroundColor: MeshviColors.surfaceMuted,
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
    fontSize: 16,
    fontWeight: '900',
    color: MeshviColors.primary,
  },
  countBadge: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.accent,
  },

  // Search & Filters
  searchBarWrap: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: MeshviColors.textPrimary,
    padding: 0,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  filterChipActive: {
    backgroundColor: MeshviColors.primary,
    borderColor: MeshviColors.primary,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  filterChipTextActive: {
    color: MeshviColors.white,
  },

  // Main Feed
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 11,
    color: MeshviColors.textSecondary,
    marginTop: 8,
  },
  emptyStateBox: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: MeshviColors.primary,
  },
  emptyDesc: {
    fontSize: 11,
    color: MeshviColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 290,
  },
  exploreSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  exploreSearchBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.white,
  },

  // Saved Card
  savedCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: MeshviColors.primary,
  },
  cardSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: MeshviColors.accent,
    marginTop: 1,
  },
  cardCompany: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  removeIconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  metaTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  metaTag: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaTagText: {
    fontSize: 9.5,
    color: MeshviColors.textSecondary,
    fontWeight: '600',
  },
  scoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  scoreTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  mandateSnippetBox: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 7,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  mandateSnippetLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  mandateSnippetText: {
    fontSize: 10.5,
    color: MeshviColors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  dossierBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingVertical: 5.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  dossierBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: MeshviColors.primary,
  },
  introActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.accent,
    paddingVertical: 5.5,
    borderRadius: 6,
  },
  introActionBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.primary,
    paddingVertical: 5.5,
    borderRadius: 6,
  },
  chatActionBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.white,
  },

  // Modal Styles
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: MeshviColors.primary,
  },
  modalSubTitle: {
    fontSize: 11,
    color: MeshviColors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  modalCandidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    padding: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MeshviColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCandidateName: {
    fontSize: 13,
    fontWeight: '900',
    color: MeshviColors.primary,
  },
  modalCandidateRole: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.accent,
    marginTop: 1,
  },
  modalCandidateCompany: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  modalCandidateLocation: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    marginTop: 2,
  },
  modalLineageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    padding: 8,
    borderRadius: 7,
    marginTop: 8,
  },
  modalLineageText: {
    fontSize: 10.5,
    color: MeshviColors.accent,
    fontWeight: '700',
  },
  modalSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 10,
    marginBottom: 4,
  },
  modalPropBox: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  modalPropText: {
    fontSize: 11,
    color: MeshviColors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  modalNotesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  modalNotesText: {
    fontSize: 10.5,
    color: '#065F46',
    fontWeight: '600',
  },
  modalBottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  modalRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalRemoveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalConnectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.primary,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalConnectBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
});
