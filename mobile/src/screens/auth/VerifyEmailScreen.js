import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Mail, MailCheck } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { FormField, Input } from '../../components/Input'
import Button from '../../components/Button'
import { authService } from '../../services/authService'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants'
import { validateEmail, getApiErrorMessage } from '../../utils/validators'

export default function VerifyEmailScreen({ navigation, route }) {
  const [form, setForm] = useState({
    email: route?.params?.email || '',
    code: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (name, value) => {
    const nextValue = name === 'code' ? value.replace(/\D/g, '').slice(0, 6) : value
    setForm((prev) => ({ ...prev, [name]: nextValue }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {
      email: validateEmail(form.email),
      code: !form.code ? 'Verification code is required' : form.code.length !== 6 ? 'Code must be 6 digits' : '',
    }
    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const res = await authService.verifyEmail({
        email: form.email.trim(),
        code: form.code,
      })
      Toast.show({ type: 'success', text1: res.message || 'Email verified' })
      navigation.navigate('Login')
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Verification failed') })
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
              <View style={styles.iconWrap}>
                <MailCheck size={30} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>

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

              <FormField label="Verification code" error={errors.code} required>
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

              <Button size="lg" loading={loading} onPress={handleSubmit} icon={MailCheck} style={styles.submitBtn}>
                Verify Email
              </Button>

              <Text style={styles.footerText}>
                Already verified?{' '}
                <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
                  Sign in
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
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
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
