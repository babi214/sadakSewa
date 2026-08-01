import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { MapPin, Clock, ChevronRight } from 'lucide-react-native'
import Badge from './Badge'
import { COLORS, RADIUS, SHADOWS } from '../constants'
import { formatDate } from '../utils/formatters'

export default function ReportCard({ report, onPress, compact, showAdmin }) {
  const thumbnail = report.images?.length > 0
    ? (typeof report.images[0] === 'string' ? { uri: report.images[0] } : report.images[0])
    : null

  return (
    <TouchableOpacity style={[styles.card, SHADOWS.sm]} onPress={onPress} activeOpacity={0.7}>
      {thumbnail && (
        <Image source={thumbnail} style={styles.thumb} />
      )}
      <View style={[styles.body, !thumbnail && styles.bodyFull]}>
        <View style={styles.topRow}>
          <Badge status={report.status} small />
          {compact && (
            <View style={styles.distance}>
              <MapPin size={10} color={COLORS.muted} />
              <Text style={styles.distanceText}>{report.distance ? `${(report.distance / 1000).toFixed(1)}km` : 'nearby'}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>{report.title}</Text>
        {!compact && (
          <Text style={styles.desc} numberOfLines={2}>{report.description}</Text>
        )}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MapPin size={12} color={COLORS.muted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {[report.province, report.district, report.municipality].filter(Boolean).join(', ') || report.location?.address || 'Location'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={12} color={COLORS.muted} />
            <Text style={styles.metaText}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={16} color={COLORS.muted} style={styles.chevron} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 0,
    alignItems: 'center',
  },
  thumb: { width: 80, height: 80, borderRadius: RADIUS.md, margin: 10 },
  body: { flex: 1, paddingVertical: 12, paddingRight: 8 },
  bodyFull: { paddingLeft: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.secondary, lineHeight: 20, letterSpacing: -0.2 },
  desc: { fontSize: 13, color: COLORS.mutedText, lineHeight: 18, marginTop: 4 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: COLORS.muted },
  distance: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  distanceText: { fontSize: 11, color: COLORS.muted, fontWeight: '500' },
  chevron: { marginRight: 8 },
})
