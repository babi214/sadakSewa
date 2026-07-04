import React from 'react'
import { TouchableOpacity } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, RADIUS, SHADOWS, GRADIENTS } from '../constants'

export default function FloatingActionButton({ icon: Icon, onPress, color = 'primary', size = 56, style }) {
  const scale = useSharedValue(1)
  const rotate = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }))

  const colors = GRADIENTS[color] || GRADIENTS.primary

  return (
    <Animated.View style={[{
      position: 'absolute',
      bottom: 24,
      right: 16,
      borderRadius: size / 2,
      ...SHADOWS.lg,
      zIndex: 100,
    }, animatedStyle, style]}>
      <TouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.9) }}
        onPressOut={() => { scale.value = withSpring(1) }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon && <Icon size={size * 0.45} color="#FFF" />}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}
