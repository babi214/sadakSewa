import React, { useContext, useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native'
import { User, Mail, Phone, MapPin, Shield, Camera, LogOut, Settings, Edit3, Save, X, Calendar, ArrowUp, CheckCircle } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { useFocusEffect } from '@react-navigation/native'
import GlassCard from '../../components/GlassCard'
import Button from '../../components/Button'
import { FormField, Input } from '../../components/Input'
import { AuthContext } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants'
import { getApiErrorMessage } from '../../utils/validators'
import { formatDate } from '../../utils/formatters'

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', municipality: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName || '', phone: user.phone || '', municipality: user.municipality || '' })
  }, [user])

  useFocusEffect(React.useCallback(() => {}, []))

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
    if (result.canceled) return
    setUploadingPic(true)
    try {
      const res = await authService.updateProfilePicture(result.assets[0].uri)
      const updatedUser = res?.user || res?.data
      if (updatedUser) updateUser(updatedUser)
      Toast.show({ type: 'success', text1: 'Profile photo updated' })
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update photo') })
    } finally {
      setUploadingPic(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await authService.updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim(), municipality: form.municipality })
      const updatedUser = res?.user || res?.data
      if (updatedUser) updateUser(updatedUser)
      setEditing(false)
      Toast.show({ type: 'success', text1: 'Profile updated' })
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update profile') })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { try { await logout() } catch {} } },
    ])
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {}} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
            <Settings size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={[styles.avatarOuter, SHADOWS.xl]}>
            <View style={styles.avatarInner}>
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
              ) : (
                <LinearGradient colors={GRADIENTS.primary} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handlePickPhoto}
              disabled={uploadingPic}
              activeOpacity={0.7}
            >
              <Camera size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Shield size={12} color={COLORS.primary} />
            <Text style={styles.roleText}>
              {(user?.role || 'citizen').charAt(0).toUpperCase() + (user?.role || 'citizen').slice(1)}
            </Text>
          </View>
        </View>

        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.primary + '12' }]}>
                <ArrowUp size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{user?.reportCount ?? 0}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.accent + '12' }]}>
                <CheckCircle size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>{user?.resolvedCount ?? 0}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.warning + '12' }]}>
                <ArrowUp size={18} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{user?.upvoteCount ?? 0}</Text>
              <Text style={styles.statLabel}>Upvotes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={[styles.statIconWrap, { backgroundColor: '#8B5CF615' }]}>
                <Calendar size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{user?.createdAt ? formatDate(user.createdAt) : '-'}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={16} color={COLORS.muted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Phone size={16} color={COLORS.muted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <MapPin size={16} color={COLORS.muted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Municipality</Text>
              <Text style={styles.infoValue}>{user?.municipality || 'Not set'}</Text>
            </View>
          </View>
        </GlassCard>

        {editing ? (
          <GlassCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.formClose}>
                <X size={18} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
            <FormField label="Full Name">
              <Input
                value={form.fullName}
                onChangeText={v => setForm(prev => ({ ...prev, fullName: v }))}
                placeholder="Your full name"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={form.phone}
                onChangeText={v => setForm(prev => ({ ...prev, phone: v }))}
                placeholder="+97798..."
                keyboardType="phone-pad"
              />
            </FormField>
            <FormField label="Municipality">
              <Input
                value={form.municipality}
                onChangeText={v => setForm(prev => ({ ...prev, municipality: v }))}
                placeholder="Your municipality"
              />
            </FormField>
            <View style={styles.editActions}>
              <Button variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button loading={saving} onPress={handleSave} style={{ flex: 1 }}>
                <Save size={16} color={COLORS.white} /> Save
              </Button>
            </View>
          </GlassCard>
        ) : (
          <Button
            variant="outline"
            onPress={() => setEditing(true)}
            style={styles.editBtn}
          >
            <Edit3 size={16} color={COLORS.primary} /> Edit Profile
          </Button>
        )}

        <Button
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={16} color={COLORS.white} /> Sign Out
        </Button>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 14,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.full,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.mutedText,
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  infoCard: {
    marginBottom: SPACING.lg,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border + '60',
  },
  formCard: {
    marginBottom: SPACING.lg,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  formClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  editBtn: {
    marginBottom: SPACING.md,
  },
  logoutBtn: {
    marginTop: SPACING.xs,
  },
})
