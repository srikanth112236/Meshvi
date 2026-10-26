import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const STATUS_MESSAGES = [
  'Calibrating Bilateral Verification Engine...',
  'Synchronizing 67,000+ Enterprise Records...',
  'Engaging Anti-Spam Pitch Firewall...',
  'Workspace Ready. Welcome to Meshvi.',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const radarScale = useRef(new Animated.Value(0.9)).current;
  const radarOpacity = useRef(new Animated.Value(0.6)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const progressBar = useRef(new Animated.Value(0)).current;

  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [progressPercent, setProgressPercent] = useState(15);

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(progressBar, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();

    // Dynamic ticker updates across 2000ms
    const t1 = setTimeout(() => {
      setStatusText(STATUS_MESSAGES[1]);
      setProgressPercent(52);
    }, 600);

    const t2 = setTimeout(() => {
      setStatusText(STATUS_MESSAGES[2]);
      setProgressPercent(85);
    }, 1300);

    const t3 = setTimeout(() => {
      setStatusText(STATUS_MESSAGES[3]);
      setProgressPercent(100);
    }, 1800);

    // 2. Continuous Radar Waves
    const radarLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(radarScale, {
            toValue: 2.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(radarScale, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(radarOpacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(radarOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    radarLoop.start();

    // 3. Exactly 2 seconds as requested: show Meshvi logo for 2 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      radarLoop.stop();
    };
  }, []);

  const progressWidth = progressBar.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      {/* Premium Light Subtle Background */}
      <LinearGradient
        colors={[MeshviColors.white, MeshviColors.background, '#EDF2F7']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centerStage}>
        {/* Animated Radar Pulse Rings */}
        <Animated.View
          style={[
            styles.radarRing,
            {
              transform: [{ scale: radarScale }],
              opacity: radarOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.radarRingSecondary,
            {
              transform: [{ scale: Animated.multiply(radarScale, 0.75) }],
              opacity: radarOpacity,
            },
          ]}
        />

        {/* Floating Executive Monogram */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 88, height: 88, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Meta Typography */}
        <Animated.View style={[styles.metaBlock, { opacity: contentFade }]}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>
              Meshvi<Text style={{ color: MeshviColors.accent }}>.</Text>
            </Text>
            <View style={styles.tierPill}>
              <Text style={styles.tierText}>ENTERPRISE</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Bilateral Intent & Commercial Corridors</Text>

          {/* Dynamic Status Ticker */}
          <View style={styles.securityPill}>
            <View style={styles.livePulse} />
            <Text style={styles.securityText}>{statusText}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Loading Progress & Node Identifier */}
      <Animated.View style={[styles.bottomFooter, { opacity: contentFade }]}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Initializing Workspace Node</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        <View style={styles.nodeStatusRow}>
          <MaterialCommunityIcons name="shield-check" size={13} color={MeshviColors.accent} style={{ marginRight: 6 }} />
          <Text style={styles.nodeStatusText}>SOC-2 Type II Certified Node • 3,000+ Verified Enterprises</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MeshviColors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  radarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(15, 118, 110, 0.28)',
  },
  radarRingSecondary: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 118, 110, 0.16)',
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: MeshviColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBadge: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
  },
  logoLetter: {
    color: MeshviColors.white,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoNodeDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    borderWidth: 1.5,
    borderColor: MeshviColors.white,
  },
  metaBlock: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    color: MeshviColors.primary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tierPill: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  tierText: {
    color: MeshviColors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tagline: {
    color: MeshviColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 16,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  livePulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: MeshviColors.accent,
    marginRight: 8,
  },
  securityText: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomFooter: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  progressLabel: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercent: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: MeshviColors.accent,
    borderRadius: 3,
  },
  nodeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeStatusText: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
});
