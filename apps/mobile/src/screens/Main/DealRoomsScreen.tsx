import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useModal } from '../../context/ModalContext';
import { DealRoom } from '../../types';
import {
  createGoogleMeetSession,
  openGoogleMeet,
  openGoogleCalendar,
  shareMeetingInvite,
  copyMeetingInviteToClipboard,
} from '../../services/googleMeetService';

const DEMO_ROOMS: DealRoom[] = [
  {
    id: 'dr1',
    counterpartyName: 'Elena Rostova',
    counterpartyCompany: 'Aura Logistics APAC',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    ndaStatus: 'SIGNED',
    mutualSynergy: 96,
    primaryAgenda: 'Cross-border bonded warehouse distribution agreement and technical API integration.',
    unlockedAt: 'Today at 09:30 AM',
    lastActivity: '12m ago',
    calendarSlotBooked: 'Tomorrow, 03:00 PM SGT',
    meetUrl: 'https://meet.google.com/qmv-rtws-kpa',
    googleCalendarUrl:
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Aura%20Logistics%20APAC%20Deal%20Room%20Review&dates=20261026T070000Z/20261026T073000Z&details=Confidential%20Deal%20Room%20Review%20with%20Elena%20Rostova&location=https%3A%2F%2Fmeet.google.com%2Fqmv-rtws-kpa',
  },
  {
    id: 'dr2',
    counterpartyName: 'Vikram Sethi',
    counterpartyCompany: 'Vertex Nexus Global',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    ndaStatus: 'MUTUAL_REVIEW',
    mutualSynergy: 92,
    primaryAgenda: 'Review of $50M credit line terms & institutional treasury escrow protocol.',
    unlockedAt: 'Yesterday',
    lastActivity: '2h ago',
  },
];

export interface DealRoomsScreenProps {
  onBack?: () => void;
}

export const DealRoomsScreen: React.FC<DealRoomsScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { showSuccess, showInfo } = useModal();
  const [rooms, setRooms] = useState<DealRoom[]>(DEMO_ROOMS);

  const handleLockSlot = (room: DealRoom) => {
    const session = createGoogleMeetSession({
      title: `${room.counterpartyCompany} Deal Room Review`,
      datePreset: 'TOMORROW',
      timeSlot: '03:00 PM',
      durationStr: '30 Mins',
      partnerName: room.counterpartyName,
      description: room.primaryAgenda,
    });

    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? {
              ...r,
              calendarSlotBooked: session.datetime,
              meetUrl: session.meetUrl,
              googleCalendarUrl: session.googleCalendarUrl,
            }
          : r
      )
    );

    showSuccess(
      'Google Meet Slot Locked',
      `Confidential video conference generated with ${room.counterpartyName}.\nMeet URL: ${session.meetUrl}`,
      'Done'
    );
  };

  const handleJoinMeet = (meetUrl?: string) => {
    if (!meetUrl) return;
    openGoogleMeet(meetUrl);
  };

  const handleAddToCalendar = (calendarUrl?: string) => {
    if (!calendarUrl) return;
    openGoogleCalendar(calendarUrl);
  };

  const handleShareMeet = async (room: DealRoom) => {
    if (!room.meetUrl) return;
    await shareMeetingInvite({
      title: `${room.counterpartyCompany} Deal Room Review`,
      meetUrl: room.meetUrl,
      datetime: room.calendarSlotBooked || 'Confirmed Slot',
      partnerName: room.counterpartyName,
      agenda: room.primaryAgenda,
    });
  };

  const handleCopyLink = async (meetUrl?: string) => {
    if (!meetUrl) return;
    await copyMeetingInviteToClipboard(meetUrl);
    showSuccess('Link Copied', 'Google Meet link copied to clipboard.', 'OK');
  };

  const handleEnterDealRoom = (room: DealRoom) => {
    showInfo(
      'Deal Room Corridor Active',
      `Secure E2E corridor active for ${room.counterpartyCompany}. NDA status: ${room.ndaStatus === 'SIGNED' ? 'Countersigned & Verified' : 'Under Mutual Review'}.`,
      'Proceed'
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={17} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}>
            <Text style={styles.title}>Micro Deal Rooms</Text>
            <Text style={styles.subtitle}>Confidential Corridors & Agenda Clearances</Text>
          </View>
        </View>
        <View style={styles.secureBadge}>
          <Feather name="lock" size={12} color={COLORS.emerald} style={{ marginRight: 4 }} />
          <Text style={styles.secureBadgeText}>E2E Encrypted</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* Deal Room Protocol Notice */}
        <View style={styles.infoBanner}>
          <Feather name="shield" size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.infoBannerText}>
            Deal Rooms are unlocked only after mutual synergy score exceeds 85% and both parties approve initial intent.
          </Text>
        </View>

        {rooms.map((room) => {
          const isSigned = room.ndaStatus === 'SIGNED';
          return (
            <View key={room.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={{ uri: room.counterpartyAvatar }} style={styles.avatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.name}>{room.counterpartyName}</Text>
                    <View style={[styles.ndaBadge, isSigned ? styles.ndaSigned : styles.ndaPending]}>
                      <Text style={[styles.ndaText, isSigned ? styles.ndaSignedText : styles.ndaPendingText]}>
                        {isSigned ? 'NDA Sealed ✓' : 'Mutual Review'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.company}>{room.counterpartyCompany}</Text>
                  <Text style={styles.meta}>Unlocked {room.unlockedAt} &bull; Synergy {room.mutualSynergy}%</Text>
                </View>
              </View>

              {/* Agenda Box */}
              <View style={styles.agendaBox}>
                <Text style={styles.agendaLabel}>MUTUAL COMMERCIAL AGENDA:</Text>
                <Text style={styles.agendaText}>{room.primaryAgenda}</Text>
              </View>

              {/* Calendar Slot Info & Google Meet Link */}
              {room.calendarSlotBooked ? (
                <View style={styles.calendarSlotBox}>
                  <View style={styles.calendarSlotHeader}>
                    <View style={styles.meetBrandingPill}>
                      <MaterialCommunityIcons name="google" size={12} color="#4285F4" style={{ marginRight: 4 }} />
                      <Text style={styles.meetBrandingText}>Google Meet Video</Text>
                    </View>
                    <View style={styles.slotConfirmedPill}>
                      <Feather name="check" size={10} color={COLORS.emerald} style={{ marginRight: 3 }} />
                      <Text style={styles.slotConfirmedText}>Confirmed</Text>
                    </View>
                  </View>

                  <View style={styles.slotDetailsRow}>
                    <Feather name="clock" size={12} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.slotTimeText}>{room.calendarSlotBooked}</Text>
                  </View>

                  {room.meetUrl && (
                    <View style={styles.meetUrlBox}>
                      <Feather name="video" size={12} color={COLORS.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.meetUrlText} numberOfLines={1}>
                        {room.meetUrl}
                      </Text>
                      <TouchableOpacity
                        style={styles.meetCopyMiniBtn}
                        onPress={() => handleCopyLink(room.meetUrl)}
                        activeOpacity={0.7}
                      >
                        <Feather name="copy" size={11} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Actions Row */}
                  <View style={styles.meetActionsRow}>
                    <TouchableOpacity
                      style={styles.joinMeetBtn}
                      onPress={() => handleJoinMeet(room.meetUrl)}
                      activeOpacity={0.8}
                    >
                      <Feather name="video" size={13} color={COLORS.white} style={{ marginRight: 5 }} />
                      <Text style={styles.joinMeetBtnText}>Join Google Meet</Text>
                    </TouchableOpacity>

                    {room.googleCalendarUrl && (
                      <TouchableOpacity
                        style={styles.addToGCalBtn}
                        onPress={() => handleAddToCalendar(room.googleCalendarUrl)}
                        activeOpacity={0.8}
                      >
                        <Feather name="calendar" size={13} color="#1E40AF" style={{ marginRight: 5 }} />
                        <Text style={styles.addToGCalBtnText}>Add to Calendar</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.shareMeetBtn}
                      onPress={() => handleShareMeet(room)}
                      activeOpacity={0.8}
                    >
                      <Feather name="share-2" size={13} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.lockSlotBtn}
                  onPress={() => handleLockSlot(room)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="google" size={14} color={COLORS.primary} style={{ marginRight: 5 }} />
                  <Feather name="calendar" size={13} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.lockSlotBtnText}>Lock Google Meet & Calendar Slot</Text>
                </TouchableOpacity>
              )}

              {/* Enter Corridor Action */}
              <TouchableOpacity
                style={styles.enterBtn}
                onPress={() => handleEnterDealRoom(room)}
                activeOpacity={0.88}
              >
                <Text style={styles.enterBtnText}>Enter Encrypted Deal Room</Text>
                <Feather name="arrow-right" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  secureBadgeText: {
    color: COLORS.emerald,
    fontSize: 10,
    fontWeight: '800',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 14,
  },
  infoBannerText: {
    flex: 1,
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  name: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  company: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  ndaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ndaSigned: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ndaPending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ndaText: {
    fontSize: 10,
    fontWeight: '800',
  },
  ndaSignedText: {
    color: COLORS.emerald,
  },
  ndaPendingText: {
    color: COLORS.amber,
  },
  agendaBox: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  agendaLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  agendaText: {
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 16,
  },
  calendarSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  calendarSlotText: {
    color: COLORS.emerald,
    fontSize: 11,
    fontWeight: '600',
  },
  lockSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  lockSlotBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  enterBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
  },
  calendarSlotBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendarSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  meetBrandingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#C7D2FE',
  },
  meetBrandingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
  },
  slotConfirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  slotConfirmedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  slotDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  meetUrlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
  },
  meetUrlText: {
    flex: 1,
    fontSize: 10.5,
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  meetCopyMiniBtn: {
    padding: 4,
  },
  meetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinMeetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E8E3E',
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinMeetBtnText: {
    color: COLORS.white,
    fontSize: 10.5,
    fontWeight: '800',
  },
  addToGCalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToGCalBtnText: {
    color: '#1E40AF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  shareMeetBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
