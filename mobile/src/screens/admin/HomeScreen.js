import React, { useState, useCallback, useContext, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image } from 'react-native'
import { FileText, Users, AlertTriangle, CheckCircle2, TrendingUp, Bell, Settings, ArrowRight, Shield, Eye, CheckCheck } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInUp } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import { SkeletonList } from '../../components/SkeletonLoader'
import { reportService } from '../../services/reportService'
import { notificationService } from '../../services/notificationService'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants'

export default function AdminHomeScreen({ navigation }) {
  const { user } = useContext(AuthContext)
  const scrollRef = useRef(null)
  const [reportStats, setReportStats] = useState(null)
  const [userCount, setUserCount] = useState(0)
  const [recentReports, setRecentReports] = useState([])
  const [newReports, setNewReports] = useState([])
  const [newReportsCount, setNewReportsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useFocusEffect(useCallback(() => {
    notificationService.getUnreadCount().then(res => setUnreadCount(res?.unreadCount ?? res?.count ?? 0)).catch(() => {})
  }, []))

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      const [reportsRes, newRes] = await Promise.all([
        reportService.getAdminDashboard(),
        reportService.getNewReports().catch(() => ({ reports: [], newCount: 0 })),
      ])
      const dash = reportsRes?.dashboard || reportsRes?.data || reportsRes || {}
      setReportStats({
        total: dash.totalReports ?? dash.total ?? 0,
        pending: dash.pending ?? 0,
        inProgress: dash.inProgress ?? dash.in_progress ?? 0,
        resolved: dash.resolved ?? 0,
      })
      setUserCount((dash.totalCitizens || 0) + (dash.totalWorkers || 0) + (dash.totalAdmins || 0))

      setNewReports(newRes?.reports || [])
      setNewReportsCount(newRes?.newCount || 0)

      const recentRes = await reportService.getAllReports({ limit: 5, sort: '-createdAt' })
      setRecentReports(recentRes?.reports || recentRes?.data || [])
    } catch {
      if (!isRefresh) Toast.show({ type: 'error', text1: 'Failed to load dashboard' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); fetchData() }, []))

  const onRefresh = () => { setRefreshing(true); fetchData(true) }

  const handleMarkSeen = async (reportId) => {
    setNewReports(prev => prev.filter(r => r._id !== reportId))
    setNewReportsCount(prev => Math.max(0, prev - 1))
    try {
      await reportService.markReportAsSeen(reportId)
    } catch {
      fetchData()
    }
  }

  const handleMarkAllSeen = async () => {
    setNewReports([])
    setNewReportsCount(0)
    try {
      await reportService.markAllReportsAsSeen()
      Toast.show({ type: 'success', text1: 'All reports marked as seen' })
    } catch {
      fetchData()
    }
  }

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
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image source={require('../../../assets/logoSadakSewa.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>SadakSewa</Text>
          </View>
          <View style={styles.headerIcons}>
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

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.greetingSection}>
          <Text style={styles.greetText}>{timeGreeting()}</Text>
          <Text style={styles.nameText}>{user?.fullName?.split(' ')[0] || 'Admin'}</Text>
          <View style={styles.roleBadge}>
            <Shield size={12} color="#FFF" />
            <Text style={styles.roleText}>Administrator</Text>
          </View>
        </LinearGradient>

        {reportStats && (
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.statsGrid}>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={0}
              onPress={() => navigation.getParent()?.navigate('Reports', { screen: 'ManageReportsHome', params: { initialFilter: 'all' } })}>
              <FileText size={20} color={COLORS.warning} />
              <Text style={styles.statValue}>{reportStats.total}</Text>
              <Text style={styles.statLabel}>TOTAL REPORTS</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={1}
              onPress={() => navigation.getParent()?.navigate('Reports', { screen: 'ManageReportsHome', params: { initialFilter: 'pending' } })}>
              <AlertTriangle size={20} color={COLORS.danger} />
              <Text style={styles.statValue}>{reportStats.pending}</Text>
              <Text style={styles.statLabel}>PENDING</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={2}
              onPress={() => navigation.getParent()?.navigate('Reports', { screen: 'ManageReportsHome', params: { initialFilter: 'in_progress' } })}>
              <TrendingUp size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{reportStats.inProgress}</Text>
              <Text style={styles.statLabel}>IN PROGRESS</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={3}
              onPress={() => navigation.getParent()?.navigate('Reports', { screen: 'ManageReportsHome', params: { initialFilter: 'resolved' } })}>
              <CheckCircle2 size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{reportStats.resolved}</Text>
              <Text style={styles.statLabel}>RESOLVED</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={4}
              onPress={() => navigation.getParent()?.navigate('Users')}>
              <Users size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>{userCount}</Text>
              <Text style={styles.statLabel}>TOTAL USERS</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={5}
              onPress={() => {
                if (newReportsCount > 0) {
                  scrollRef.current?.scrollTo({ y: 600, animated: true })
                }
              }}>
              <Eye size={20} color={COLORS.danger} />
              <Text style={[styles.statValue, newReportsCount > 0 && { color: COLORS.danger }]}>{newReportsCount}</Text>
              <Text style={styles.statLabel}>UNCHECKED</Text>
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.getParent()?.navigate('Reports')}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.quickGradient}>
              <FileText size={22} color="#FFF" />
              <Text style={styles.quickText}>Manage Reports</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.getParent()?.navigate('Users')}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.quickGradient}>
              <Users size={22} color="#FFF" />
              <Text style={styles.quickText}>Manage Users</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {newReports.length > 0 && (
          <Animated.View entering={FadeInUp.delay(250).springify()}>
            <View style={styles.sectionHead}>
              <View style={styles.newReportsTitleRow}>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{newReportsCount}</Text>
                </View>
                <Text style={styles.sectionTitle}>New Reports</Text>
              </View>
              <TouchableOpacity onPress={handleMarkAllSeen} style={styles.markAllBtn}>
                <CheckCheck size={14} color={COLORS.primary} />
                <Text style={styles.markAllText}>Mark All Seen</Text>
              </TouchableOpacity>
            </View>

            {newReports.map((r, i) => (
              <GlassCard key={r._id} index={i + 3} style={styles.newReportItem}
                onPress={() => {
                  handleMarkSeen(r._id)
                  navigation.navigate('ReportDetails', { reportId: r._id })
                }}>
                <View style={styles.newReportRow}>
                  <View style={styles.unseenDot} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.reportTopRow}>
                      <StatusBadge status={r.status} size="sm" />
                      <View style={styles.newLabel}>
                        <Eye size={10} color="#FFF" />
                        <Text style={styles.newLabelText}>NEW</Text>
                      </View>
                    </View>
                    <Text style={styles.reportTitle} numberOfLines={1}>{r.title}</Text>
                    <Text style={styles.reportMeta}>
                      {r.reportedBy?.fullName || 'Anonymous'} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.seenBtn}
                    onPress={() => handleMarkSeen(r._id)}
                    activeOpacity={0.7}
                  >
                    <Eye size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Reports')}>
              <Text style={styles.viewAll}>View All <ArrowRight size={14} color={COLORS.primary} /></Text>
            </TouchableOpacity>
          </View>

          {recentReports.map((r, i) => (
            <GlassCard key={r._id} index={i + 5} style={styles.reportItem}
              onPress={() => navigation.navigate('ReportDetails', { reportId: r._id })}>
              <View style={styles.reportRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.reportTopRow}>
                    <StatusBadge status={r.status} size="sm" />
                  </View>
                  <Text style={styles.reportTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={styles.reportMeta}>
                    {r.reportedBy?.fullName || 'Anonymous'} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  container: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  greetingSection: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 28,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
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
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 8 },
  quickBtn: { flex: 1 },
  quickGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 16, borderRadius: RADIUS.xl, ...SHADOWS.md,
  },
  quickText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12, marginTop: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, letterSpacing: -0.3 },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  newReportsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  newBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '12',
  },
  markAllText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  newReportItem: { marginHorizontal: 16, marginBottom: 8 },
  newReportRow: { flexDirection: 'row', alignItems: 'center' },
  unseenDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginRight: 10,
  },
  newLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.sm,
  },
  newLabelText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  seenBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
  reportItem: { marginHorizontal: 16, marginBottom: 8 },
  reportRow: { flexDirection: 'row', alignItems: 'center' },
  reportTopRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'center' },
  reportTitle: { fontSize: 15, fontWeight: '600', color: COLORS.secondary, marginBottom: 2 },
  reportMeta: { fontSize: 12, color: COLORS.mutedText },
})


