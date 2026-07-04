import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, RADIUS } from '../constants'

const statusStyles = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  verified: { bg: '#DBEAFE', text: COLORS.primary },
  in_progress: { bg: '#DBEAFE', text: '#1D4ED8' },
  resolved: { bg: '#D1FAE5', text: COLORS.accentDark },
  rejected: { bg: '#FEE2E2', text: COLORS.danger },
}

const severityStyles = {
  low: { bg: '#F1F5F9', text: '#475569' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  high: { bg: '#FEE2E2', text: COLORS.danger },
  critical: { bg: '#FEE2E2', text: '#991B1B' },
}

function Badge({ label, colors, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  )
}

export function StatusBadge({ status }) {
  const key = status?.toLowerCase()
  const label = key ? key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unknown'
  return <Badge label={label} colors={statusStyles[key] || { bg: COLORS.border, text: COLORS.mutedText }} />
}

export function SeverityBadge({ severity }) {
  const key = severity?.toLowerCase()
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Medium'
  return <Badge label={label} colors={severityStyles[key] || severityStyles.medium} />
}

export function CategoryBadge({ category }) {
  const label = category ? category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Other'
  const colors = { bg: COLORS.background, text: COLORS.secondaryLight }
  return <Badge label={label} colors={colors} />
}

export default function BadgeComponent({ status, severity, type, value, small, style }) {
  if (status) return <View style={[styles.badge, { backgroundColor: statusStyles[status]?.bg || '#F1F5F9' }, small && { paddingHorizontal: 8, paddingVertical: 2 }, style]}><Text style={[styles.text, { color: statusStyles[status]?.text || '#64748b' }, small && { fontSize: 10 }]}>{status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Text></View>
  if (type === 'severity' || severity) return <SeverityBadge severity={value || severity} />
  if (type === 'category') return <CategoryBadge category={value} />
  return null
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
})
