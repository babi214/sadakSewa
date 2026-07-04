import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { FormField, Input } from '../../components/Input'
import Button from '../../components/Button'
import { authService } from '../../services/authService'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants'
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  getApiErrorMessage,
} from '../../utils/validators'

export default function ResetPasswordScreen({ navigation, route }) {
  const [form, setForm] = useState({
    email: route?.params?.email || '',
    code: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (name, value) => {
    const nextValue = name === 'code' ? value.replace(/\D/g, '').slice(0, 6) : value
    setForm((prev) => ({ ...prev, [name]: nextValue }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {
      email: validateEmail(form.email),
      code: !form.code ? 'Reset code is required' : form.code.length !== 6 ? 'Code must be 6 digits' : '',
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    }
    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const res = await authService.resetPassword({
        email: form.email.trim(),
        code: form.code,
        password: form.password,
      })
      Toast.show({ type: 'success', text1: res.message || 'Password reset successfully' })
      navigation.navigate('Login')
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Password reset failed') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.primary} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter your 6-digit reset code and choose a new password.</Text>

              <FormField label="Email" error={errors.email} required>
                <View style={styles.inputOuter}>
                  <Mail size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.email}
                    onChangeText={(value) => handleChange('email', value)}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={errors.email}
                    style={styles.inputField}
                  />
                </View>
              </FormField>

              <FormField label="Reset code" error={errors.code} required>
                <Input
                  value={form.code}
                  onChangeText={(value) => handleChange('code', value)}
                  placeholder="123456"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={6}
                  error={errors.code}
                  style={styles.codeInput}
                />
              </FormField>

              <FormField label="New password" error={errors.password} required>
                <View style={styles.inputOuter}>
                  <Lock size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.password}
                    onChangeText={(value) => handleChange('password', value)}
                    placeholder="Create a new password"
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

              <FormField label="Confirm password" error={errors.confirmPassword} required>
                <View style={styles.inputOuter}>
                  <Lock size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.confirmPassword}
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    placeholder="Confirm your new password"
                    secureTextEntry
                    error={errors.confirmPassword}
                    style={styles.inputField}
                  />
                </View>
              </FormField>

              <Button size="lg" loading={loading} onPress={handleSubmit} icon={KeyRound} style={styles.submitBtn}>
                Reset Password
              </Button>

              <Text style={styles.footerText}>
                Back to{' '}
                <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
                  sign in
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.section,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxl,
    ...SHADOWS.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.mutedText,
    lineHeight: 20,
    marginBottom: SPACING.xxl,
  },
  inputOuter: { position: 'relative', justifyContent: 'center' },
  leftIcon: { position: 'absolute', left: 14, zIndex: 10 },
  rightIconBtn: { position: 'absolute', right: 14, zIndex: 10, padding: 4 },
  inputField: { paddingLeft: 44 },
  codeInput: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
  },
  submitBtn: { borderRadius: RADIUS.md, ...SHADOWS.md },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.mutedText,
    marginTop: SPACING.xxl,
  },
  footerLink: { color: COLORS.primary, fontWeight: '700' },
})
