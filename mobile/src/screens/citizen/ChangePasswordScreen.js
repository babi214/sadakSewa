import React, { useContext, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import GlassCard from '../../components/GlassCard'
import Button from '../../components/Button'
import { FormField, Input } from '../../components/Input'
import { AuthContext } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants'
import { getApiErrorMessage, validateConfirmPassword, validatePassword } from '../../utils/validators'

export default function ChangePasswordScreen({ navigation }) {
  const { logout } = useContext(AuthContext)
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {
      currentPassword: validatePassword(form.currentPassword),
      newPassword: validatePassword(form.newPassword),
      confirmPassword: validateConfirmPassword(form.newPassword, form.confirmPassword),
    }

    if (!nextErrors.newPassword && form.currentPassword === form.newPassword) {
      nextErrors.newPassword = 'New password must be different'
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const res = await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      Toast.show({ type: 'success', text1: res.message || 'Password changed' })
      await logout()
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error, 'Password change failed') })
    } finally {
      setLoading(false)
    }
  }

  const renderPasswordField = ({ name, label, placeholder, autoComplete }) => (
    <FormField label={label} error={errors[name]} required>
      <View style={styles.inputOuter}>
        <Lock size={18} color={COLORS.mutedText} style={styles.leftIcon} />
        <Input
          value={form[name]}
          onChangeText={(value) => handleChange(name, value)}
          placeholder={placeholder}
          secureTextEntry={!visible[name]}
          autoComplete={autoComplete}
          error={errors[name]}
          style={styles.inputField}
        />
        <TouchableOpacity
          onPress={() => setVisible((prev) => ({ ...prev, [name]: !prev[name] }))}
          style={styles.rightIconBtn}
          activeOpacity={0.7}
        >
          {visible[name] ? (
            <Eye size={20} color={COLORS.mutedText} />
          ) : (
            <EyeOff size={20} color={COLORS.mutedText} />
          )}
        </TouchableOpacity>
      </View>
    </FormField>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronRight size={20} color={COLORS.secondary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <GlassCard style={styles.card}>
            <View style={styles.iconWrap}>
              <ShieldCheck size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Update your password</Text>
            <Text style={styles.subtitle}>You will be signed out after changing it.</Text>

            {renderPasswordField({
              name: 'currentPassword',
              label: 'Current password',
              placeholder: 'Enter current password',
              autoComplete: 'current-password',
            })}
            {renderPasswordField({
              name: 'newPassword',
              label: 'New password',
              placeholder: 'Create a new password',
              autoComplete: 'new-password',
            })}
            {renderPasswordField({
              name: 'confirmPassword',
              label: 'Confirm password',
              placeholder: 'Confirm new password',
              autoComplete: 'new-password',
            })}

            <Button size="lg" loading={loading} onPress={handleSubmit} icon={ShieldCheck} style={styles.submitBtn}>
              Change Password
            </Button>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    padding: SPACING.xxl,
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
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.mutedText,
    lineHeight: 20,
    marginBottom: SPACING.xxl,
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
    paddingRight: 48,
  },
  submitBtn: {
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
})
