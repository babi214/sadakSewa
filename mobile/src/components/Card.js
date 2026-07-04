import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SHADOWS } from '../constants'

export default function Card({ children, style, padding = 'lg', onPress }) {
  const pads = { none: 0, sm: 12, md: 16, lg: 20, xl: 24 }
  const Wrapper = onPress ? TouchableOpacity : View
  return (
    <Wrapper
      style={[styles.card, { padding: pads[padding] }, SHADOWS.md, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </Wrapper>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 4,
    lineHeight: 18,
  },
})
