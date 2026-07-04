import React, { useState, useContext, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, Linking } from 'react-native'
import { Moon, Sun, User, Shield, Info, Globe, Mail, Star, LogOut, ChevronRight, Lock, FileText } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import GlassCard from '../../components/GlassCard'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, RADIUS, SHADOWS, SPACING, STORAGE_KEYS } from '../../constants'

const APP_VERSION = '1.0.0'

function SettingRow({ icon: Icon, label, value, onPress, isLast, textColor }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[styles.settingRow, !isLast && styles.settingBorder]}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>
          {Icon && <Icon size={18} color={COLORS.primary} />}
        </View>
        <Text style={[styles.settingLabel, textColor && { color: textColor }]}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <ChevronRight size={18} color={COLORS.muted} />
      </View>
    </TouchableOpacity>
  )
}

export default function SettingsScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME).then(val => {
      if (val) setDarkMode(val === 'dark')
    })
  }, [])

  const toggleDarkMode = async (value) => {
    setDarkMode(value)
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, value ? 'dark' : 'light')
    Toast.show({ type: 'success', text1: `Dark mode ${value ? 'enabled' : 'disabled'}` })
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try { await logout() } catch {}
        },
      },
    ])
  }

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword')
  }

  const handleLanguage = () => {
    Toast.show({ type: 'info', text1: 'More languages coming soon' })
  }

  const handleContactUs = () => {
    Linking.openURL('mailto:support@sadaksewa.gov.np').catch(() => {
      Toast.show({ type: 'info', text1: 'support@sadaksewa.gov.np' })
    })
  }

  const handleRateApp = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.sadaksewa').catch(() => {
      Toast.show({ type: 'info', text1: 'Rate us on Play Store' })
    })
  }

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://sadaksewa.gov.np/privacy').catch(() => {
      Toast.show({ type: 'info', text1: 'Privacy policy page' })
    })
  }

  const handleTerms = () => {
    Linking.openURL('https://sadaksewa.gov.np/terms').catch(() => {
      Toast.show({ type: 'info', text1: 'Terms of service page' })
    })
  }

  const handleAbout = () => {
    Alert.alert('About SadakSewa', 'SadakSewa is a civic engagement platform for reporting road infrastructure issues in Nepal. Citizens can report potholes, drainage issues, streetlight problems, and more.')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronRight size={20} color={COLORS.secondary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard padding={0} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Moon size={16} color={COLORS.muted} />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          <View style={[styles.settingRow, styles.settingBorder]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                {darkMode ? <Moon size={18} color={COLORS.primary} /> : <Sun size={18} color={COLORS.warning} />}
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
              thumbColor={darkMode ? COLORS.primary : COLORS.muted}
            />
          </View>
        </GlassCard>

        <GlassCard padding={0} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <User size={16} color={COLORS.muted} />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <SettingRow icon={User} label="Edit Profile" onPress={() => navigation.navigate('ProfileMain')} />
          <SettingRow icon={Lock} label="Change Password" onPress={handleChangePassword} isLast />
        </GlassCard>

        <GlassCard padding={0} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Globe size={16} color={COLORS.muted} />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <SettingRow icon={Globe} label="Language" value="English" onPress={handleLanguage} isLast />
        </GlassCard>

        <GlassCard padding={0} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Info size={16} color={COLORS.muted} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <SettingRow icon={Info} label="About SadakSewa" onPress={handleAbout} />
          <SettingRow icon={FileText} label="Privacy Policy" onPress={handlePrivacyPolicy} />
          <SettingRow icon={Shield} label="Terms of Service" onPress={handleTerms} />
          <SettingRow icon={Info} label="App Version" value={APP_VERSION} isLast />
        </GlassCard>

        <GlassCard padding={0} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Mail size={16} color={COLORS.muted} />
            <Text style={styles.sectionTitle}>Support</Text>
          </View>
          <SettingRow icon={Mail} label="Contact Us" onPress={handleContactUs} />
          <SettingRow icon={Star} label="Rate the App" onPress={handleRateApp} isLast />
        </GlassCard>

        <GlassCard padding={0} style={[styles.sectionCard, styles.dangerCard]}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.6}
            style={styles.dangerRow}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: COLORS.danger + '15' }]}>
                <LogOut size={18} color={COLORS.danger} />
              </View>
              <Text style={[styles.settingLabel, { color: COLORS.danger }]}>Sign Out</Text>
            </View>
            <ChevronRight size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.footer}>SadakSewa v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  sectionCard: {
    marginBottom: SPACING.lg,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 13,
    color: COLORS.muted,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: COLORS.danger + '20',
    backgroundColor: 'rgba(239,68,68,0.03)',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 8,
  },
})
