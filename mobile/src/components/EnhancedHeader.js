import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, RADIUS, SHADOWS } from '../constants'

export default function EnhancedHeader({ title, subtitle, onBack, rightAction, style }) {
  return (
    <SafeAreaView edges={['top']} style={[{ backgroundColor: COLORS.surface }, style]}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.surface,
      }}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: RADIUS.md,
              backgroundColor: COLORS.background,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <ChevronLeft size={22} color={COLORS.secondary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          {title && (
            <Text style={{
              fontSize: title && subtitle ? 17 : 20,
              fontWeight: '700',
              color: COLORS.secondary,
              letterSpacing: -0.3,
            }}>{title}</Text>
          )}
          {subtitle && (
            <Text style={{
              fontSize: 13,
              color: COLORS.mutedText,
              marginTop: 2,
            }}>{subtitle}</Text>
          )}
        </View>
        {rightAction}
      </View>
    </SafeAreaView>
  )
}
