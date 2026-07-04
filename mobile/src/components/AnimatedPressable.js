import React from 'react'
import { Pressable } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

const AnimatedPressable = React.forwardRef(({ children, style, contentStyle, onPress, scaleTo = 0.96, ...props }, ref) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        ref={ref}
        style={[{ flex: 1 }, contentStyle]}
        onPressIn={() => { scale.value = withSpring(scaleTo) }}
        onPressOut={() => { scale.value = withSpring(1) }}
        onPress={onPress}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
})

export default AnimatedPressable
