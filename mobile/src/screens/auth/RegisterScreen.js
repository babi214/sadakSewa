import React, { useState, useContext, useRef, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, ChevronDown, Zap } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { FormField, Input } from '../../components/Input'
import Button from '../../components/Button'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants'
import api from '../../api/axios'
import { validateEmail, validatePassword, validateRequired, validateConfirmPassword, validatePhone, getApiErrorMessage } from '../../utils/validators'

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    province: '',
    district: '',
    municipality: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showProvincePicker, setShowProvincePicker] = useState(false)
  const [showDistrictPicker, setShowDistrictPicker] = useState(false)
  const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const slideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start()
    api.get('/locations/provinces').then(({ data }) => {
      if (data.success) setProvinces(data.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedProvinceId) {
      api.get(`/locations/districts?provinceId=${selectedProvinceId}`).then(({ data }) => {
        if (data.success) {
          setDistricts(data.data)
          setMunicipalities([])
        }
      }).catch(() => {})
      setForm(prev => ({ ...prev, district: '', municipality: '' }))
      setSelectedDistrictId('')
    } else {
      setDistricts([])
      setMunicipalities([])
      setForm(prev => ({ ...prev, district: '', municipality: '' }))
      setSelectedDistrictId('')
    }
  }, [selectedProvinceId])

  useEffect(() => {
    if (selectedDistrictId) {
      api.get(`/locations/municipalities?districtId=${selectedDistrictId}`).then(({ data }) => {
        if (data.success) setMunicipalities(data.data)
      }).catch(() => {})
      setForm(prev => ({ ...prev, municipality: '' }))
    } else {
      setMunicipalities([])
      setForm(prev => ({ ...prev, municipality: '' }))
    }
  }, [selectedDistrictId])

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleProvinceSelect = (item) => {
    setSelectedProvinceId(String(item.id))
    setForm(prev => ({ ...prev, province: item.name, district: '', municipality: '' }))
    setSelectedDistrictId('')
    setShowProvincePicker(false)
  }

  const handleDistrictSelect = (item) => {
    setSelectedDistrictId(String(item.id))
    setForm(prev => ({ ...prev, district: item.name, municipality: '' }))
    setShowDistrictPicker(false)
  }

  const handleMunicipalitySelect = (item) => {
    setForm(prev => ({ ...prev, municipality: item.name }))
    setShowMunicipalityPicker(false)
  }

  const validate = () => {
    const e = {
      fullName: validateRequired(form.fullName, 'Full name'),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      phone: validatePhone(form.phone),
      province: validateRequired(form.province, 'Province'),
      district: validateRequired(form.district, 'District'),
      municipality: validateRequired(form.municipality, 'Municipality'),
    }
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        province: form.province,
        district: form.district,
        municipality: form.municipality,
      }
      const res = await register(payload)
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Check your email to verify your account' })
        navigation.navigate('VerifyEmail', {
          email: payload.email,
        })
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error, 'Registration failed') })
    } finally {
      setLoading(false)
    }
  }

  const cardTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
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
                  <Zap size={34} color={COLORS.white} />
                </View>
              </LinearGradient>
              <Text style={styles.brandName}>Join SadakSewa</Text>
              <Text style={styles.brandTagline}>Create an account to start reporting</Text>
            </View>

            <Animated.View
              style={[
                styles.card,
                { transform: [{ translateY: cardTranslateY }], opacity: slideAnim },
              ]}
            >
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSubtitle}>Fill in your details to get started</Text>

              <FormField label="Full name" error={errors.fullName} required>
                <View style={styles.inputOuter}>
                  <User size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.fullName}
                    onChangeText={v => handleChange('fullName', v)}
                    placeholder="Ram Sharma"
                    error={errors.fullName}
                    style={styles.inputField}
                  />
                </View>
              </FormField>

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

              <FormField label="Password" error={errors.password} required hint="Minimum 8 characters">
                <View style={styles.inputOuter}>
                  <Lock size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.password}
                    onChangeText={v => handleChange('password', v)}
                    placeholder="Create a strong password"
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
                    onChangeText={v => handleChange('confirmPassword', v)}
                    placeholder="Re-enter your password"
                    secureTextEntry
                    error={errors.confirmPassword}
                    style={styles.inputField}
                  />
                </View>
              </FormField>

              <FormField label="Phone" error={errors.phone} required>
                <View style={styles.inputOuter}>
                  <Phone size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <Input
                    value={form.phone}
                    onChangeText={v => handleChange('phone', v)}
                    placeholder="+977-98XXXXXXXX"
                    keyboardType="phone-pad"
                    error={errors.phone}
                    style={styles.inputField}
                  />
                </View>
              </FormField>

              <FormField label="Province" error={errors.province} required>
                <View style={styles.inputOuter}>
                  <MapPin size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => setShowProvincePicker(!showProvincePicker)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectText, !form.province && styles.placeholderText]}>
                      {form.province || 'Select province'}
                    </Text>
                    <ChevronDown
                      size={18}
                      color={COLORS.mutedText}
                      style={{ transform: [{ rotate: showProvincePicker ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                </View>
                {showProvincePicker && (
                  <View style={styles.pickerList}>
                    {provinces.map((item, i) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.pickerItem,
                          i === provinces.length - 1 && styles.pickerItemLast,
                          form.province === item.name && styles.pickerItemActive,
                        ]}
                        onPress={() => handleProvinceSelect(item)}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.pickerItemText, form.province === item.name && styles.pickerItemTextActive]}>
                          {item.name}
                        </Text>
                        {form.province === item.name && <View style={styles.pickerCheck} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </FormField>

              <FormField label="District" error={errors.district} required>
                <View style={styles.inputOuter}>
                  <MapPin size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => setShowDistrictPicker(!showDistrictPicker)}
                    disabled={!selectedProvinceId}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectText, !form.district && styles.placeholderText]}>
                      {form.district || 'Select district'}
                    </Text>
                    <ChevronDown
                      size={18}
                      color={COLORS.mutedText}
                      style={{ transform: [{ rotate: showDistrictPicker ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                </View>
                {showDistrictPicker && (
                  <View style={styles.pickerList}>
                    {districts.map((item, i) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.pickerItem,
                          i === districts.length - 1 && styles.pickerItemLast,
                          form.district === item.name && styles.pickerItemActive,
                        ]}
                        onPress={() => handleDistrictSelect(item)}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.pickerItemText, form.district === item.name && styles.pickerItemTextActive]}>
                          {item.name}
                        </Text>
                        {form.district === item.name && <View style={styles.pickerCheck} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </FormField>

              <FormField label="Municipality" error={errors.municipality} required>
                <View style={styles.inputOuter}>
                  <MapPin size={18} color={COLORS.mutedText} style={styles.leftIcon} />
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => setShowMunicipalityPicker(!showMunicipalityPicker)}
                    disabled={!selectedDistrictId}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectText, !form.municipality && styles.placeholderText]}>
                      {form.municipality || 'Select municipality'}
                    </Text>
                    <ChevronDown
                      size={18}
                      color={COLORS.mutedText}
                      style={{ transform: [{ rotate: showMunicipalityPicker ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                </View>
                {showMunicipalityPicker && (
                  <View style={styles.pickerList}>
                    {municipalities.map((item, i) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.pickerItem,
                          i === municipalities.length - 1 && styles.pickerItemLast,
                          form.municipality === item.name && styles.pickerItemActive,
                        ]}
                        onPress={() => handleMunicipalitySelect(item)}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.pickerItemText, form.municipality === item.name && styles.pickerItemTextActive]}>
                          {item.name}
                        </Text>
                        {form.municipality === item.name && <View style={styles.pickerCheck} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </FormField>

              <Button size="lg" loading={loading} onPress={handleSubmit} style={styles.submitBtn}>
                Create Account
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  Sign in
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
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 44,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
  },
  selectText: {
    fontSize: 15,
    color: COLORS.secondary,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.muted,
  },
  pickerList: {
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  pickerItemLast: {
    borderBottomWidth: 0,
  },
  pickerItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  pickerItemText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  pickerCheck: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  submitBtn: {
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
    marginTop: SPACING.sm,
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
