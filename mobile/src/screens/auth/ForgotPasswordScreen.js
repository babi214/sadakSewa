import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Mail } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { FormField, Input } from '../../components/Input'
import Button from '../../components/Button'
import { authService } from '../../services/authService'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants'
import { validateEmail, getApiErrorMessage } from '../../utils/validators'

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const emailError = validateEmail(email)
    setError(emailError)
    if (emailError) return

    setLoading(true)
    try {
      const res = await authService.forgotPassword(email.trim())
      Toast.show({ type: 'success', text1: 'Reset code sent' })
      navigation.navigate('ResetPassword', {
        email: email.trim(),
      })
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Reset request failed') })
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
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>Enter your email and we will send a 6-digit reset code.</Text>

              <FormField label="Email" error={error} required>
                <View style={styles.inputOuter}>
                  <Mail size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value)
                      if (error) setError('')
                    }}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={error}
                    style={styles.inputField}
                  />
                </View>
              </FormField>

              <Button size="lg" loading={loading} onPress={handleSubmit} icon={Mail} style={styles.submitBtn}>
                Send Reset Code
              </Button>

              <Text style={styles.footerText}>
                Remembered your password?{' '}
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
  submitBtn: { borderRadius: RADIUS.md, ...SHADOWS.md },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.mutedText,
    marginTop: SPACING.xxl,
  },
  footerLink: { color: COLORS.primary, fontWeight: '700' },
})
