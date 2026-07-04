import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { FileText, Filter, Clock, TrendingUp, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Animated, { FadeInUp } from 'react-native-reanimated'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import EnhancedHeader from '../../components/EnhancedHeader'
import { SkeletonList } from '../../components/SkeletonLoader'
import { reportService } from '../../services/reportService'
import { COLORS, RADIUS, SHADOWS } from '../../constants'
import { formatDate } from '../../utils/formatters'

const STATUS_FILTERS = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'verified', label: 'Verified', icon: ShieldCheck },
  { key: 'in_progress', label: 'In Progress', icon: TrendingUp },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
]

export default function ManageReportsScreen({ navigation }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      const params = { limit: 50 }
      if (filter !== 'all') params.status = filter
      const res = await reportService.getAllReports(params)
      setReports(res?.reports || res?.data || [])
    } catch {
      if (!isRefresh) Toast.show({ type: 'error', text1: 'Failed to load reports' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filter])

  useFocusEffect(useCallback(() => { setLoading(true); fetchReports() }, [filter]))

  const onRefresh = () => { setRefreshing(true); fetchReports(true) }

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 60).springify()}>
      <GlassCard style={styles.reportCard} onPress={() => navigation.navigate('ReportDetails', { reportId: item._id })}>
        <View style={styles.reportHeader}>
          <StatusBadge status={item.status} size="sm" />
          {item.severity && (
            <View style={[styles.severityDot, { backgroundColor: item.severity === 'high' ? COLORS.danger : item.severity === 'medium' ? COLORS.warning : COLORS.accent }]} />
          )}
        </View>
        <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
        {item.description && <Text style={styles.reportDesc} numberOfLines={2}>{item.description}</Text>}
        <View style={styles.reportMeta}>
          <Text style={styles.metaText}>{item.reportedBy?.fullName || 'Anonymous'}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <EnhancedHeader title="Manage Reports" subtitle={`${reports.length} total`} onBack={() => navigation.goBack()} />

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(s => {
          const Icon = s.icon
          return (
            <TouchableOpacity key={s.key} style={[styles.filterChip, filter === s.key && styles.filterChipActive]}
              onPress={() => setFilter(s.key)}>
              <Icon size={14} color={filter === s.key ? COLORS.primary : COLORS.muted} />
              <Text style={[styles.filterText, filter === s.key && styles.filterTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {loading && !refreshing ? (
        <View style={styles.list}><SkeletonList count={4} /></View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={r => r._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <FileText size={48} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No reports found</Text>
              <Text style={styles.emptyDesc}>Try changing the filter</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 6, flexWrap: 'wrap' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  filterTextActive: { color: COLORS.primary },
  list: { padding: 16, paddingTop: 8 },
  reportCard: { marginBottom: 10 },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  reportTitle: { fontSize: 16, fontWeight: '600', color: COLORS.secondary, marginBottom: 4 },
  reportDesc: { fontSize: 13, color: COLORS.mutedText, lineHeight: 18, marginBottom: 8 },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.muted },
  metaDot: { fontSize: 12, color: COLORS.muted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.mutedText, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
})
