import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { COLORS, RADIUS, SHADOWS } from '../constants'

export default function GlassCard({ children, style, containerStyle, onPress, index = 0, padding = 20, blur = false }) {
  const Wrapper = onPress ? TouchableOpacity : View

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).springify()} style={containerStyle}>
      <Wrapper
        onPress={onPress}
        activeOpacity={0.85}
        style={[{
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderRadius: RADIUS.xl,
          padding,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.5)',
          ...SHADOWS.md,
          overflow: 'hidden',
        }, style]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: RADIUS.xl,
          }}
        />
        <View style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </View>
      </Wrapper>
    </Animated.View>
  )
}

