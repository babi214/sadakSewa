import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { AlertCircle, CheckCircle2, Flag } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Animated, { FadeInUp } from 'react-native-reanimated'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import EnhancedHeader from '../../components/EnhancedHeader'
import { SkeletonList } from '../../components/SkeletonLoader'
import { reportService } from '../../services/reportService'
import Button from '../../components/Button'
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants'
import { formatDate } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/validators'

export default function FlaggedReportsScreen({ navigation }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchFlagged = useCallback(async (isRefresh = false) => {
    try {
      const res = await reportService.getFlaggedReports()
      setReports(res?.reports || [])
    } catch {
      if (!isRefresh) Toast.show({ type: 'error', text1: 'Failed to load flagged reports' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); fetchFlagged() }, [fetchFlagged]))

  const onRefresh = () => { setRefreshing(true); fetchFlagged(true) }

  const handleClearFlag = async (id) => {
    try {
      const res = await reportService.clearFlag(id)
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Flag cleared' })
        setReports(prev => prev.filter(r => r._id !== id))
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to clear flag') })
    }
  }

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 60).springify()}>
      <GlassCard style={styles.card} onPress={() => navigation.navigate('ReportDetails', { reportId: item._id })}>
        <View style={styles.cardHeader}>
          <View style={styles.badgesRow}>
            <StatusBadge status={item.status} size="sm" />
            {item.severity && (
              <View style={[styles.severityDot, { backgroundColor: item.severity === 'high' ? COLORS.danger : item.severity === 'medium' ? COLORS.warning : COLORS.accent }]} />
            )}
          </View>
          <TouchableOpacity onPress={() => handleClearFlag(item._id)} style={styles.clearBtn}>
            <CheckCircle2 size={18} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
        <View style={styles.flaggedLabel}>
          <AlertCircle size={12} color={COLORS.danger} />
          <Text style={styles.flaggedLabelText}>{item.flaggedReason || 'Flagged for review'}</Text>
        </View>
        {item.userFlags && item.userFlags.length > 0 && (
          <View style={styles.flagsList}>
            {item.userFlags.map((f, i) => (
              <Text key={i} style={styles.flagItem}>
                <Text style={styles.flagUser}>{f.user?.fullName || 'Unknown'}</Text>
                {' '}reported as{' '}
                <Text style={styles.flagReason}>{f.reason?.replace(/_/g, ' ')}</Text>
                {f.customReason ? ` — "${f.customReason}"` : ''}
              </Text>
            ))}
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
        <View style={styles.meta}>
          <Text style={styles.metaText}>{item.reportedBy?.fullName || 'Unknown'}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <EnhancedHeader title="Flagged Reports" subtitle={`${reports.length} pending review`} onBack={() => navigation.goBack()} />

      {loading && !refreshing ? (
        <View style={styles.list}><SkeletonList count={3} /></View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={r => r._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Flag size={48} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No flagged reports</Text>
              <Text style={styles.emptyDesc}>All clear!</Text>
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
  list: { padding: 16, paddingTop: 8 },
  card: { marginBottom: 10, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  badgesRow: { flexDirection: 'row', gap: 6 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  clearBtn: { padding: 4 },
  flaggedLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.danger + '12',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  flaggedLabelText: { fontSize: 11, fontWeight: '600', color: COLORS.danger, flexShrink: 1 },
  flagsList: { marginBottom: 6, gap: 2 },
  flagItem: { fontSize: 11, color: COLORS.mutedText, lineHeight: 16 },
  flagUser: { fontWeight: '600', color: COLORS.secondary },
  flagReason: { fontWeight: '600', color: COLORS.danger, textTransform: 'capitalize' },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.secondary, marginBottom: 4 },
  desc: { fontSize: 13, color: COLORS.mutedText, lineHeight: 18, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.muted },
  metaDot: { fontSize: 12, color: COLORS.muted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.mutedText, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
})
