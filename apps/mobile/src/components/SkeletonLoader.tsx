import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { MeshviColors } from '../theme/colors';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

// Compact Search Card Skeleton
export const SearchCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardTopRow}>
        <SkeletonBox width={44} height={44} borderRadius={12} style={{ marginRight: 10 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <SkeletonBox width="45%" height={14} borderRadius={4} style={{ marginRight: 8 }} />
            <SkeletonBox width={46} height={14} borderRadius={4} />
          </View>
          <SkeletonBox width="65%" height={11} borderRadius={4} style={{ marginBottom: 4 }} />
          <SkeletonBox width="50%" height={10} borderRadius={4} />
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            <SkeletonBox width={70} height={16} borderRadius={6} />
            <SkeletonBox width={85} height={16} borderRadius={6} />
          </View>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <SkeletonBox width={90} height={30} borderRadius={8} />
        <SkeletonBox width="35%" height={30} borderRadius={8} />
        <SkeletonBox width={32} height={30} borderRadius={8} />
        <SkeletonBox width={32} height={30} borderRadius={8} />
      </View>
    </View>
  );
};

// Connection / Introduction Card Skeleton
export const ConnectionCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardTopRow}>
        <SkeletonBox width={46} height={46} borderRadius={14} style={{ marginRight: 12 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <SkeletonBox width="55%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="70%" height={11} borderRadius={4} style={{ marginBottom: 4 }} />
          <SkeletonBox width="40%" height={10} borderRadius={4} />
        </View>
      </View>
      <View style={{ marginTop: 10 }}>
        <SkeletonBox width="90%" height={11} borderRadius={4} style={{ marginBottom: 4 }} />
        <SkeletonBox width="75%" height={11} borderRadius={4} />
      </View>
      <View style={[styles.cardBottomRow, { marginTop: 12 }]}>
        <SkeletonBox width="48%" height={34} borderRadius={10} />
        <SkeletonBox width="48%" height={34} borderRadius={10} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E2E8F0',
  },
  cardSkeleton: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
});
