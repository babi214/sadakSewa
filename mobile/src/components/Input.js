import React from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import { COLORS, RADIUS } from '../constants'

export function FormField({ label, error, hint, required, children, style }) {
  return (
    <View style={[styles.field, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

export const Input = React.forwardRef(({ style, error, ...props }, ref) => (
  <TextInput
    ref={ref}
    style={[styles.input, error && styles.inputError, style]}
    placeholderTextColor={COLORS.muted}
    {...props}
  />
))

export const Textarea = React.forwardRef(({ style, error, ...props }, ref) => (
  <TextInput
    ref={ref}
    multiline
    textAlignVertical="top"
    style={[styles.input, styles.textarea, error && styles.inputError, style]}
    placeholderTextColor={COLORS.muted}
    {...props}
  />
))

const styles = StyleSheet.create({
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: 8 },
  required: { color: COLORS.danger },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.secondary,
  },
  inputError: { borderColor: COLORS.danger + '80' },
  textarea: { minHeight: 112, paddingTop: 14 },
  error: { fontSize: 12, color: COLORS.danger, marginTop: 6 },
  hint: { fontSize: 12, color: COLORS.muted, marginTop: 6 },
})
