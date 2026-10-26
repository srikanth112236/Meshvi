import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Modal, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { SafeStorage } from '../services/storage';
import { IntroSplashSlides } from '../screens/IntroSplashSlides';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { OtpVerificationScreen } from '../screens/Auth/OtpVerificationScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { DashboardScreen } from '../screens/Main/DashboardScreen';
import { PartnershipsScreen } from '../screens/Main/PartnershipsScreen';
import { SearchScreen } from '../screens/Main/SearchScreen';
import { ConnectionsScreen } from '../screens/Main/ConnectionsScreen';
import { IntroductionsScreen } from '../screens/Main/IntroductionsScreen';
import { DealRoomsScreen } from '../screens/Main/DealRoomsScreen';
import { MessagesScreen } from '../screens/Main/MessagesScreen';
import { ProfileScreen } from '../screens/Main/ProfileScreen';
import { SavedProfilesScreen } from '../screens/Main/SavedProfilesScreen';
import { NotificationsScreen } from '../screens/Main/NotificationsScreen';
import { useNotifications } from '../context/NotificationContext';

type SplashStage = 'intro_slides' | 'logo_splash' | 'ready';
type AuthScreen = 'welcome' | 'login' | 'register' | 'otp' | 'forgot';
type MainTab =
  | 'dashboard'
  | 'search'
  | 'partnerships'
  | 'connections'
  | 'introductions'
  | 'dealrooms'
  | 'messages'
  | 'profile'
  | 'saved_profiles'
  | 'notifications';

export const RootNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isOnboarded, loginWithToken } = useAuth();
  const { unreadCount } = useNotifications();
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [splashStage, setSplashStage] = useState<SplashStage>('intro_slides');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('register');
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);

  // Deep linking handler for seamless Google OAuth return (meshvi://)
  useEffect(() => {
    const handleDeepLinkUrl = (url?: string | null) => {
      if (!url) return;
      try {
        if (url.includes('token=')) {
          const queryString = url.includes('?') ? url.split('?')[1] : '';
          if (queryString) {
            const params = new URLSearchParams(queryString);
            const token = params.get('token');
            const refreshToken = params.get('refreshToken') || undefined;
            const userJson = params.get('user');
            if (token) {
              let parsedUser: any = null;
              if (userJson) {
                try {
                  parsedUser = JSON.parse(decodeURIComponent(userJson));
                } catch {}
              }
              loginWithToken(token, parsedUser, refreshToken);
            }
          }
        }
      } catch {}
    };

    Linking.getInitialURL().then(handleDeepLinkUrl);
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLinkUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [loginWithToken]);

  // Check if user has already seen the 3-slide intro onboarding slides (show only once)
  useEffect(() => {
    async function checkIntroStatus() {
      try {
        const seen = await SafeStorage.getItem('meshvi_intro_seen');
        if (seen === 'true') {
          // Skip intro slides permanently on subsequent launches
          setSplashStage('logo_splash');
        } else {
          setSplashStage('intro_slides');
        }
      } catch (err) {
        setSplashStage('intro_slides');
      } finally {
        setHasCheckedStorage(true);
      }
    }
    checkIntroStatus();
  }, []);

  const handleCompleteIntro = async () => {
    try {
      await SafeStorage.setItem('meshvi_intro_seen', 'true');
    } catch (e) {
      // safe fallback
    }
    setSplashStage('logo_splash');
  };

  const [targetPartnerForMessage, setTargetPartnerForMessage] = useState<{
    id?: string;
    name: string;
    company: string;
    role?: string;
    avatar?: string;
  } | null>(null);

  const handleOpenMessagesWithPartner = (partner: {
    id?: string;
    name: string;
    company: string;
    role?: string;
    avatar?: string;
  }) => {
    setTargetPartnerForMessage(partner);
    setActiveTab('messages');
  };

  const handleNavigateTab = (tab: string, initialQuery?: string, partner?: any) => {
    if (tab === 'more') {
      setIsMoreModalVisible(true);
      return;
    }
    if (initialQuery !== undefined) {
      setInitialSearchQuery(initialQuery);
    }
    if (partner) {
      setTargetPartnerForMessage(partner);
    }
    setActiveTab(tab as MainTab);
  };

  // Wait for initial storage check
  if (!hasCheckedStorage) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  // 1. Initial 3 Fullscreen Information Splash Slides (Shown only ONCE on first launch)
  if (splashStage === 'intro_slides') {
    return <IntroSplashSlides onContinue={handleCompleteIntro} />;
  }

  // 2. 2-Second Animated Meshvi Logo Splash Screen
  if (splashStage === 'logo_splash') {
    return <SplashScreen onFinish={() => setSplashStage('ready')} />;
  }

  // 3. Unauthenticated State (Starts on Register Screen first)
  if (!isAuthenticated) {
    switch (authScreen) {
      case 'register':
        return (
          <RegisterScreen
            onLogin={(email) => {
              if (email) setPrefilledEmail(email);
              setAuthScreen('login');
            }}
            onForgotPassword={(email) => {
              if (email) setPrefilledEmail(email);
              setAuthScreen('forgot');
            }}
            onOtpVerification={(email) => {
              setOtpTargetEmail(email);
              setAuthScreen('otp');
            }}
            onBack={() => setSplashStage('intro_slides')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            initialEmail={prefilledEmail}
            onRegister={() => setAuthScreen('register')}
            onForgotPassword={() => setAuthScreen('forgot')}
            onBack={() => setAuthScreen('register')}
          />
        );
      case 'otp':
        return (
          <OtpVerificationScreen
            email={otpTargetEmail}
            onSuccess={() => {
              // Transition handled automatically via AuthContext
            }}
            onBack={() => setAuthScreen('register')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordScreen
            onBackToLogin={() => setAuthScreen('login')}
          />
        );
      case 'welcome':
        return (
          <WelcomeScreen
            onLogin={() => setAuthScreen('login')}
            onRegister={() => setAuthScreen('register')}
          />
        );
      default:
        return (
          <RegisterScreen
            onLogin={() => setAuthScreen('login')}
            onOtpVerification={(email) => {
              setOtpTargetEmail(email);
              setAuthScreen('otp');
            }}
            onBack={() => setSplashStage('intro_slides')}
          />
        );
    }
  }

  // 3. Authenticated but Onboarding Incomplete
  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  // 4. Authenticated & Onboarded -> Main Executive Workspace Tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigateTab={handleNavigateTab} />;
      case 'search':
        return (
          <SearchScreen
            initialQuery={initialSearchQuery}
            onNavigateToMessages={handleOpenMessagesWithPartner}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'partnerships':
        return (
          <PartnershipsScreen
            onNavigateTab={handleNavigateTab}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'connections':
        return (
          <ConnectionsScreen
            onNavigateToMessages={handleOpenMessagesWithPartner}
            onNavigateTab={handleNavigateTab}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'introductions':
        return (
          <IntroductionsScreen
            onNavigateToMessages={handleOpenMessagesWithPartner}
            onNavigateTab={handleNavigateTab}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'dealrooms':
        return <DealRoomsScreen onBack={() => setActiveTab('dashboard')} />;
      case 'messages':
        return (
          <MessagesScreen
            targetPartner={targetPartnerForMessage}
            onClearTargetPartner={() => setTargetPartnerForMessage(null)}
            onNavigateTab={handleNavigateTab}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'profile':
        return <ProfileScreen onBack={() => setActiveTab('dashboard')} />;
      case 'saved_profiles':
        return (
          <SavedProfilesScreen
            onNavigateTab={handleNavigateTab}
            onNavigateToMessages={handleOpenMessagesWithPartner}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => setActiveTab('dashboard')}
            onNavigateTab={handleNavigateTab}
            onNavigateToMessages={handleOpenMessagesWithPartner}
          />
        );
      default:
        return <DashboardScreen onNavigateTab={handleNavigateTab} />;
    }
  };

  const tabs: Array<{ id: string; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'compass' },
    { id: 'partnerships', label: 'Partnerships', icon: 'briefcase' },
    { id: 'connections', label: 'Connections', icon: 'users' },
    { id: 'more', label: 'More', icon: 'grid' },
  ];

  const moreRoutes: Array<{
    id: MainTab;
    title: string;
    description: string;
    icon: string;
    color: string;
    badge?: string;
  }> = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Real-time corporate alerts, meeting updates & synergy invites',
      icon: 'bell',
      color: '#0284C7',
      badge: unreadCount > 0 ? `${unreadCount} New` : undefined,
    },
    {
      id: 'saved_profiles',
      title: 'Saved Profiles',
      description: 'Bookmarked decision makers, corporate entities & watchlist',
      icon: 'bookmark',
      color: '#D97706',
    },
    {
      id: 'introductions',
      title: 'Warm Introductions',
      description: 'Institutional endorsements, mutual bridges & warm channels',
      icon: 'share-2',
      color: '#059669',
    },
    {
      id: 'dealrooms',
      title: 'Deal Rooms',
      description: 'Confidential bilateral rooms, mandates & active proposals',
      icon: 'shield',
      color: '#0284C7',
    },
    {
      id: 'messages',
      title: 'Direct Messages',
      description: 'Encrypted executive messaging & direct bilateral chat',
      icon: 'message-square',
      color: '#6366F1',
    },
    {
      id: 'profile',
      title: 'Executive Profile',
      description: 'Identity verification, authority mandates & protocol rules',
      icon: 'user',
      color: '#8B5CF6',
    },
  ];

  const isMoreTabSelected = [
    'notifications',
    'saved_profiles',
    'introductions',
    'dealrooms',
    'messages',
    'profile',
  ].includes(activeTab);

  return (
    <View style={styles.mainWrapper}>
      {/* Screen Body */}
      <View style={styles.screenContainer}>{renderTabContent()}</View>

      {/* Bottom Executive Tab Navigation Bar */}
      <View
        style={[
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10) },
        ]}
      >
        {tabs.map((tab) => {
          const isSelected =
            tab.id === 'more' ? isMoreTabSelected : activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                if (tab.id === 'more') {
                  setIsMoreModalVisible(true);
                } else {
                  setActiveTab(tab.id as MainTab);
                }
              }}
              style={styles.tabItem}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.tabIconWrap,
                  isSelected && styles.tabIconWrapActive,
                ]}
              >
                <Feather
                  name={tab.icon as any}
                  size={19}
                  color={isSelected ? COLORS.primary : COLORS.textMuted}
                />
              </View>
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ========================================================
          WORKSPACE DIRECTORY & MORE MODAL
         ======================================================== */}
      <Modal
        visible={isMoreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMoreModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.moreModalOverlay}
          activeOpacity={1}
          onPress={() => setIsMoreModalVisible(false)}
        >
          <TouchableOpacity
            style={[
              styles.moreModalSheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.moreModalHandle} />

            <View style={styles.moreModalHeaderRow}>
              <View>
                <Text style={styles.moreModalTitle}>Workspace Directory</Text>
                <Text style={styles.moreModalSubtitle}>
                  Secondary modules & specialized workflows
                </Text>
              </View>
              <TouchableOpacity
                style={styles.moreModalCloseBtn}
                onPress={() => setIsMoreModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={styles.moreGrid}>
                {moreRoutes.map((route) => {
                  const isActiveRoute = activeTab === route.id;
                  return (
                    <TouchableOpacity
                      key={route.id}
                      style={[
                        styles.moreRouteCard,
                        isActiveRoute && styles.moreRouteCardActive,
                      ]}
                      onPress={() => {
                        setActiveTab(route.id);
                        setIsMoreModalVisible(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.moreRouteIconWrap,
                          { backgroundColor: `${route.color}15` },
                        ]}
                      >
                        <Feather name={route.icon as any} size={19} color={route.color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={[
                              styles.moreRouteTitle,
                              isActiveRoute && styles.moreRouteTitleActive,
                            ]}
                          >
                            {route.title}
                          </Text>
                          {isActiveRoute && (
                            <View style={styles.activePill}>
                              <Text style={styles.activePillText}>Active</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.moreRouteDesc} numberOfLines={2}>
                          {route.description}
                        </Text>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={15}
                        color={COLORS.textMuted}
                        style={{ marginLeft: 6 }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    flex: 1,
    minHeight: 44,
  },
  tabIconWrap: {
    width: 36,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabLabel: {
    color: COLORS.textMuted,
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // More Modal Styles
  moreModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  moreModalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  moreModalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 10,
  },
  moreModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  moreModalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  moreModalSubtitle: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  moreModalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
  },
  moreGrid: {
    gap: 8,
    paddingBottom: 12,
  },
  moreRouteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 11,
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moreRouteCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  moreRouteIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreRouteTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.text,
  },
  moreRouteTitleActive: {
    color: COLORS.primary,
  },
  moreRouteDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  activePillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFF',
  },
});
