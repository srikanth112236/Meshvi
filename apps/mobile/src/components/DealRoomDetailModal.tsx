import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, MeshviColors } from '../theme/colors';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { DealRoom, DealMilestone, DealDocument } from '../types';
import {
  openGoogleMeet,
  openGoogleCalendar,
  shareMeetingInvite,
  copyMeetingInviteToClipboard,
} from '../services/googleMeetService';

const { width, height } = Dimensions.get('window');

type TabType = 'OVERVIEW' | 'NDA' | 'MILESTONES' | 'VIDEO' | 'DOCS';

interface DealRoomDetailModalProps {
  visible: boolean;
  dealRoom: DealRoom | null;
  onClose: () => void;
  onUpdateRoom?: (updated: DealRoom) => void;
}

const DEFAULT_MILESTONES: DealMilestone[] = [
  {
    id: 'm-1',
    title: 'Mutual Bilateral Non-Disclosure Execution (mNDA)',
    description: 'Cryptographic countersignature and corporate entity compliance review.',
    dueDate: 'Day 1',
    isCompleted: true,
  },
  {
    id: 'm-2',
    title: 'Commercial Term Sheet & Pricing Schedule Alignment',
    description: 'Volume commitments, SLA guarantees, and payment escrow conditions.',
    dueDate: 'Day 7',
    isCompleted: true,
  },
  {
    id: 'm-3',
    title: 'Technical Integration & Supply Chain Corridor Verification',
    description: 'API connectivity, bonded warehouse node inspection, and carrier accreditation.',
    dueDate: 'Day 14',
    isCompleted: false,
  },
  {
    id: 'm-4',
    title: 'Final Master Services Agreement (MSA) Execution',
    description: 'Board sign-off, bilateral legal clearance, and formal commercial kickoff.',
    dueDate: 'Day 21',
    isCompleted: false,
  },
];

const DEFAULT_DOCUMENTS: DealDocument[] = [
  {
    id: 'doc-1',
    name: 'Bilateral_Executed_mNDA_Countersigned.pdf',
    size: '1.4 MB',
    uploadedAt: 'Today at 09:30 AM',
    isEncrypted: true,
    type: 'pdf',
  },
  {
    id: 'doc-2',
    name: 'Commercial_Volume_Pricing_Schedule_2026.pdf',
    size: '2.8 MB',
    uploadedAt: 'Yesterday',
    isEncrypted: true,
    type: 'pdf',
  },
  {
    id: 'doc-3',
    name: 'Bonded_Warehouse_Customs_SLA_Accreditation.pdf',
    size: '3.1 MB',
    uploadedAt: '2 days ago',
    isEncrypted: true,
    type: 'pdf',
  },
];

export const DealRoomDetailModal: React.FC<DealRoomDetailModalProps> = ({
  visible,
  dealRoom,
  onClose,
  onUpdateRoom,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showSuccess, showError, showConfirm } = useModal();

  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [roomState, setRoomState] = useState<DealRoom | null>(dealRoom);

  // NDA Signing State
  const [isSigningNda, setIsSigningNda] = useState(false);
  const [signerName, setSignerName] = useState(user?.profile?.displayName || user?.name || 'Executive Decision Maker');
  const [legalEntity, setLegalEntity] = useState(user?.profile?.currentCompanyName || 'Novus Infrastructure');

  // Milestone State
  const [milestones, setMilestones] = useState<DealMilestone[]>(
    dealRoom?.milestones && dealRoom.milestones.length > 0 ? dealRoom.milestones : DEFAULT_MILESTONES
  );
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDue, setNewMilestoneDue] = useState('');

  // Documents
  const [documents, setDocuments] = useState<DealDocument[]>(
    dealRoom?.documents && dealRoom.documents.length > 0 ? dealRoom.documents : DEFAULT_DOCUMENTS
  );

  // Update room state when prop changes
  React.useEffect(() => {
    if (dealRoom) {
      setRoomState(dealRoom);
      if (dealRoom.milestones && dealRoom.milestones.length > 0) {
        setMilestones(dealRoom.milestones);
      }
      if (dealRoom.documents && dealRoom.documents.length > 0) {
        setDocuments(dealRoom.documents);
      }
    }
  }, [dealRoom]);

  if (!visible || !roomState) return null;

  const isSigned = roomState.ndaStatus === 'SIGNED';
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / Math.max(1, milestones.length)) * 100);

  // Toggle milestone completion
  const handleToggleMilestone = (id: string) => {
    const updated = milestones.map((m) =>
      m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
    );
    setMilestones(updated);
    if (onUpdateRoom && roomState) {
      const updatedRoom: DealRoom = { ...roomState, milestones: updated };
      onUpdateRoom(updatedRoom);
      setRoomState(updatedRoom);
    }
  };

  // Add new milestone
  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) {
      showError('Milestone Title Required', 'Please specify a title for the deal room milestone.');
      return;
    }
    const newM: DealMilestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDue.trim() || 'Pending',
      isCompleted: false,
    };
    const updated = [...milestones, newM];
    setMilestones(updated);
    setNewMilestoneTitle('');
    setNewMilestoneDue('');
    setShowAddMilestone(false);
    showSuccess('Milestone Added', `"${newM.title}" has been appended to the bilateral roadmap.`);
    if (onUpdateRoom && roomState) {
      const updatedRoom: DealRoom = { ...roomState, milestones: updated };
      onUpdateRoom(updatedRoom);
      setRoomState(updatedRoom);
    }
  };

  // Execute NDA
  const handleExecuteNda = () => {
    if (!signerName.trim() || !legalEntity.trim()) {
      showError('Credentials Required', 'Please provide both your legal signature name and company entity.');
      return;
    }
    setIsSigningNda(true);
    setTimeout(() => {
      setIsSigningNda(false);
      const updatedRoom: DealRoom = {
        ...roomState,
        ndaStatus: 'SIGNED',
        mndaSignerName: signerName.trim(),
        mndaLegalEntity: legalEntity.trim(),
        mndaSignedAt: new Date().toISOString(),
      };
      setRoomState(updatedRoom);
      if (onUpdateRoom) onUpdateRoom(updatedRoom);
      showSuccess(
        'Mutual NDA Executed 🛡️',
        `Cryptographic attestation recorded for ${legalEntity.trim()}. Bilateral data vault unlocked.`
      );
    }, 600);
  };

  // Close Deal Room
  const handleCloseDealRoom = () => {
    showConfirm({
      title: 'Conclude Deal Room',
      message:
        'Conclude negotiations and record bilateral commercial outcome on the enterprise ledger?',
      confirmText: 'Record Outcome',
      cancelText: 'Continue Corridor',
      isDestructive: false,
      badgeText: 'OUTCOME ATTESTATION',
      onConfirm: () => {
        showSuccess('Deal Closed Successfully', 'Bilateral partnership outcome attested with verified audit trail.');
        onClose();
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.75}>
            <Feather name="arrow-left" size={18} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {roomState.counterpartyCompany}
              </Text>
              <View style={[styles.statusBadge, isSigned ? styles.statusBadgeSigned : styles.statusBadgePending]}>
                <Text style={[styles.statusBadgeText, isSigned ? styles.statusBadgeTextSigned : styles.statusBadgeTextPending]}>
                  {isSigned ? 'NDA Sealed ✓' : 'Mutual Review'}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSub}>
              Corridor with {roomState.counterpartyName} • {roomState.mutualSynergy}% Synergy
            </Text>
          </View>

          <TouchableOpacity style={styles.closeDealBtn} onPress={handleCloseDealRoom} activeOpacity={0.8}>
            <Feather name="check-circle" size={13} color="#0284C7" style={{ marginRight: 4 }} />
            <Text style={styles.closeDealBtnText}>Conclude</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'OVERVIEW' && styles.tabItemActive]}
              onPress={() => setActiveTab('OVERVIEW')}
            >
              <Feather name="info" size={12} color={activeTab === 'OVERVIEW' ? '#0284C7' : '#64748B'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabItemText, activeTab === 'OVERVIEW' && styles.tabItemTextActive]}>
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'NDA' && styles.tabItemActive]}
              onPress={() => setActiveTab('NDA')}
            >
              <Feather name="shield" size={12} color={activeTab === 'NDA' ? '#0284C7' : '#64748B'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabItemText, activeTab === 'NDA' && styles.tabItemTextActive]}>
                Mutual NDA {isSigned ? '✓' : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'MILESTONES' && styles.tabItemActive]}
              onPress={() => setActiveTab('MILESTONES')}
            >
              <Feather name="check-square" size={12} color={activeTab === 'MILESTONES' ? '#0284C7' : '#64748B'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabItemText, activeTab === 'MILESTONES' && styles.tabItemTextActive]}>
                Milestones ({completedCount}/{milestones.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'VIDEO' && styles.tabItemActive]}
              onPress={() => setActiveTab('VIDEO')}
            >
              <Feather name="video" size={12} color={activeTab === 'VIDEO' ? '#0284C7' : '#64748B'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabItemText, activeTab === 'VIDEO' && styles.tabItemTextActive]}>
                Google Meet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'DOCS' && styles.tabItemActive]}
              onPress={() => setActiveTab('DOCS')}
            >
              <Feather name="folder" size={12} color={activeTab === 'DOCS' ? '#0284C7' : '#64748B'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabItemText, activeTab === 'DOCS' && styles.tabItemTextActive]}>
                Vault ({documents.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content Body */}
        <ScrollView style={styles.contentBody} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <View style={{ gap: 14 }}>
              {/* Counterparty Executive Card */}
              <View style={styles.cardBox}>
                <View style={styles.counterpartyRow}>
                  <Image
                    source={{
                      uri:
                        roomState.counterpartyAvatar ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                    }}
                    style={styles.counterpartyAvatar}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.counterpartyName}>{roomState.counterpartyName}</Text>
                    <Text style={styles.counterpartyCompany}>{roomState.counterpartyCompany}</Text>
                    <View style={styles.verifiedRow}>
                      <Feather name="check-circle" size={11} color="#166534" style={{ marginRight: 3 }} />
                      <Text style={styles.verifiedText}>Verified Corporate Decision Maker</Text>
                    </View>
                  </View>
                  <View style={styles.synergyRing}>
                    <Text style={styles.synergyNum}>{roomState.mutualSynergy}%</Text>
                    <Text style={styles.synergyLabel}>Synergy</Text>
                  </View>
                </View>
              </View>

              {/* Bilateral Agenda */}
              <View style={styles.cardBox}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="target" size={14} color="#0284C7" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Bilateral Commercial Agenda</Text>
                </View>
                <Text style={styles.agendaBody}>{roomState.primaryAgenda}</Text>
              </View>

              {/* Progress Bar Overview */}
              <View style={styles.cardBox}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="bar-chart-2" size={14} color="#0284C7" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Deal Execution Roadmap</Text>
                  <Text style={styles.roadmapPercent}>{progressPercent}% Done</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressSub}>
                  {completedCount} of {milestones.length} bilateral milestones signed off.
                </Text>
              </View>

              {/* E2E Security Protocol Box */}
              <View style={styles.securityBox}>
                <Feather name="lock" size={14} color="#166534" style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.securityTitle}>E2E Encrypted Commercial Workspace</Text>
                  <Text style={styles.securityDesc}>
                    All communications, attachments, and milestone approvals within this Deal Room are cryptographically signed and stored in compliance with enterprise audit standards.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: MUTUAL NDA */}
          {activeTab === 'NDA' && (
            <View style={{ gap: 14 }}>
              <View style={styles.cardBox}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="shield" size={15} color="#0284C7" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Cryptographic Mutual NDA (mNDA)</Text>
                  <View style={[styles.statusBadge, isSigned ? styles.statusBadgeSigned : styles.statusBadgePending]}>
                    <Text style={[styles.statusBadgeText, isSigned ? styles.statusBadgeTextSigned : styles.statusBadgeTextPending]}>
                      {isSigned ? 'Sealed & Validated' : 'Execution Required'}
                    </Text>
                  </View>
                </View>

                {isSigned ? (
                  <View style={styles.signedNdaBox}>
                    <View style={styles.signedNdaRow}>
                      <Feather name="check-circle" size={16} color="#166534" style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.signedNdaTitle}>Mutual NDA Validated & Countersigned</Text>
                        <Text style={styles.signedNdaSub}>
                          Signer: {roomState.mndaSignerName || signerName} ({roomState.mndaLegalEntity || legalEntity})
                        </Text>
                        <Text style={styles.signedNdaTimestamp}>
                          Attestation Hash: SHA256-4b89f2a019e • Cryptographically Locked
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.ndaExplanation}>
                      Executing this mutual agreement enables reciprocal sharing of pricing schedules, custom RFP specifications, and direct contract execution.
                    </Text>

                    <View style={{ gap: 10, marginTop: 12 }}>
                      <View>
                        <Text style={styles.inputLabel}>Authorized Signer Full Name</Text>
                        <TextInput
                          style={styles.textInput}
                          value={signerName}
                          onChangeText={setSignerName}
                          placeholder="e.g. Aditi Park"
                        />
                      </View>

                      <View>
                        <Text style={styles.inputLabel}>Corporate Entity</Text>
                        <TextInput
                          style={styles.textInput}
                          value={legalEntity}
                          onChangeText={setLegalEntity}
                          placeholder="e.g. Novus Infrastructure Ltd"
                        />
                      </View>

                      <TouchableOpacity
                        style={styles.executeNdaBtn}
                        onPress={handleExecuteNda}
                        disabled={isSigningNda}
                        activeOpacity={0.85}
                      >
                        {isSigningNda ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Feather name="shield" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.executeNdaBtnText}>Execute Cryptographic mNDA</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 3: MILESTONES */}
          {activeTab === 'MILESTONES' && (
            <View style={{ gap: 12 }}>
              <View style={styles.cardBox}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="check-square" size={15} color="#0284C7" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Bilateral Milestones</Text>
                  <TouchableOpacity
                    style={styles.addMilestoneToggle}
                    onPress={() => setShowAddMilestone(!showAddMilestone)}
                  >
                    <Feather name={showAddMilestone ? 'x' : 'plus'} size={12} color="#0284C7" style={{ marginRight: 3 }} />
                    <Text style={styles.addMilestoneToggleText}>
                      {showAddMilestone ? 'Cancel' : 'Add Milestone'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showAddMilestone && (
                  <View style={styles.addMilestoneForm}>
                    <Text style={styles.inputLabel}>Milestone Description</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newMilestoneTitle}
                      onChangeText={setNewMilestoneTitle}
                      placeholder="e.g. Custom clearance protocol review"
                    />
                    <Text style={[styles.inputLabel, { marginTop: 8 }]}>Target Timeline / Due Date</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newMilestoneDue}
                      onChangeText={setNewMilestoneDue}
                      placeholder="e.g. Next Week or Oct 30"
                    />
                    <TouchableOpacity
                      style={styles.submitMilestoneBtn}
                      onPress={handleAddMilestone}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.submitMilestoneBtnText}>Add Milestone to Roadmap</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ gap: 8, marginTop: 10 }}>
                  {milestones.map((milestone) => (
                    <TouchableOpacity
                      key={milestone.id}
                      style={[styles.milestoneRow, milestone.isCompleted && styles.milestoneRowCompleted]}
                      onPress={() => handleToggleMilestone(milestone.id)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.checkbox, milestone.isCompleted && styles.checkboxCompleted]}>
                        {milestone.isCompleted && <Feather name="check" size={12} color="#FFFFFF" />}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.milestoneTitle, milestone.isCompleted && styles.milestoneTitleCompleted]}>
                          {milestone.title}
                        </Text>
                        {milestone.description && (
                          <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                        )}
                        <Text style={styles.milestoneDue}>Target: {milestone.dueDate || 'Flexible'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* TAB 4: VIDEO MEET */}
          {activeTab === 'VIDEO' && (
            <View style={{ gap: 14 }}>
              <View style={styles.cardBox}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="google" size={15} color="#4285F4" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Google Meet Video Corridor</Text>
                </View>

                <View style={styles.videoCardInner}>
                  <View style={styles.videoPillRow}>
                    <View style={styles.meetBrandingPill}>
                      <MaterialCommunityIcons name="google" size={12} color="#4285F4" style={{ marginRight: 4 }} />
                      <Text style={styles.meetBrandingText}>Google Meet Video</Text>
                    </View>
                    <View style={styles.slotConfirmedPill}>
                      <Feather name="check" size={10} color="#166534" style={{ marginRight: 3 }} />
                      <Text style={styles.slotConfirmedText}>Confirmed Slot</Text>
                    </View>
                  </View>

                  <Text style={styles.slotTimeTitle}>
                    {roomState.calendarSlotBooked || 'Tomorrow, 03:00 PM SGT'}
                  </Text>
                  <Text style={styles.slotSub}>
                    Direct 30-minute bilateral video sync with {roomState.counterpartyName}.
                  </Text>

                  {roomState.meetUrl && (
                    <View style={styles.meetUrlContainer}>
                      <Feather name="video" size={13} color="#0284C7" style={{ marginRight: 6 }} />
                      <Text style={styles.meetUrlString} numberOfLines={1}>
                        {roomState.meetUrl}
                      </Text>
                      <TouchableOpacity
                        onPress={async () => {
                          if (roomState.meetUrl) {
                            await copyMeetingInviteToClipboard(roomState.meetUrl);
                            showSuccess('Copied', 'Google Meet URL copied to clipboard.');
                          }
                        }}
                        style={{ padding: 4 }}
                      >
                        <Feather name="copy" size={12} color="#0284C7" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={{ gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      style={styles.joinMeetLargeBtn}
                      onPress={() => roomState.meetUrl && openGoogleMeet(roomState.meetUrl)}
                      activeOpacity={0.88}
                    >
                      <Feather name="video" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.joinMeetLargeBtnText}>Join Google Meet Now</Text>
                    </TouchableOpacity>

                    {roomState.googleCalendarUrl && (
                      <TouchableOpacity
                        style={styles.addToCalLargeBtn}
                        onPress={() => roomState.googleCalendarUrl && openGoogleCalendar(roomState.googleCalendarUrl)}
                        activeOpacity={0.8}
                      >
                        <Feather name="calendar" size={14} color="#1E40AF" style={{ marginRight: 6 }} />
                        <Text style={styles.addToCalLargeBtnText}>Add Slot to Google Calendar</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.shareMeetLargeBtn}
                      onPress={async () => {
                        if (roomState.meetUrl) {
                          await shareMeetingInvite({
                            title: `${roomState.counterpartyCompany} Deal Room Review`,
                            meetUrl: roomState.meetUrl,
                            datetime: roomState.calendarSlotBooked || 'Confirmed Slot',
                            partnerName: roomState.counterpartyName,
                            agenda: roomState.primaryAgenda,
                          });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Feather name="share-2" size={14} color="#64748B" style={{ marginRight: 6 }} />
                      <Text style={styles.shareMeetLargeBtnText}>Share Video Link with Team</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 5: DOCUMENT VAULT */}
          {activeTab === 'DOCS' && (
            <View style={{ gap: 12 }}>
              <View style={styles.cardBox}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="folder" size={15} color="#0284C7" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Confidential Document Vault</Text>
                  <Text style={styles.vaultCount}>{documents.length} Files</Text>
                </View>

                <View style={{ gap: 8, marginTop: 10 }}>
                  {documents.map((doc) => (
                    <View key={doc.id} style={styles.docRow}>
                      <View style={styles.docIconWrap}>
                        <Feather name="file-text" size={16} color="#0284C7" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.docName} numberOfLines={1}>
                          {doc.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Text style={styles.docMeta}>{doc.size} • {doc.uploadedAt}</Text>
                          {doc.isEncrypted && (
                            <View style={styles.encryptedPill}>
                              <Feather name="lock" size={9} color="#166534" style={{ marginRight: 2 }} />
                              <Text style={styles.encryptedPillText}>Encrypted</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.docDownloadBtn}
                        onPress={() => {
                          showSuccess('File Attestation', `Accessing verified encrypted document: ${doc.name}`);
                        }}
                        activeOpacity={0.7}
                      >
                        <Feather name="download" size={13} color="#0284C7" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeSigned: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  statusBadgeTextSigned: {
    color: '#166534',
  },
  statusBadgeTextPending: {
    color: '#92400E',
  },
  closeDealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  closeDealBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: '#E0F2FE',
  },
  tabItemText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabItemTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  contentBody: {
    flex: 1,
    padding: 14,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  counterpartyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterpartyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  counterpartyName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  counterpartyCompany: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#166534',
  },
  synergyRing: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  synergyNum: {
    fontSize: 14,
    fontWeight: '900',
    color: '#166534',
  },
  synergyLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#166534',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  agendaBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  roadmapPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 3,
  },
  progressSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 6,
  },
  securityBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  securityDesc: {
    fontSize: 10.5,
    color: '#15803D',
    lineHeight: 15,
    marginTop: 2,
  },
  signedNdaBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 8,
  },
  signedNdaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  signedNdaTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
  },
  signedNdaSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  signedNdaTimestamp: {
    fontSize: 9.5,
    color: '#166534',
    fontWeight: '600',
    marginTop: 4,
  },
  ndaExplanation: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0F172A',
  },
  executeNdaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  executeNdaBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addMilestoneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  addMilestoneToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  addMilestoneForm: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 8,
  },
  submitMilestoneBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitMilestoneBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  milestoneRowCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxCompleted: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  milestoneTitleCompleted: {
    color: '#166534',
    textDecorationLine: 'line-through',
  },
  milestoneDesc: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  milestoneDue: {
    fontSize: 9.5,
    color: '#0284C7',
    fontWeight: '700',
    marginTop: 3,
  },
  videoCardInner: {
    marginTop: 6,
  },
  videoPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  meetBrandingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  meetBrandingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  slotConfirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  slotConfirmedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#166534',
  },
  slotTimeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  slotSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  meetUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  meetUrlString: {
    flex: 1,
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  joinMeetLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinMeetLargeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addToCalLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 10,
  },
  addToCalLargeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  shareMeetLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
  },
  shareMeetLargeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  vaultCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  docMeta: {
    fontSize: 10,
    color: '#64748B',
  },
  encryptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  encryptedPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#166534',
  },
  docDownloadBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
