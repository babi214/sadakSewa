import React, { useState, useCallback, useRef } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import { FileText, Filter, Clock, MapPin, ChevronRight, CheckCircle2, AlertTriangle, XCircle, TrendingUp, List, Globe } from 'lucide-react-native'
import { COLORS, RADIUS, STATUS_COLORS } from '../../constants'
import { reportService } from '../../services/reportService'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import { SkeletonBlock, SkeletonList } from '../../components/SkeletonLoader'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/formatters'

const LIMIT = 10

const FILTERS = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'verified', label: 'Verified', icon: CheckCircle2 },
  { key: 'in_progress', label: 'In Progress', icon: TrendingUp },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
]

export default function MyReportsScreen() {
  const navigation = useNavigation()
  const flatListRef = useRef(null)
  const pageRef = useRef(1)
  const hasMoreRef = useRef(true)

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState('all')
  const [total, setTotal] = useState(0)
  const [mode, setMode] = useState('my')

  const fetchReports = useCallback(async (pageNum = 1, append = false, isRefresh = false) => {
    try {
      const params = { page: pageNum, limit: LIMIT }
      if (filter !== 'all') params.status = filter

      const fetchFn = mode === 'explore' ? reportService.getReports : reportService.getMyReports
      const res = await fetchFn(params)
      const data = res?.reports || res?.data || []
      const totalCount = res?.total || res?.totalCount || res?.pagination?.total || data.length

      if (append) {
        setReports(prev => [...prev, ...data])
      } else {
        setReports(data)
      }
      setTotal(totalCount)
      hasMoreRef.current = data.length >= LIMIT
      pageRef.current = pageNum
    } catch (err) {
      if (!isRefresh) Toast.show({ type: 'error', text1: 'Failed to load reports' })
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [filter, mode])

  useFocusEffect(useCallback(() => {
    setLoading(true)
    hasMoreRef.current = true
    pageRef.current = 1
    fetchReports(1)
  }, [fetchReports]))

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    hasMoreRef.current = true
    pageRef.current = 1
    fetchReports(1, false, true)
  }, [fetchReports])

  const onEndReached = useCallback(() => {
    if (loadingMore || !hasMoreRef.current || loading) return
    setLoadingMore(true)
    fetchReports(pageRef.current + 1, true)
  }, [loadingMore, loading, fetchReports])

  const handleFilterChange = useCallback((key) => {
    if (key === filter) return
    Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    setFilter(key)
    setReports([])
    setTotal(0)
    setLoading(true)
    hasMoreRef.current = true
    pageRef.current = 1
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [filter])

  const handleCardPress = useCallback((report) => {
    Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    navigation.navigate('ReportDetails', { reportId: report._id })
  }, [navigation])

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    )
  }, [loadingMore])

  const renderItem = useCallback(({ item, index }) => {
    const imgSrc = item.images?.length > 0
      ? { uri: typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url }
      : null
    const statusColor = STATUS_COLORS[item.status] || COLORS.muted
    const categoryLabel = item.category
      ? item.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Other'
    const CategoryIcon = item.category === 'pothole' || item.category === 'road_damage' ? AlertTriangle : FileText
    const locationLabel = item.locationName || item.location?.address || 'Location not specified'
    const upvoteCount = item.upvoteCount ?? item.upvotes?.length ?? 0

    return (
      <GlassCard index={index} onPress={() => handleCardPress(item)} padding={0} style={styles.cardOuter}>
        <View style={styles.cardInner}>
          <View style={[styles.accentStrip, { backgroundColor: statusColor }]} />
          <View style={styles.cardBody}>
            {imgSrc && (
              <View style={styles.imageWrap}>
                <Image source={imgSrc} style={styles.image} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.45)']} locations={[0.5, 1]} style={styles.imageOverlay} />
                <View style={styles.badgeWrap}>
                  <StatusBadge status={item.status} size="sm" />
                </View>
              </View>
            )}
            <View style={[styles.contentArea, !imgSrc && styles.contentAreaNoImage]}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <View style={styles.metaRow}>
                <CategoryIcon size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>{categoryLabel}</Text>
                <View style={styles.metaDot} />
                <Clock size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin size={14} color={COLORS.muted} />
                <Text style={[styles.metaText, styles.locationText]} numberOfLines={1}>{locationLabel}</Text>
                <View style={styles.upvoteWrap}>
                  <TrendingUp size={14} color={COLORS.primary} />
                  <Text style={[styles.metaText, styles.upvoteText]}>{upvoteCount}</Text>
                </View>
              </View>
            </View>
          </View>
          <ChevronRight size={18} color={COLORS.muted} style={styles.chevron} />
        </View>
      </GlassCard>
    )
  }, [handleCardPress])

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'my' ? 'explore' : 'my')
    setReports([])
    setTotal(0)
    setLoading(true)
    hasMoreRef.current = true
    pageRef.current = 1
  }, [])

  if (loading && reports.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{mode === 'explore' ? 'Explore' : 'My Reports'}</Text>
            <Text style={styles.headerSubtitle}>Loading...</Text>
          </View>
          <TouchableOpacity style={styles.filterBadge} activeOpacity={0.7}>
            <Filter size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.modeToggleOuter}>
          <View style={styles.modeToggle}>
            <TouchableOpacity style={[styles.modeBtn, mode === 'my' && styles.modeBtnActive]} onPress={() => { if (mode !== 'my') toggleMode() }}>
              <List size={14} color={mode === 'my' ? COLORS.white : COLORS.muted} />
              <Text style={[styles.modeBtnText, mode === 'my' && styles.modeBtnTextActive]}>My Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeBtn, mode === 'explore' && styles.modeBtnActive]} onPress={() => { if (mode !== 'explore') toggleMode() }}>
              <Globe size={14} color={mode === 'explore' ? COLORS.white : COLORS.muted} />
              <Text style={[styles.modeBtnText, mode === 'explore' && styles.modeBtnTextActive]}>Explore</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chipsOuter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
            {FILTERS.map(f => (
              <View key={f.key} style={[styles.chip, { opacity: 0.5 }]}>
                <SkeletonBlock width={70} height={32} borderRadius={RADIUS.full} />
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.listPadding}>
          <SkeletonList count={3} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{mode === 'explore' ? 'Explore' : 'My Reports'}</Text>
          <Text style={styles.headerSubtitle}>{total} {total === 1 ? 'report' : 'reports'}</Text>
        </View>
        <TouchableOpacity style={styles.filterBadge} activeOpacity={0.7}>
          <Filter size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.modeToggleOuter}>
        <View style={styles.modeToggle}>
          <TouchableOpacity style={[styles.modeBtn, mode === 'my' && styles.modeBtnActive]} onPress={() => { if (mode !== 'my') toggleMode() }}>
            <List size={14} color={mode === 'my' ? COLORS.white : COLORS.muted} />
            <Text style={[styles.modeBtnText, mode === 'my' && styles.modeBtnTextActive]}>My Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, mode === 'explore' && styles.modeBtnActive]} onPress={() => { if (mode !== 'explore') toggleMode() }}>
            <Globe size={14} color={mode === 'explore' ? COLORS.white : COLORS.muted} />
            <Text style={[styles.modeBtnText, mode === 'explore' && styles.modeBtnTextActive]}>Explore</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chipsOuter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {FILTERS.map(f => {
            const Icon = f.icon
            const isActive = filter === f.key
            return (
              <TouchableOpacity key={f.key} style={[styles.chip, isActive && styles.chipActive]} onPress={() => handleFilterChange(f.key)} activeOpacity={0.7}>
                <Icon size={14} color={isActive ? COLORS.white : COLORS.muted} />
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <FlatList
        ref={flatListRef}
        data={reports}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} progressViewOffset={8} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? (
          <EmptyState
            icon={<FileText size={52} color={COLORS.muted} />}
            title="No reports yet"
            description={filter !== 'all' ? `No ${FILTERS.find(f => f.key === filter)?.label?.toLowerCase() || ''} reports found` : 'Create your first report to start tracking road issues'}
            actionLabel={filter === 'all' ? 'Create Report' : undefined}
            onAction={filter === 'all' ? () => navigation.navigate('Report') : undefined}
            style={styles.emptyState}
          />
        ) : null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 2,
    fontWeight: '500',
  },
  filterBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleOuter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: COLORS.surface,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.full - 2,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  modeBtnTextActive: {
    color: COLORS.white,
  },
  chipsOuter: {
    backgroundColor: COLORS.surface,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  listPadding: {
    padding: 16,
    paddingTop: 12,
  },
  cardOuter: {
    marginBottom: 12,
  },
  cardInner: {
    flexDirection: 'row',
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  cardBody: {
    flex: 1,
  },
  imageWrap: {
    height: 120,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeWrap: {
    position: 'absolute',
    bottom: 8,
    left: 12,
  },
  contentArea: {
    padding: 16,
  },
  contentAreaNoImage: {
    paddingTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    lineHeight: 22,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.muted,
    marginHorizontal: 4,
  },
  locationText: {
    flex: 1,
  },
  upvoteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: COLORS.primary + '0D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  upvoteText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -9,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  emptyState: {
    marginTop: 40,
  },
})
