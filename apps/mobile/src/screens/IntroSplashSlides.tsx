import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlideData {
  id: string;
  titlePrimary: string;
  titleAccent: string;
  subtitle: string;
  ctaText: string;
}

const SLIDES_CONTENT: SlideData[] = [
  {
    id: 'slide-1',
    titlePrimary: 'Your Corridors,',
    titleAccent: 'PerfectlynPlanned',
    subtitle:
      'Effortlessly calibrate and organize your bilateral enterprise corridors. Start sourcing verified mandates now!',
    ctaText: 'Get Started',
  },
  {
    id: 'slide-2',
    titlePrimary: 'Discover Verified',
    titleAccent: 'Partners Nearby',
    subtitle:
      'See where authorized C-Suite decision makers are active and explore reciprocal bilateral mandates together.',
    ctaText: 'Get Started',
  },
  {
    id: 'slide-3',
    titlePrimary: 'Stay Updated',
    titleAccent: 'with Top Alliances',
    subtitle:
      'Find trending bilateral partnerships and verified mandates, all tailored to enhance your commercial expansion.',
    ctaText: 'Get Started',
  },
];

interface IntroSplashSlidesProps {
  onContinue: () => void;
}

export const IntroSplashSlides: React.FC<IntroSplashSlidesProps> = ({ onContinue }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<any>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES_CONTENT.length) {
      setCurrentIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  const handleCtaPress = () => {
    if (currentIndex < SLIDES_CONTENT.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      onContinue();
    }
  };

  const currentSlide = SLIDES_CONTENT[currentIndex];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      {/* Background Subtle Gradient Canvas */}
      <LinearGradient
        colors={[MeshviColors.white, MeshviColors.background, '#F1F5F9']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Brand Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 28, height: 28, borderRadius: 8, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>
            Meshvi<Text style={styles.brandDot}>.</Text>
          </Text>
        </View>

        {currentIndex < SLIDES_CONTENT.length - 1 ? (
          <TouchableOpacity
            onPress={() => goToSlide(SLIDES_CONTENT.length - 1)}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Feather name="chevron-right" size={13} color={MeshviColors.textSecondary} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {/* Horizontal Swiper for Visuals */}
      <View style={styles.visualSwiperArea}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
          style={{ width: SCREEN_WIDTH }}
        >
          {/* ========================================================== */}
          {/* SLIDE 1 VISUAL: Bilateral Corridor & Schedule Card        */}
          {/* ========================================================== */}
          <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
            <View style={styles.visualInnerWrap}>
              {/* Main Corridor Card */}
              <View style={styles.corridorMainCard}>
                <LinearGradient
                  colors={['#172B4D', '#134E4A', '#0F766E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.corridorBanner}
                >
                  <View style={styles.corridorTopRow}>
                    <View style={styles.corridorBadge}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.corridorBadgeText}>ACTIVE CORRIDOR</Text>
                    </View>
                    <View style={styles.routePill}>
                      <Text style={styles.routePillText}>SIN ➔ KUL</Text>
                    </View>
                  </View>

                  <Text style={styles.corridorBannerTitle}>Singapore — KL Corridor</Text>
                  <Text style={styles.corridorBannerSub}>ASEAN Distribution Hub • $1.2M Trade Flow</Text>
                </LinearGradient>

                <View style={styles.corridorCardBody}>
                  <View style={styles.avatarRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarLetter}>AR</Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.avatarName}>Aditi Rao</Text>
                        <MaterialCommunityIcons name="check-decagram" size={13} color={MeshviColors.accent} style={{ marginLeft: 4 }} />
                      </View>
                      <Text style={styles.avatarRole}>Chief Commercial Officer</Text>
                    </View>
                  </View>

                  <View style={styles.corridorMetricPill}>
                    <Feather name="shield" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.corridorMetricText}>98% Fit</Text>
                  </View>
                </View>
              </View>

              {/* Overlapping Floating Corridor Schedule Card */}
              <View style={styles.scheduleFloatCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.scheduleIconWrap}>
                    <Feather name="calendar" size={12} color={MeshviColors.accent} />
                  </View>
                  <Text style={styles.scheduleTitle}>Corridor Milestones</Text>
                  <View style={styles.milestoneTag}>
                    <Text style={styles.milestoneTagText}>Nov 2026</Text>
                  </View>
                </View>

                {/* Milestone 1 */}
                <View style={styles.scheduleItem}>
                  <Text style={styles.flagEmoji}>🇲🇾</Text>
                  <View style={{ flex: 1, marginLeft: 9 }}>
                    <Text style={styles.scheduleItemCity}>Kuala Lumpur</Text>
                    <Text style={styles.scheduleItemSub}>ASEAN Expansion • Day 1</Text>
                  </View>
                  <View style={styles.dateTag}>
                    <Text style={styles.scheduleDate}>02 Nov</Text>
                  </View>
                </View>

                <View style={styles.scheduleDivider} />

                {/* Milestone 2 */}
                <View style={styles.scheduleItem}>
                  <Text style={styles.flagEmoji}>🇯🇵</Text>
                  <View style={{ flex: 1, marginLeft: 9 }}>
                    <Text style={styles.scheduleItemCity}>Tokyo Shibuya</Text>
                    <Text style={styles.scheduleItemSub}>Tech JV Node • Day 3</Text>
                  </View>
                  <View style={styles.dateTag}>
                    <Text style={styles.scheduleDate}>05 Nov</Text>
                  </View>
                </View>

                <View style={styles.scheduleDivider} />

                {/* Milestone 3 */}
                <View style={styles.scheduleItem}>
                  <Text style={styles.flagEmoji}>🇦🇪</Text>
                  <View style={{ flex: 1, marginLeft: 9 }}>
                    <Text style={styles.scheduleItemCity}>Dubai DIFC</Text>
                    <Text style={styles.scheduleItemSub}>MENA Gateway • Day 5</Text>
                  </View>
                  <View style={styles.dateTag}>
                    <Text style={styles.scheduleDate}>09 Nov</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ========================================================== */}
          {/* SLIDE 2 VISUAL: Global Network Matrix & Verified Nodes     */}
          {/* ========================================================== */}
          <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
            <View style={styles.visualInnerWrap}>
              <View style={styles.mapCanvas}>
                {/* Visual Radar Rings & Matrix Backing */}
                <View style={styles.mapBackdropRings}>
                  <View style={[styles.matrixRing, { width: 280, height: 280 }]} />
                  <View style={[styles.matrixRing, { width: 190, height: 190 }]} />
                  <View style={[styles.matrixRing, { width: 100, height: 100 }]} />
                </View>

                {/* Top Stacked Avatars with Counter */}
                <View style={styles.stackedAvatarsRow}>
                  <View style={[styles.avatarStackItem, { zIndex: 3, backgroundColor: '#0F766E' }]}>
                    <Text style={styles.avatarStackText}>VK</Text>
                  </View>
                  <View style={[styles.avatarStackItem, { zIndex: 2, marginLeft: -10, backgroundColor: '#172B4D' }]}>
                    <Text style={styles.avatarStackText}>SC</Text>
                  </View>
                  <View style={[styles.avatarStackItem, { zIndex: 1, marginLeft: -10, backgroundColor: '#D97706' }]}>
                    <Text style={styles.avatarStackText}>TM</Text>
                  </View>
                  <View style={styles.avatarCountBadge}>
                    <Text style={styles.avatarCountText}>+142 Verified C-Suites</Text>
                  </View>
                </View>

                {/* Floating Location Indicator Pill */}
                <View style={styles.floatingLocationPill}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.floatingLocationText}>📍 Active Node: Singapore SG1</Text>
                </View>

                {/* Nodes with Country Flags */}
                <View style={[styles.nodePin, { top: 96, left: 22 }]}>
                  <Text style={styles.nodePinFlag}>🇸🇬</Text>
                  <Text style={styles.nodePinLabel}>Singapore Hub</Text>
                </View>

                <View style={[styles.nodePin, { top: 82, right: 22 }]}>
                  <Text style={styles.nodePinFlag}>🇦🇪</Text>
                  <Text style={styles.nodePinLabel}>Dubai DIFC</Text>
                </View>

                <View style={[styles.nodePin, { bottom: 58, left: 30 }]}>
                  <Text style={styles.nodePinFlag}>🇯🇵</Text>
                  <Text style={styles.nodePinLabel}>Tokyo Ginza</Text>
                </View>

                <View style={[styles.nodePin, { bottom: 64, right: 28 }]}>
                  <Text style={styles.nodePinFlag}>🇮🇳</Text>
                  <Text style={styles.nodePinLabel}>Bangalore Tech</Text>
                </View>

                {/* Active Match Tooltip */}
                <View style={styles.matchTooltip}>
                  <View style={styles.matchIconWrap}>
                    <Feather name="zap" size={13} color={MeshviColors.accent} />
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.matchTooltipTitle}>98% Bilateral Fit Found</Text>
                    <Text style={styles.matchTooltipSub}>Apex Logistics • Direct Authority</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ========================================================== */}
          {/* SLIDE 3 VISUAL: Top Alliances Stack & Verified Badges      */}
          {/* ========================================================== */}
          <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
            <View style={styles.visualInnerWrap}>
              <View style={styles.alliancesStackContainer}>
                {/* Alliance Card 3 (Bottom) */}
                <View style={[styles.allianceCard, styles.allianceCardBottom]}>
                  <View style={styles.allianceHeader}>
                    <View style={[styles.allianceIcon, { backgroundColor: '#EEF2FF' }]}>
                      <Feather name="cpu" size={15} color="#4F46E5" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.allianceName}>Kinetix Enterprise AI</Text>
                      <Text style={styles.allianceSub}>Autonomous Supply Chain</Text>
                    </View>
                    <Text style={styles.allianceSynergy}>★ 4.7</Text>
                  </View>
                </View>

                {/* Alliance Card 2 (Middle) */}
                <View style={[styles.allianceCard, styles.allianceCardMiddle]}>
                  <View style={styles.allianceHeader}>
                    <View style={[styles.allianceIcon, { backgroundColor: '#ECFDF5' }]}>
                      <Feather name="dollar-sign" size={15} color="#059669" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.allianceName}>FinBridge Capital</Text>
                      <Text style={styles.allianceSub}>Cross-Border Escrow & Trade</Text>
                    </View>
                    <Text style={styles.allianceSynergy}>★ 4.8</Text>
                  </View>
                </View>

                {/* Alliance Card 1 (Top / Front) */}
                <View style={[styles.allianceCard, styles.allianceCardFront]}>
                  <View style={styles.allianceHeader}>
                    <LinearGradient
                      colors={[MeshviColors.primary, MeshviColors.accent]}
                      style={styles.allianceIcon}
                    >
                      <Feather name="box" size={17} color={MeshviColors.white} />
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.allianceName}>Aura Logistics Global</Text>
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={14}
                          color={MeshviColors.accent}
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                      <Text style={styles.allianceSub}>Cross-Border Cold Chain & Freight</Text>
                    </View>
                  </View>

                  <View style={styles.allianceTagsRow}>
                    <View style={styles.scopeTag}>
                      <Text style={styles.scopeTagText}>$5M - $20M Bilateral</Text>
                    </View>
                    <View style={[styles.scopeTag, { marginLeft: 6 }]}>
                      <Text style={styles.scopeTagText}>ASEAN & GCC</Text>
                    </View>
                  </View>

                  <View style={styles.allianceBodyRow}>
                    <View style={styles.synergyTag}>
                      <Feather name="star" size={12} color="#D97706" />
                      <Text style={styles.synergyTagText}> 4.9 (98% Synergy Match)</Text>
                    </View>
                    <View style={styles.allianceActionsRow}>
                      <View style={[styles.iconActionPill, { backgroundColor: '#FEE2E2' }]}>
                        <Feather name="heart" size={13} color="#EF4444" />
                      </View>
                      <View style={[styles.iconActionPill, { marginLeft: 6 }]}>
                        <Feather name="share-2" size={13} color={MeshviColors.textSecondary} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Content Area: Typography, Dots, and Pill CTA */}
      <View style={styles.bottomSection}>
        {/* Two-Toned Headline */}
        <View style={styles.headlineWrap}>
          <Text style={styles.headlinePrimary}>{currentSlide.titlePrimary}</Text>
          <Text style={styles.headlineAccent}>{currentSlide.titleAccent}</Text>
        </View>

        {/* Subtitle Description */}
        <Text style={styles.subtitleText}>{currentSlide.subtitle}</Text>

        {/* 3-Dot Pagination */}
        <View style={styles.paginationRow}>
          {SLIDES_CONTENT.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => goToSlide(idx)}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
                activeOpacity={0.7}
              />
            );
          })}
        </View>

        {/* Full-Width Rounded Pill Button */}
        <TouchableOpacity
          style={styles.pillButtonWrap}
          onPress={handleCtaPress}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[MeshviColors.accent, MeshviColors.accentPressed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pillButton}
          >
            <Text style={styles.pillButtonText}>{currentSlide.ctaText}</Text>
            <View style={styles.pillArrowWrap}>
              <Feather name="arrow-right" size={17} color={MeshviColors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MeshviColors.background,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
    zIndex: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    shadowColor: MeshviColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  brandName: {
    color: MeshviColors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandDot: {
    color: MeshviColors.accent,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: MeshviColors.surface,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  skipText: {
    color: MeshviColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  /* Visual Swiper Section */
  visualSwiperArea: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.49,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidePage: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  visualInnerWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  /* SLIDE 1: Corridor & Schedule Card */
  corridorMainCard: {
    width: '90%',
    backgroundColor: MeshviColors.surface,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
    marginBottom: 50,
  },
  corridorBanner: {
    padding: 16,
    paddingBottom: 14,
  },
  corridorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  corridorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MeshviColors.accent,
    marginRight: 5,
  },
  corridorBadgeText: {
    color: '#0F766E',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  routePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  routePillText: {
    color: MeshviColors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  corridorBannerTitle: {
    color: MeshviColors.white,
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  corridorBannerSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  corridorCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: MeshviColors.surface,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: MeshviColors.accent,
  },
  avatarLetter: {
    color: MeshviColors.accent,
    fontSize: 12.5,
    fontWeight: '900',
  },
  avatarName: {
    color: MeshviColors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  avatarRole: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  corridorMetricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  corridorMetricText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },

  /* Floating Schedule Card */
  scheduleFloatCard: {
    position: 'absolute',
    bottom: 2,
    right: 12,
    width: '72%',
    backgroundColor: MeshviColors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 7,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    flex: 1,
  },
  milestoneTag: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  milestoneTagText: {
    color: MeshviColors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  flagEmoji: {
    fontSize: 15,
  },
  scheduleItemCity: {
    color: MeshviColors.textPrimary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  scheduleItemSub: {
    color: MeshviColors.textMuted,
    fontSize: 9,
  },
  dateTag: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scheduleDate: {
    color: MeshviColors.accent,
    fontSize: 9.5,
    fontWeight: '800',
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: MeshviColors.border,
    marginVertical: 4,
  },

  /* SLIDE 2: Global Map & Verified Nodes */
  mapCanvas: {
    width: '92%',
    height: '92%',
    backgroundColor: MeshviColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBackdropRings: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixRing: {
    position: 'absolute',
    borderRadius: 250,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.12)',
    borderStyle: 'dashed',
  },
  stackedAvatarsRow: {
    position: 'absolute',
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarStackItem: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: MeshviColors.surface,
  },
  avatarStackText: {
    color: MeshviColors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  avatarCountBadge: {
    marginLeft: 6,
  },
  avatarCountText: {
    color: MeshviColors.textPrimary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  floatingLocationPill: {
    position: 'absolute',
    top: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.25)',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0F766E',
    marginRight: 6,
  },
  floatingLocationText: {
    color: '#0F766E',
    fontSize: 10.5,
    fontWeight: '800',
  },
  nodePin: {
    position: 'absolute',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  nodePinFlag: {
    fontSize: 12,
    marginRight: 4,
  },
  nodePinLabel: {
    color: MeshviColors.textPrimary,
    fontSize: 9.5,
    fontWeight: '700',
  },
  matchTooltip: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  matchIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchTooltipTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  matchTooltipSub: {
    color: MeshviColors.textMuted,
    fontSize: 9.5,
    fontWeight: '600',
  },

  /* SLIDE 3: Alliances Stack */
  alliancesStackContainer: {
    width: '92%',
    height: '92%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  allianceCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  allianceCardBottom: {
    position: 'absolute',
    width: '82%',
    top: 6,
    opacity: 0.7,
    transform: [{ scale: 0.88 }],
  },
  allianceCardMiddle: {
    position: 'absolute',
    width: '90%',
    top: 24,
    opacity: 0.88,
    transform: [{ scale: 0.94 }],
  },
  allianceCardFront: {
    width: '100%',
    marginTop: 48,
    shadowOpacity: 0.15,
    elevation: 6,
  },
  allianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allianceIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allianceName: {
    color: MeshviColors.textPrimary,
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  allianceSub: {
    color: MeshviColors.textMuted,
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  allianceSynergy: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  allianceTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  scopeTag: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  scopeTagText: {
    color: MeshviColors.textSecondary,
    fontSize: 9.5,
    fontWeight: '700',
  },
  allianceBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  synergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  synergyTagText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '800',
  },
  allianceActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconActionPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },

  /* Bottom Content Area */
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headlineWrap: {
    marginBottom: 8,
  },
  headlinePrimary: {
    color: MeshviColors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  headlineAccent: {
    color: MeshviColors.accent,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  subtitleText: {
    color: MeshviColors.textMuted,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 20,
  },

  /* 3-Dot Pagination */
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
    marginHorizontal: 3.5,
  },
  dotActive: {
    width: 28,
    backgroundColor: MeshviColors.accent,
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#CBD5E1',
  },

  /* Full-Width Pill CTA Button */
  pillButtonWrap: {
    shadowColor: MeshviColors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
  },
  pillButtonText: {
    color: MeshviColors.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  pillArrowWrap: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
