import React from 'react'
import { View, Text } from 'react-native'
import { STATUS_COLORS } from '../constants'

export default function StatusBadge({ status, size = 'sm' }) {
  const color = STATUS_COLORS[status] || '#94A3B8'
  const label = status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown'
  const isSmall = size === 'sm'

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: color + '15',
      paddingHorizontal: isSmall ? 8 : 12,
      paddingVertical: isSmall ? 3 : 6,
      borderRadius: 100,
    }}>
      <View style={{
        width: isSmall ? 6 : 8,
        height: isSmall ? 6 : 8,
        borderRadius: 4,
        backgroundColor: color,
        marginRight: 5,
      }} />
      <Text style={{
        fontSize: isSmall ? 11 : 12,
        fontWeight: '700',
        color,
        letterSpacing: 0.2,
      }}>{label}</Text>
    </View>
  )
}
