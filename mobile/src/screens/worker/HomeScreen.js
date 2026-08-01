import React, { useState, useCallback, useContext } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { ClipboardList, AlertTriangle, CheckCircle2, TrendingUp, Bell, Settings, ArrowRight, Wifi, WifiOff } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInUp } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import { SkeletonList } from '../../components/SkeletonLoader'
import { reportService } from '../../services/reportService'
import { authService } from '../../services/authService'
import { notificationService } from '../../services/notificationService'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants'

export default function WorkerHomeScreen({ navigation }) {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState(null)
  const [recentAssigned, setRecentAssigned] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [togglingAvail, setTogglingAvail] = useState(false)

  useFocusEffect(useCallback(() => {
    notificationService.getUnreadCount().then(res => setUnreadCount(res?.unreadCount ?? res?.count ?? 0)).catch(() => {})
  }, []))

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      const res = await reportService.getWorkerDashboard()
      const dash = res?.data || res?.dashboard || res
      setStats({
        total: dash?.assigned ?? dash?.totalAssigned ?? 0,
        pending: dash?.pending ?? 0,
        inProgress: dash?.inProgress ?? dash?.in_progress ?? 0,
        resolved: dash?.resolved ?? 0,
      })

      const assignedRes = await reportService.getAssignedReports({ limit: 5 })
      setRecentAssigned(assignedRes?.reports || assignedRes?.data || [])
    } catch {
      if (!isRefresh) Toast.show({ type: 'error', text1: 'Failed to load dashboard' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); fetchData() }, []))

  const isAvailable = user?.isAvailable !== false

  const handleToggleAvailability = async () => {
    setTogglingAvail(true)
    try {
      const res = await authService.toggleAvailability()
      Toast.show({ type: res?.isAvailable ? 'success' : 'error', text1: res?.message || 'Availability updated' })
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to toggle availability' })
    } finally {
      setTogglingAvail(false)
    }
  }

  const onRefresh = () => { setRefreshing(true); fetchData(true) }

  const timeGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <SkeletonList count={4} />
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetText}>{timeGreeting()}</Text>
              <Text style={styles.nameText}>{user?.fullName?.split(' ')[0] || 'Worker'}</Text>
              <View style={styles.roleBadge}>
                <ClipboardList size={12} color="#FFF" />
                <Text style={styles.roleText}>Municipal Worker</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }]} onPress={handleToggleAvailability} disabled={togglingAvail}>
                {isAvailable ? <Wifi size={18} color="#FFF" /> : <WifiOff size={18} color="#EF4444" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
                <Bell size={20} color="#FFF" />
                {unreadCount > 0 && <View style={styles.badgeDot} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
                <Settings size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {stats && (
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.statsGrid}>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={0}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>ASSIGNED</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={1}>
              <AlertTriangle size={20} color={COLORS.warning} />
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>PENDING</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={2}>
              <TrendingUp size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>IN PROGRESS</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={3}>
              <CheckCircle2 size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>RESOLVED</Text>
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recently Assigned</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Assigned')}>
              <Text style={styles.viewAll}>View All <ArrowRight size={14} color={COLORS.primary} /></Text>
            </TouchableOpacity>
          </View>

          {recentAssigned.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <ClipboardList size={40} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No assigned reports</Text>
              <Text style={styles.emptyDesc}>Reports assigned to you will appear here</Text>
            </GlassCard>
          ) : (
            recentAssigned.map((r, i) => (
              <GlassCard key={r._id} index={i + 3} style={styles.reportItem} onPress={() => navigation.navigate('ReportDetails', { reportId: r._id })}>
                <View style={styles.reportRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.reportTopRow}>
                      <StatusBadge status={r.status} size="sm" />
                      {r.severity && <StatusBadge status={r.severity} size="sm" />}
                    </View>
                    <Text style={styles.reportTitle} numberOfLines={1}>{r.title}</Text>
                    <Text style={styles.reportLocation} numberOfLines={1}>
                      {[r.province, r.district, r.municipality].filter(Boolean).join(', ') || r.location?.address || r.locationName || 'Location not set'}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  container: { paddingBottom: 32 },
  gradientHeader: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  nameText: { fontSize: 26, fontWeight: '800', color: '#FFF', marginTop: 2, letterSpacing: -0.5 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, alignSelf: 'flex-start',
  },
  roleText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FF4444',
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 16 },
  statCardWrap: { width: '48%', marginBottom: 12 },
  statCard: { minHeight: 120, padding: 16, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.secondary, marginTop: 4 },
  statLabel: { fontSize: 11, color: COLORS.mutedText, fontWeight: '700', marginTop: 4, letterSpacing: 0.5, textAlign: 'center' },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12, marginTop: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, letterSpacing: -0.3 },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  emptyCard: { marginHorizontal: 16, padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.mutedText, marginTop: 12 },
  emptyDesc: { fontSize: 13, color: COLORS.muted, marginTop: 4, textAlign: 'center' },
  reportItem: { marginHorizontal: 16, marginBottom: 8 },
  reportRow: { flexDirection: 'row', alignItems: 'center' },
  reportTopRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  reportTitle: { fontSize: 15, fontWeight: '600', color: COLORS.secondary, marginBottom: 4 },
  reportLocation: { fontSize: 12, color: COLORS.mutedText },
})

