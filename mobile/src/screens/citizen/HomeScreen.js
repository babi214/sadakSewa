import React, { useState, useCallback, useContext, useRef, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Bell, Settings, Camera, Shield, FileText, MapPin,
  TrendingUp, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, Plus, Navigation
} from 'lucide-react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import * as Location from 'expo-location'
import Animated, { FadeInUp } from 'react-native-reanimated'

import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import SkeletonBlock, { SkeletonCard } from '../../components/SkeletonLoader'
import FloatingActionButton from '../../components/FloatingActionButton'
import AnimatedPressable from '../../components/AnimatedPressable'
import { reportService } from '../../services/reportService'
import { notificationService } from '../../services/notificationService'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS, STATUS_COLORS } from '../../constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const H_GUTTER = 24
const CARD_GAP = 12
const QUICK_CARD_W = (SCREEN_WIDTH - H_GUTTER * 2 - CARD_GAP) / 2
const STAT_CARD_W = (SCREEN_WIDTH - H_GUTTER * 2 - CARD_GAP) / 2
const NEARBY_CARD_W = SCREEN_WIDTH * 0.52

const QUICK_ACTIONS = [
  { id: 'report', label: 'Quick Report', icon: Camera, gradient: GRADIENTS.primary, screen: 'Report' },
  { id: 'ai', label: 'AI Analysis', icon: Shield, gradient: GRADIENTS.accent, screen: 'Analyze' },
  { id: 'list', label: 'My Reports', icon: FileText, gradient: GRADIENTS.dark, screen: 'My Reports' },
  { id: 'map', label: 'Map View', icon: MapPin, gradient: GRADIENTS.warning, screen: 'Map' },
]

const STAT_CONFIG = [
  { key: 'total', label: 'Total', icon: FileText, color: 'primary' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'warning' },
  { key: 'inProgress', label: 'In Progress', icon: TrendingUp, color: 'secondary' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'accent' },
]

const MAP_PIN_COLORS = [
  COLORS.danger, COLORS.warning, COLORS.primary, COLORS.accent,
  COLORS.warning, COLORS.danger, COLORS.primary, COLORS.accent,
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.sectionAction} activeOpacity={0.7}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <ChevronRight size={14} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

function QuickActionCard({ item, onPress }) {
  const Icon = item.icon
  return (
    <AnimatedPressable onPress={onPress} style={[styles.quickCard, { width: QUICK_CARD_W }]}>
      <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickGradient}>
        <View style={styles.quickIconWrap}>
          <Icon size={24} color="#FFF" />
        </View>
        <Text style={styles.quickLabel}>{item.label}</Text>
      </LinearGradient>
    </AnimatedPressable>
  )
}

function NearbyReportCard({ item, onPress }) {
  const thumbnail = item.images?.length > 0
    ? { uri: item.images[0]?.url || (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url) }
    : null
  const distText = item.distance
    ? `${(item.distance / 1000).toFixed(1)} km`
    : 'Nearby'

  return (
    <AnimatedPressable onPress={onPress} style={{ width: NEARBY_CARD_W, marginRight: CARD_GAP }}>
      <GlassCard padding={0} style={{ overflow: 'hidden' }}>
        {thumbnail ? (
          <Image source={thumbnail} style={styles.nearbyThumb} />
        ) : (
          <View style={[styles.nearbyThumb, styles.nearbyThumbPlaceholder]}>
            <MapPin size={24} color={COLORS.muted} />
          </View>
        )}
        <View style={styles.nearbyBody}>
          <StatusBadge status={item.status} size="sm" />
          <Text style={styles.nearbyTitle} numberOfLines={1}>{item.title || 'Unknown Report'}</Text>
          <View style={styles.nearbyMeta}>
            <MapPin size={11} color={COLORS.muted} />
            <Text style={styles.nearbyDist}>{distText}</Text>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  )
}

function StatItem({ item, value, index }) {
  const Icon = item.icon
  const colorMap = {
    primary: { bg: COLORS.primary + '12', text: COLORS.primary },
    warning: { bg: COLORS.warning + '15', text: COLORS.warning },
    secondary: { bg: COLORS.secondary + '0A', text: COLORS.secondary },
    accent: { bg: COLORS.accent + '12', text: COLORS.accent },
  }
  const c = colorMap[item.color] || colorMap.primary

  return (
    <GlassCard index={index} style={{ width: STAT_CARD_W, padding: 16 }}>
      <View style={[styles.statIcon, { backgroundColor: c.bg }]}>
        <Icon size={18} color={c.text} />
      </View>
      <Text style={[styles.statValue, { color: c.text }]}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </GlassCard>
  )
}

function MapPreviewCard({ onPress, reports }) {
  const pins = reports?.filter(r => r.location?.coordinates?.length === 2).slice(0, 8) || []

  return (
    <AnimatedPressable onPress={onPress} style={styles.mapPreviewCard}>
      <LinearGradient
        colors={['#1a365d', '#0f172a', '#1e293b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mapPreviewBg}
      >
        <View style={styles.mapPinGrid}>
          {MAP_PIN_COLORS.map((color, i) => (
            <View
              key={i}
              style={[
                styles.mapPinDot,
                {
                  backgroundColor: color,
                  top: 12 + (i * 17 % 80),
                  left: 16 + (i * 23 % (SCREEN_WIDTH - H_GUTTER * 2 - 64)),
                  opacity: i < pins.length ? 1 : 0.25,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.mapPreviewOverlay}>
          <Navigation size={16} color="#FFF" />
          <Text style={styles.mapPreviewText}>View nearby reports on map</Text>
          <ChevronRight size={16} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>
    </AnimatedPressable>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation()
  const { user } = useContext(AuthContext)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const [stats, setStats] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [nearbyReports, setNearbyReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const getLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return null
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low })
      return { longitude: pos.coords.longitude, latitude: pos.coords.latitude }
    } catch {
      return null
    }
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      const coords = await getLocation()

      const [dashRes, nearbyRes, reportsRes, notifRes] = await Promise.all([
        reportService.getMyDashboard().catch(() => ({})),
        reportService.getNearbyReports({ limit: 10, ...(coords || {}) }).catch(() => ({ reports: [] })),
        reportService.getMyReports({ limit: 5 }).catch(() => ({ reports: [] })),
        notificationService.getUnreadCount().catch(() => ({ unreadCount: 0 })),
      ])

      if (!mountedRef.current) return

      setUnreadCount(notifRes?.unreadCount ?? 0)

      const d = dashRes?.dashboard || dashRes?.data || dashRes || {}
      setStats({
        total: d.total ?? d.totalReports ?? 0,
        pending: d.pending ?? 0,
        inProgress: d.inProgress ?? d.in_progress ?? 0,
        resolved: d.resolved ?? 0,
      })

      const nearby = nearbyRes?.reports || nearbyRes?.data || []
      setNearbyReports(nearby)

      const reports = reportsRes?.reports || reportsRes?.data || []
      setRecentReports(reports.slice(0, 5))
    } catch {
      if (!mountedRef.current) return
      if (!isRefresh) Toast.show({ type: 'error', text1: 'Failed to load dashboard' })
      if (!stats) setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 })
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [getLocation])

  useFocusEffect(useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData]))

  const onRefresh = () => {
    setRefreshing(true)
    fetchData(true)
  }

  const greeting = getGreeting()
  const firstName = user?.fullName?.split(' ')[0] || 'User'

  const navigateTo = (screen, params) => {
    if (screen) navigation.navigate(screen, params)
    else Toast.show({ type: 'info', text1: 'Coming soon!' })
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image source={require('../../../assets/logoSadakSewa.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.appName}>SadakSewa</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigateTo('Notifications')} activeOpacity={0.7}>
                <Bell size={20} color="#FFF" />
                {unreadCount > 0 && <View style={styles.badgeDot} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigateTo('Settings')} activeOpacity={0.7}>
                <Settings size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName} numberOfLines={1}>{firstName}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingWrap}>
            <SkeletonBlock width="100%" height={100} borderRadius={RADIUS.xl} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', gap: CARD_GAP, marginBottom: 12 }}>
              <SkeletonBlock width={QUICK_CARD_W} height={90} borderRadius={RADIUS.lg} />
              <SkeletonBlock width={QUICK_CARD_W} height={90} borderRadius={RADIUS.lg} />
            </View>
            <View style={{ flexDirection: 'row', gap: CARD_GAP, marginBottom: 12 }}>
              <SkeletonBlock width={STAT_CARD_W} height={100} borderRadius={RADIUS.lg} />
              <SkeletonBlock width={STAT_CARD_W} height={100} borderRadius={RADIUS.lg} />
            </View>
            <View style={{ flexDirection: 'row', gap: CARD_GAP, marginBottom: 12 }}>
              <SkeletonBlock width={STAT_CARD_W} height={100} borderRadius={RADIUS.lg} />
              <SkeletonBlock width={STAT_CARD_W} height={100} borderRadius={RADIUS.lg} />
            </View>
            <SkeletonBlock width="100%" height={150} borderRadius={RADIUS.xl} style={{ marginBottom: 12 }} />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <>
            <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.quickGrid}>
              {QUICK_ACTIONS.map((item) => (
                <QuickActionCard
                  key={item.id}
                  item={item}
                  onPress={() => navigateTo(item.screen)}
                />
              ))}
            </Animated.View>

            <View style={styles.statsGrid}>
              {STAT_CONFIG.map((item, i) => (
                <StatItem key={item.key} item={item} value={stats?.[item.key]} index={i + 4} />
              ))}
            </View>

            <View style={styles.sectionOuter}>
              <SectionHeader
                title="Nearby Reports"
                actionLabel="View All"
                onAction={() => navigateTo('Map')}
              />
              {nearbyReports.length === 0 ? (
                <GlassCard padding={20} style={{ marginBottom: 4 }}>
                  <View style={styles.emptyRow}>
                    <MapPin size={20} color={COLORS.muted} />
                    <Text style={styles.emptyText}>No nearby reports found</Text>
                  </View>
                </GlassCard>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.nearbyScroll}
                >
                  {nearbyReports.map((item) => (
                    <NearbyReportCard
                      key={item._id}
                      item={item}
                      onPress={() => navigateTo('ReportDetails', { reportId: item._id })}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.sectionOuter}>
              <MapPreviewCard
                reports={nearbyReports}
                onPress={() => navigateTo('Map')}
              />
            </View>

            <View style={styles.sectionOuter}>
              <SectionHeader
                title="Recent Reports"
                actionLabel="View All"
                onAction={() => navigateTo('My Reports')}
              />
              {recentReports.length === 0 ? (
                <GlassCard padding={24} style={{ alignItems: 'center' }}>
                  <FileText size={28} color={COLORS.muted} style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyTitle}>No reports yet</Text>
                  <Text style={styles.emptyDesc}>Create your first report to get started</Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => navigateTo('Report')}
                    activeOpacity={0.8}
                  >
                    <Plus size={16} color="#FFF" />
                    <Text style={styles.emptyBtnText}>New Report</Text>
                  </TouchableOpacity>
                </GlassCard>
              ) : (
                recentReports.map((item, i) => (
                  <GlassCard
                    key={item._id}
                    index={i + 8}
                    onPress={() => navigateTo('ReportDetails', { reportId: item._id })}
                    padding={16}
                    style={styles.recentCard}
                  >
                    <View style={styles.recentRow}>
                      {item.images?.length > 0 && (
                        <Image
                          source={{ uri: item.images[0]?.url || (typeof item.images[0] === 'string' ? item.images[0] : '') }}
                          style={styles.recentThumb}
                        />
                      )}
                      <View style={[styles.recentInfo, !item.images?.length && { marginLeft: 0 }]}>
                        <StatusBadge status={item.status} size="sm" />
                        <Text style={styles.recentTitle} numberOfLines={1}>{item.title || 'Untitled Report'}</Text>
                        <Text style={styles.recentDesc} numberOfLines={1}>{item.description || item.location?.address || ''}</Text>
                      </View>
                      <ChevronRight size={16} color={COLORS.muted} style={styles.recentChevron} />
                    </View>
                  </GlassCard>
                ))
              )}
            </View>

            <View style={{ height: 80 }} />
          </>
        )}
      </ScrollView>

      <FloatingActionButton icon={Plus} onPress={() => navigateTo('Report')} color="primary" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_GUTTER,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSection: {
    paddingHorizontal: H_GUTTER,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: H_GUTTER,
    paddingBottom: 24,
  },
  loadingWrap: {
    paddingBottom: 32,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 8,
  },
  quickCard: {
    height: 96,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  quickGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginTop: 16,
    marginBottom: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionOuter: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nearbyScroll: {
    paddingBottom: 4,
  },
  nearbyThumb: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  nearbyThumbPlaceholder: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyBody: {
    padding: 12,
    gap: 6,
  },
  nearbyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: -0.2,
  },
  nearbyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyDist: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '500',
  },
  mapPreviewCard: {
    height: 140,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  mapPreviewBg: {
    flex: 1,
  },
  mapPinGrid: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  mapPinDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapPreviewOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mapPreviewText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recentCard: {
    marginBottom: CARD_GAP - 4,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentThumb: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
    gap: 4,
    marginLeft: 0,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: -0.2,
  },
  recentDesc: {
    fontSize: 12,
    color: COLORS.mutedText,
    lineHeight: 16,
  },
  recentChevron: {
    marginLeft: 8,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})