import React, { useState, useContext, useRef, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { CommonActions } from '@react-navigation/native'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { FormField, Input } from '../../components/Input'
import Button from '../../components/Button'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants'
import { validateEmail, validatePassword, getApiErrorMessage } from '../../utils/validators'

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const slideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start()
  }, [])

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await login({ email: form.email.trim(), password: form.password })
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Welcome back!' })
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }))
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error, 'Login failed') })
    } finally {
      setLoading(false)
    }
  }

  const cardTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [250, 0],
  })

  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.primary} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandSection}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
                style={styles.logoGlow}
              >
                <View style={styles.logoInner}>
                  <Image
                    source={require('../../../assets/logoSadakSewa.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
              <Text style={styles.brandName}>SadakSewa</Text>
              <Text style={styles.brandTagline}>Report road issues in your community</Text>
            </View>

            <Animated.View
              style={[
                styles.card,
                { transform: [{ translateY: cardTranslateY }], opacity: slideAnim },
              ]}
            >
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>Sign in to your account to continue</Text>

              <FormField label="Email" error={errors.email} required>
                <View style={styles.inputOuter}>
                  <Mail size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.email}
                    onChangeText={v => handleChange('email', v)}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={errors.email}
                    style={styles.inputField}
                  />
                </View>
              </FormField>

              <FormField label="Password" error={errors.password} required>
                <View style={styles.inputOuter}>
                  <Lock size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.password}
                    onChangeText={v => handleChange('password', v)}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    error={errors.password}
                    style={styles.inputField}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.rightIconBtn}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <Eye size={20} color={COLORS.mutedText} />
                    ) : (
                      <EyeOff size={20} color={COLORS.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>
              </FormField>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <View style={styles.checkboxDot} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <Button size="lg" loading={loading} onPress={handleSubmit} style={styles.submitBtn}>
                Sign In
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Register')}
                >
                  Create one
                </Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: SPACING.xxl,
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: SPACING.section + 40,
    paddingBottom: SPACING.section,
  },
  logoGlow: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.xxl,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: RADIUS.xxl + 4,
    borderTopRightRadius: RADIUS.xxl + 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl + 4,
    paddingBottom: SPACING.xxl,
    marginHorizontal: SPACING.md,
    ...SHADOWS.xl,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.mutedText,
    marginBottom: SPACING.xxl,
    lineHeight: 20,
  },
  inputOuter: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
  },
  rightIconBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  inputField: {
    paddingLeft: 44,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
    marginTop: -SPACING.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: COLORS.white,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.muted,
    marginHorizontal: SPACING.md,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.mutedText,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
})
