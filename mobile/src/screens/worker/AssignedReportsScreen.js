import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { ClipboardList } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import Badge from '../../components/Badge'
import ReportCard from '../../components/ReportCard'
import LoadingScreen from '../../components/LoadingScreen'
import EmptyState from '../../components/EmptyState'
import { reportService } from '../../services/reportService'
import { COLORS, RADIUS, SHADOWS } from '../../constants'

const STATUS_FILTERS = ['all', 'verified', 'in_progress', 'resolved']

export default function AssignedReportsScreen({ navigation }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchReports = useCallback(async () => {
    try {
      const params = {}
      if (filter !== 'all') params.status = filter
      const res = await reportService.getAssignedReports(params)
      setReports(res?.reports || res?.data || [])
    } catch { Toast.show({ type: 'error', text1: 'Failed to load reports' }) }
    finally { setLoading(false); setRefreshing(false) }
  }, [filter])

  useFocusEffect(useCallback(() => { setLoading(true); fetchReports() }, [filter]))

  const onRefresh = () => { setRefreshing(true); fetchReports() }

  if (loading && !refreshing) return <LoadingScreen />

  return (
    <View style={styles.flex}>
      <View style={[styles.header, SHADOWS.sm]}>
        <Text style={styles.title}>Assigned Reports</Text>
        <Text style={styles.subtitle}>{reports.length} assigned to you</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {STATUS_FILTERS.map(s => (
          <TouchableOpacity key={s} style={[styles.chip, filter === s && styles.chipActive]}
            onPress={() => setFilter(s)}>
            <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.flex} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        {reports.length === 0 ? (
          <EmptyState icon={<ClipboardList size={48} color={COLORS.muted} />}
            title="No assigned reports" description={filter !== 'all' ? 'No reports with this status' : 'No reports assigned yet'} />
        ) : (
          reports.map(r => <ReportCard key={r._id} report={r} onPress={() => navigation.navigate('ReportDetails', { reportId: r._id })} />)
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: COLORS.surface },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.secondary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.mutedText, marginTop: 2, fontWeight: '500' },
  chipsScroll: { paddingHorizontal: 16, paddingVertical: 8, flexGrow: 0 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  chipTextActive: { color: COLORS.primary },
  list: { padding: 16, paddingTop: 4 },
})
