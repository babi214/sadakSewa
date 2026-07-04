import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { COLORS, RADIUS } from '../constants'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 32, alignItems: 'center', gap: 16 },
  text: { fontSize: 14, color: COLORS.mutedText },
})
