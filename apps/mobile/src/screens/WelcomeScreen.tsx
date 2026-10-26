import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const SLIDES = [
  {
    icon: 'shield',
    iconType: 'feather',
    title: 'Zero Cold Pitch Inbound',
    subtitle: 'Calibrated Perimeter Pitch Firewall',
    desc: 'Unsolicited agency outreach and automated mass sales blasts are blocked at the perimeter before reaching your notifications.',
    badge: '100% Noise Elimination',
    badgeColor: COLORS.rose,
    badgeBg: COLORS.roseSoft,
    badgeBorder: COLORS.roseBorder,
    iconColor: COLORS.rose,
    iconBg: COLORS.roseSoft,
  },
  {
    icon: 'radar',
    iconType: 'material',
    title: 'Bilateral Synergy Radar',
    subtitle: 'Reciprocal Intent Alignment Engine',
    desc: 'Continuous AI matching aligns what you are seeking directly with what pre-verified enterprise decision makers offer.',
    badge: 'AI Calibrated Matching',
    badgeColor: COLORS.primary,
    badgeBg: COLORS.primarySoft,
    badgeBorder: COLORS.primaryBorder,
    iconColor: COLORS.primary,
    iconBg: COLORS.primarySoft,
  },
  {
    icon: 'lock',
    iconType: 'feather',
    title: 'Micro Deal Room Security',
    subtitle: 'Mutual Agenda & Bilateral NDA First',
    desc: 'Protect executive calendars. Exchange bilateral agendas and NDA clearance before unlocking 1-click meeting bookings.',
    badge: 'Executive Time Shield',
    badgeColor: COLORS.emerald,
    badgeBg: COLORS.emeraldSoft,
    badgeBorder: COLORS.emeraldBorder,
    iconColor: COLORS.emerald,
    iconBg: COLORS.emeraldSoft,
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onRegister }) => {
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { quickDemoLogin } = useAuth();

  const slide = SLIDES[currentSlide];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC', '#F1F5F9']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 36, height: 36, borderRadius: 10, marginRight: 8 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandText}>MESHVI</Text>
            <Text style={styles.brandSub}>Verified Intent Infrastructure</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={onLogin}>
          <Text style={styles.skipText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel Card */}
      <View style={styles.content}>
        <View style={styles.slideCard}>
          <View
            style={[
              styles.badgeWrapper,
              { backgroundColor: slide.badgeBg, borderColor: slide.badgeBorder },
            ]}
          >
            <Text style={[styles.badgeText, { color: slide.badgeColor }]}>{slide.badge}</Text>
          </View>

          <View style={[styles.iconCircle, { backgroundColor: slide.iconBg }]}>
            {slide.iconType === 'feather' ? (
              <Feather name={slide.icon as any} size={36} color={slide.iconColor} />
            ) : (
              <MaterialCommunityIcons name={slide.icon as any} size={40} color={slide.iconColor} />
            )}
          </View>

          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.slideDesc}>{slide.desc}</Text>

          {/* Pagination Indicators */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCurrentSlide(idx)}
                style={[
                  styles.dot,
                  currentSlide === idx ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRegister} activeOpacity={0.88}>
          <LinearGradient
            colors={[COLORS.primary, '#0040D0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryBtnText}>Register New Organization</Text>
            <Feather name="arrow-right" size={18} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onLogin} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Sign In to Node</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoBtn}
          onPress={async () => {
            await quickDemoLogin();
          }}
          activeOpacity={0.8}
        >
          <Feather name="zap" size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
          <Text style={styles.demoBtnText}>Instant Executive Demo Mode (Rajiv Menon)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...SHADOWS.subtle,
  },
  logoLetter: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },
  brandText: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  slideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  badgeWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  slideTitle: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  slideSubtitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: COLORS.borderStrong,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    ...SHADOWS.cardHover,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginRight: 8,
  },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.subtle,
  },
  secondaryBtnText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  demoBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
