import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS, RADIUS } from '../constants'

export default function EmptyState({ icon, title, description, message, actionLabel, onAction, style }) {
  const msg = description || message
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconWrap}>
          {typeof icon === 'function' || icon?.render ? React.createElement(icon, { size: 36, color: COLORS.muted }) : icon}
        </View>
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      {msg && <Text style={styles.message}>{msg}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 48, paddingTop: 64 },
  iconWrap: { width: 64, height: 64, borderRadius: RADIUS.xl, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, marginBottom: 8, textAlign: 'center', letterSpacing: -0.3 },
  message: { fontSize: 14, color: COLORS.mutedText, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  action: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  actionText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
})
