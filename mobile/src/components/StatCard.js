import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SHADOWS } from '../constants'

const accentMap = {
  primary: { bg: COLORS.primary + '12', icon: COLORS.primary },
  warning: { bg: COLORS.warning + '15', icon: COLORS.warning },
  secondary: { bg: COLORS.secondary + '0A', icon: COLORS.secondary },
  accent: { bg: COLORS.accent + '12', icon: COLORS.accent },
  danger: { bg: COLORS.danger + '12', icon: COLORS.danger },
}

export default function StatCard({ title, value, icon: Icon, color = 'primary', style, children }) {
  const c = accentMap[color] || accentMap.primary
  return (
    <View style={[styles.card, SHADOWS.sm, style]}>
      <View style={[styles.iconWrap, { backgroundColor: c.bg }]}>
        {Icon ? (typeof Icon === 'function' ? <Icon size={20} color={c.icon} /> : Icon) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{title}</Text>
        <Text style={[styles.value, { color: c.icon }]}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 14,
    borderWidth: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
})
