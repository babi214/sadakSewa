import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Card from './Card'
import { COLORS, RADIUS } from '../constants'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeeklyTrendChart({ data = [], style }) {
  const values = DAYS.map((_, i) => data[i] || 0)
  const max = Math.max(...values, 1)

  return (
    <Card style={style}>
      <Text style={styles.title}>Weekly Trend</Text>
      <View style={styles.chart}>
        {values.map((v, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barValue}>{v || ''}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${(v / max) * 100}%` }]} />
            </View>
            <Text style={styles.barLabel}>{DAYS[i]}</Text>
          </View>
        ))}
      </View>
    </Card>
  )
}

export function StatusBreakdownChart({ data = {}, style }) {
  const items = [
    { label: 'Pending', value: data.pending || 0, color: '#f59e0b' },
    { label: 'Verified', value: data.verified || 0, color: '#3b82f6' },
    { label: 'In Progress', value: data.inProgress || 0, color: '#1d4ed8' },
    { label: 'Resolved', value: data.resolved || 0, color: '#10b981' },
    { label: 'Rejected', value: data.rejected || 0, color: '#ef4444' },
  ]
  const total = items.reduce((s, i) => s + i.value, 0) || 1

  return (
    <Card style={style}>
      <Text style={styles.title}>Status Breakdown</Text>
      {items.filter(i => i.value > 0).map((item, idx) => (
        <View key={idx} style={styles.barRow}>
          <Text style={styles.barRowLabel}>{item.label}</Text>
          <View style={styles.barRowTrack}>
            <View style={[styles.barRowFill, { width: `${(item.value / total) * 100}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.barRowValue}>{item.value}</Text>
        </View>
      ))}
      {items.every(i => i.value === 0) && <Text style={styles.empty}>No data yet</Text>}
    </Card>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', color: COLORS.secondary, marginBottom: 16, letterSpacing: -0.3 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  barCol: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 11, color: COLORS.mutedText, marginBottom: 4, fontWeight: '600' },
  barTrack: { width: 32, height: 100, backgroundColor: COLORS.background, borderRadius: RADIUS.sm, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, minHeight: 4 },
  barLabel: { fontSize: 11, color: COLORS.muted, marginTop: 6, fontWeight: '500' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barRowLabel: { fontSize: 13, color: COLORS.secondary, width: 90, fontWeight: '500' },
  barRowTrack: { flex: 1, height: 24, backgroundColor: COLORS.background, borderRadius: RADIUS.sm, overflow: 'hidden' },
  barRowFill: { height: '100%', borderRadius: RADIUS.sm, minWidth: 4 },
  barRowValue: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, width: 36, textAlign: 'right' },
  empty: { fontSize: 14, color: COLORS.mutedText, textAlign: 'center', padding: 16 },
})
