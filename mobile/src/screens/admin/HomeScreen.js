import React, { useState, useCallback, useContext } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { FileText, Users, AlertTriangle, CheckCircle2, TrendingUp, Bell, Settings, ArrowRight, Shield } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInUp } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import { SkeletonList } from '../../components/SkeletonLoader'
import { reportService } from '../../services/reportService'
import { userService } from '../../services/userService'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../constants'

export default function AdminHomeScreen({ navigation }) {
  const { user } = useContext(AuthContext)
  const [reportStats, setReportStats] = useState(null)
  const [userCount, setUserCount] = useState(0)
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      const [reportsRes, usersRes] = await Promise.all([
        reportService.getAdminDashboard(),
        userService.getUsers({ limit: 1 }),
      ])
      const dash = reportsRes?.dashboard || reportsRes?.data || reportsRes || {}
      setReportStats({
        total: dash.totalReports ?? dash.total ?? 0,
        pending: dash.pending ?? 0,
        inProgress: dash.inProgress ?? dash.in_progress ?? 0,
        resolved: dash.resolved ?? 0,
      })
      setUserCount(usersRes?.total || usersRes?.pagination?.total || 0)

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
              <Text style={styles.nameText}>{user?.fullName?.split(' ')[0] || 'Admin'}</Text>
              <View style={styles.roleBadge}>
                <Shield size={12} color="#FFF" />
                <Text style={styles.roleText}>Administrator</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
                <Bell size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
                <Settings size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {reportStats && (
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.statsGrid}>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={0}>
              <FileText size={20} color={COLORS.warning} />
              <Text style={styles.statValue}>{reportStats.total}</Text>
              <Text style={styles.statLabel}>TOTAL REPORTS</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={1}>
              <AlertTriangle size={20} color={COLORS.danger} />
              <Text style={styles.statValue}>{reportStats.pending}</Text>
              <Text style={styles.statLabel}>PENDING</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={2}>
              <TrendingUp size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{reportStats.inProgress}</Text>
              <Text style={styles.statLabel}>IN PROGRESS</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={3}>
              <CheckCircle2 size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{reportStats.resolved}</Text>
              <Text style={styles.statLabel}>RESOLVED</Text>
            </GlassCard>
            <GlassCard containerStyle={styles.statCardWrap} style={styles.statCard} index={4}>
              <Users size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>{userCount}</Text>
              <Text style={styles.statLabel}>TOTAL USERS</Text>
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Reports')}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.quickGradient}>
              <FileText size={22} color="#FFF" />
              <Text style={styles.quickText}>Manage Reports</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Users')}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.quickGradient}>
              <Users size={22} color="#FFF" />
              <Text style={styles.quickText}>Manage Users</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
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
  reportItem: { marginHorizontal: 16, marginBottom: 8 },
  reportRow: { flexDirection: 'row', alignItems: 'center' },
  reportTopRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  reportTitle: { fontSize: 15, fontWeight: '600', color: COLORS.secondary, marginBottom: 2 },
  reportMeta: { fontSize: 12, color: COLORS.mutedText },
})


