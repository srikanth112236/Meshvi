import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

type TileKind = 'search' | 'company' | 'filters' | 'chat' | 'network' | 'story';

interface DemoTile {
  title: string;
  desc: string;
  chapter: number;
  meta: string;
  badge?: string;
  tone: readonly [string, string];
  kind: TileKind;
}

const DEMO_TILES: DemoTile[] = [
  {
    title: 'Search by mandate',
    desc: 'Describe the outcome — the console parses intent',
    chapter: 1,
    meta: '0:15',
    badge: 'How to search',
    tone: ['#F0F9FF', '#E0F2FE'],
    kind: 'search',
  },
  {
    title: 'Search by company',
    desc: 'Typeahead to a verified company dossier',
    chapter: 2,
    meta: '0:15',
    badge: 'How to search',
    tone: ['#F8FAFC', '#E2E8F0'],
    kind: 'company',
  },
  {
    title: 'Search with filters',
    desc: 'Layer intent filters — 4,218 people narrow to 24 matches',
    chapter: 3,
    meta: '0:15',
    badge: 'How to search',
    tone: ['#F1F5F9', '#E0F2FE'],
    kind: 'filters',
  },
  {
    title: 'Close a connection',
    desc: 'Match → request → accept → relationship in 30s',
    chapter: 4,
    meta: '0:30',
    tone: ['#F0FDF4', '#DCFCE7'],
    kind: 'chat',
  },
  {
    title: 'Warm introductions',
    desc: 'A network graph through a mutual peer',
    chapter: 5,
    meta: '0:15',
    tone: ['#FFFBEB', '#FEF3C7'],
    kind: 'network',
  },
  {
    title: 'MESHVI in 15 seconds',
    desc: 'The brand film — story, not screenshots',
    chapter: 0,
    meta: '0:15',
    badge: 'Story',
    tone: ['#E0F2FE', '#BAE6FD'],
    kind: 'story',
  },
];

export const VideoShowcaseCard: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<DemoTile | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.filmBadge}>
            <Feather name="film" size={13} color="#0284C7" />
            <Text style={styles.filmBadgeText}>PLATFORM SHOWCASE</Text>
          </View>
          <Text style={styles.title}>See MESHVI in Action</Text>
          <Text style={styles.subtitle}>Interactive 15-30s feature walkthroughs</Text>
        </View>

        <TouchableOpacity
          style={styles.watchStoryBtn}
          onPress={() => setSelectedChapter(DEMO_TILES[5])}
          activeOpacity={0.8}
        >
          <Feather name="play" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.watchStoryText}>Watch Story</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {DEMO_TILES.map((tile, idx) => (
          <TouchableOpacity
            key={tile.title}
            style={styles.tileCard}
            onPress={() => setSelectedChapter(tile)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={tile.tone}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tileGradient}
            >
              {/* Top Row: Chapter & Duration */}
              <View style={styles.tileTopRow}>
                <View style={styles.chapterTag}>
                  <Text style={styles.chapterTagText}>CH {tile.chapter}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Feather name="clock" size={10} color="#64748B" style={{ marginRight: 3 }} />
                  <Text style={styles.metaBadgeText}>{tile.meta}</Text>
                </View>
              </View>

              {/* Center Play Button Graphic */}
              <View style={styles.playGraphicWrap}>
                <View style={styles.playCircle}>
                  <Feather name="play" size={18} color="#0284C7" style={{ marginLeft: 2 }} />
                </View>
              </View>

              {/* Bottom Information */}
              <View style={styles.tileBottom}>
                {tile.badge && (
                  <Text style={styles.tileCategoryBadge}>{tile.badge.toUpperCase()}</Text>
                )}
                <Text style={styles.tileTitle} numberOfLines={1}>
                  {tile.title}
                </Text>
                <Text style={styles.tileDesc} numberOfLines={2}>
                  {tile.desc}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full-Screen Video Modal Player */}
      <Modal
        visible={!!selectedChapter}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedChapter(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.modalTagRow}>
                  <Text style={styles.modalChapterText}>
                    CHAPTER {selectedChapter?.chapter} • {selectedChapter?.meta}
                  </Text>
                </View>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedChapter?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedChapter(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Video Player Canvas */}
            <View style={styles.playerCanvas}>
              <LinearGradient
                colors={['#0F172A', '#1E293B', '#0F172A']}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.canvasCenter}>
                <TouchableOpacity
                  onPress={() => setIsPlaying(!isPlaying)}
                  style={styles.bigPlayBtn}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={isPlaying ? 'pause' : 'play'}
                    size={32}
                    color="#FFFFFF"
                    style={!isPlaying ? { marginLeft: 4 } : undefined}
                  />
                </TouchableOpacity>
                <Text style={styles.canvasDesc}>{selectedChapter?.desc}</Text>
                <View style={styles.simulatedIndicator}>
                  <View style={styles.pulsingDot} />
                  <Text style={styles.simulatedText}>
                    {isPlaying ? 'Playing interactive showcase...' : 'Showcase paused'}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: isPlaying ? '72%' : '40%' }]} />
              </View>
            </View>

            {/* Chapter Selection Bar inside modal */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modalChaptersRow}
            >
              {DEMO_TILES.map((t) => (
                <TouchableOpacity
                  key={t.title}
                  onPress={() => setSelectedChapter(t)}
                  style={[
                    styles.modalChapterPill,
                    selectedChapter?.chapter === t.chapter && styles.modalChapterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalChapterPillText,
                      selectedChapter?.chapter === t.chapter && styles.modalChapterPillTextActive,
                    ]}
                  >
                    Ch {t.chapter}: {t.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  filmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  filmBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    marginLeft: 5,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  watchStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  watchStoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  carouselContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
  tileCard: {
    width: 220,
    height: 155,
    marginRight: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tileGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  tileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  chapterTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.3,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  playGraphicWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tileBottom: {},
  tileCategoryBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  tileDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalTagRow: {
    marginBottom: 2,
  },
  modalChapterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  playerCanvas: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  canvasCenter: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bigPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  canvasDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 8,
  },
  simulatedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  simulatedText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#38BDF8',
  },
  modalChaptersRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
  },
  modalChapterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalChapterPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38BDF8',
  },
  modalChapterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modalChapterPillTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});
