import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native'
import { COLORS, RADIUS, SHADOWS } from '../constants'

function renderTextChildren(children, textStyle) {
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={textStyle}>{children}</Text>
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return <Text key={i} style={textStyle}>{child}</Text>
      }
      return child
    })
  }
  return children
}

export default function Button({ children, variant = 'primary', size = 'md', icon: Icon, loading, disabled, danger, style, onPress, ...props }) {
  const isPrimary = variant === 'primary'
  const isSecondary = variant === 'secondary'
  const isOutline = variant === 'outline'
  const isGhost = variant === 'ghost'
  const isDanger = variant === 'danger' || danger

  const sizeStyles = {
    sm: { py: 10, px: 16, iconSize: 16, fontSize: 13 },
    md: { py: 14, px: 20, iconSize: 18, fontSize: 15 },
    lg: { py: 16, px: 24, iconSize: 20, fontSize: 16 },
  }
  const s = sizeStyles[size]

  const bgColor = isPrimary ? COLORS.primary : isSecondary ? COLORS.secondary : isOutline ? 'transparent' : isGhost ? 'transparent' : isDanger ? COLORS.danger : COLORS.primary
  const textColor = isOutline ? COLORS.primary : isGhost ? COLORS.primary : COLORS.white
  const borderColor = isOutline ? COLORS.primary + '40' : 'transparent'
  const opacity = disabled ? 0.5 : 1

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor,
          opacity,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          borderRadius: RADIUS.md,
        },
        isPrimary && !disabled && SHADOWS.sm,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.content}>
          {Icon && <Icon size={s.iconSize} color={textColor} style={{ marginRight: 8 }} />}
          {renderTextChildren(children, { color: textColor, fontSize: s.fontSize })}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
