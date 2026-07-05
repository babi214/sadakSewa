import React, { useEffect, useRef } from 'react'
import { View, Text, Image, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, RADIUS } from '../constants'

export default function SplashScreen({ onFinish }) {
  const logoAnim = useRef(new Animated.Value(0)).current
  const textAnim = useRef(new Animated.Value(0)).current
  const fadeOut = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(fadeOut, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }),
    ]).start(() => onFinish())
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <LinearGradient colors={['#1E40AF', '#2563EB', '#3B82F6']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.logoWrap, { opacity: logoAnim, transform: [{ scale: logoAnim }] }]}>
        <Image source={require('../../assets/logoSadakSewa.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={{ opacity: textAnim }}>
        <Text style={styles.title}>SadakSewa</Text>
        <Text style={styles.tagline}>Report road issues in your community</Text>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  logoWrap: {
    width: 100, height: 100, borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  logo: { width: 72, height: 72, borderRadius: 12 },
  title: {
    fontSize: 32, fontWeight: '800', color: '#FFFFFF',
    textAlign: 'center', letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14, color: 'rgba(255,255,255,0.8)',
    textAlign: 'center', marginTop: 8,
  },
})
