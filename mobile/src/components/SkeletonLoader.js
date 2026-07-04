import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { COLORS, RADIUS } from '../constants'

function SkeletonBlock({ width = '100%', height = 20, borderRadius = RADIUS.sm, style }) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[{
        width, height, borderRadius,
        backgroundColor: COLORS.skeleton,
      }, animatedStyle, style]}
    />
  )
}

export function SkeletonCard({ style }) {
  return (
    <View style={[{
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.xl,
      padding: 20,
      marginBottom: 12,
    }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <SkeletonBlock width={48} height={48} borderRadius={24} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <SkeletonBlock width="60%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="40%" height={12} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonBlock width="80%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonBlock width="45%" height={14} />
    </View>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  )
}

export { SkeletonBlock, SkeletonBlock as Skeleton }
export default SkeletonBlock
