import React, { useContext, useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert,
  TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { useNavigation } from '@react-navigation/native'
import {
  Camera, Image as ImageIcon, MapPin, AlertTriangle, CheckCircle2,
  XCircle, ChevronLeft, Send, X, Scan,
} from 'lucide-react-native'

import { AuthContext } from '../../context/AuthContext'
import { aiService } from '../../services/aiService'
import { reportService } from '../../services/reportService'
import api from '../../api/axios'
import LocationPicker from '../../components/LocationPicker'
import GlassCard from '../../components/GlassCard'
import {
  COLORS, GRADIENTS, RADIUS, SHADOWS, REPORT_CATEGORIES,
  SEVERITY_LEVELS, MAX_REPORT_IMAGES,
} from '../../constants'
import { getApiErrorMessage } from '../../utils/validators'

const initialForm = {
  title: '',
  description: '',
  category: '',
  severity: 'medium',
  province: '',
  district: '',
  municipality: '',
  locationName: '',
}

function confirmNoDamage() {
  return new Promise((resolve) => {
    Alert.alert(
      'No issues detected',
      'AI analysis did not detect any issues in the image. Are you sure you want to submit this report?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Submit Anyway', style: 'destructive', onPress: () => resolve(true) },
      ]
    )
  })
}

export default function ReportRoadScreen() {
  const navigation = useNavigation()
  const { user } = useContext(AuthContext)

  const [form, setForm] = useState({
    ...initialForm,
    province: user?.province || '',
    district: user?.district || '',
    municipality: user?.municipality || '',
  })
  const [images, setImages] = useState([])
  const [location, setLocation] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [showProvincePicker, setShowProvincePicker] = useState(false)
  const [showDistrictPicker, setShowDistrictPicker] = useState(false)
  const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false)

  useEffect(() => {
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
    } else {
      setDistricts([])
      setMunicipalities([])
    }
  }, [selectedProvinceId])

  useEffect(() => {
    if (selectedDistrictId) {
      api.get(`/locations/municipalities?districtId=${selectedDistrictId}`).then(({ data }) => {
        if (data.success) setMunicipalities(data.data)
      }).catch(() => {})
    } else {
      setMunicipalities([])
    }
  }, [selectedDistrictId])

  useEffect(() => {
    if (provinces.length && form.province && !selectedProvinceId) {
      const p = provinces.find((p) => p.name === form.province)
      if (p) setSelectedProvinceId(String(p.id))
    }
  }, [provinces, form.province, selectedProvinceId])

  useEffect(() => {
    if (districts.length && form.district && !selectedDistrictId) {
      const d = districts.find((d) => d.name === form.district)
      if (d) setSelectedDistrictId(String(d.id))
    }
  }, [districts, form.district, selectedDistrictId])

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleProvinceSelect = (p) => {
    setShowProvincePicker(false)
    setSelectedProvinceId(p ? String(p.id) : '')
    setForm(prev => ({ ...prev, province: p ? p.name : '', district: '', municipality: '' }))
    setSelectedDistrictId('')
    setDistricts([])
    setMunicipalities([])
  }

  const handleDistrictSelect = (d) => {
    setShowDistrictPicker(false)
    setSelectedDistrictId(d ? String(d.id) : '')
    setForm(prev => ({ ...prev, district: d ? d.name : '', municipality: '' }))
    setMunicipalities([])
  }

  const handleMunicipalitySelect = (m) => {
    setShowMunicipalityPicker(false)
    setForm(prev => ({ ...prev, municipality: m ? m.name : '' }))
  }

  const applyAiResult = (data) => {
    setAiResult(data)
    if (!data?.detections?.length) return

    const detected = data.detections[0]
    const detectedType = detected?.type || 'road_damage'
    const mappedCategory = detectedType === 'pothole' ? 'pothole' : detectedType === 'landslide' ? 'landslide' : detectedType === 'garbage' ? 'garbage' : 'road_damage'
    const confidence = Number(detected?.confidence) || 0

    setForm(prev => ({
      ...prev,
      category: prev.category || mappedCategory,
      title: prev.title || `AI Detected: ${detectedType.replace(/_/g, ' ')}`,
      description: prev.description || `AI detected ${detectedType.replace(/_/g, ' ')} with ${(confidence * 100).toFixed(0)}% confidence.`,
      severity: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low',
    }))
  }

  const analyzeImage = async (asset) => {
    setAnalyzing(true)
    setAiResult(null)
    try {
      const response = await aiService.analyzeImage(asset)
      if (response.success) {
        applyAiResult(response.data)
        if (response.data?.detections?.length > 0) {
          Toast.show({ type: 'success', text1: 'AI detected issues' })
        } else {
          Toast.show({ type: 'info', text1: 'AI did not detect issues' })
        }
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'AI analysis failed') })
    } finally {
      setAnalyzing(false)
    }
  }

  const addAssets = async (assets = []) => {
    if (!assets.length) return
    const room = MAX_REPORT_IMAGES - images.length
    if (room <= 0) {
      Toast.show({ type: 'info', text1: `Maximum ${MAX_REPORT_IMAGES} photos allowed` })
      return
    }

    const selected = assets.slice(0, room)
    setImages(prev => [...prev, ...selected])
    analyzeImage(selected[0])

    if (!location) {
      const exif = selected[0]?.exif
      let lat, lng
      if (exif) {
        lat = exif.GPSLatitude ?? exif.GPS?.Latitude
        lng = exif.GPSLongitude ?? exif.GPS?.Longitude
      }
      if (lat != null && lng != null) {
        setLocation({ coordinates: [lng, lat], address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, gpsExtracted: true })
        setGpsStatus(`GPS extracted from photo: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } else {
        setGpsStatus('No GPS in photo — pin the location on the map below')
      }
    }

    if (assets.length > room) {
      Toast.show({ type: 'info', text1: `Only ${room} more photo${room === 1 ? '' : 's'} added` })
    }
  }

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take a photo.')
        return
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, exif: true })
      if (!result.canceled) addAssets(result.assets)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to open camera' })
    }
  }

  const handlePickImages = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to select photos.')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_REPORT_IMAGES - images.length,
        quality: 1,
        exif: true,
      })
      if (!result.canceled) addAssets(result.assets)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to open gallery' })
    }
  }

  const removeImage = (uri) => {
    setImages(prev => prev.filter(img => img.uri !== uri))
    if (images.length <= 1) setAiResult(null)
  }

  const validate = () => {
    if (!form.title.trim()) return 'Title is required'
    if (!form.description.trim()) return 'Description is required'
    if (!form.category) return 'Category is required'
    if (images.length === 0) return 'At least one photo is required'
    if (!location?.coordinates) return 'Please pin the issue location'
    return ''
  }

  const handleSubmit = async () => {
    const error = validate()
    if (error) {
      Toast.show({ type: 'error', text1: error })
      return
    }

    if (aiResult && !aiResult.detections?.length) {
      const confirmed = await confirmNoDamage()
      if (!confirmed) return
    }

    setSubmitting(true)
    try {
      const topDetection = aiResult?.detections?.[0]
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        longitude: location.coordinates[0],
        latitude: location.coordinates[1],
        locationName: form.locationName.trim() || location.address || '',
      }
      if (form.province) payload.province = form.province
      if (form.district) payload.district = form.district
      if (form.municipality) payload.municipality = form.municipality
      if (topDetection) {
        payload.aiAnalysis = {
          detectedIssue: topDetection.type,
          confidence: topDetection.confidence,
        }
      }
      if (aiResult?.annotated_image) {
        payload.annotatedImage = `data:image/jpeg;base64,${aiResult.annotated_image}`
      }

      const response = await reportService.createReport(payload, images.map(img => img.uri))
      if (response.success) {
        Toast.show({ type: 'success', text1: 'Report submitted successfully!' })
        navigation.navigate('Map')
      }
    } catch (err) {
      if (err.response?.status === 409) {
        Alert.alert(
          'Similar Report Found',
          err.response.data.message,
          [
            { text: 'View Existing', onPress: () => navigation.navigate('ReportDetails', { reportId: err.response.data.similarReportId }) },
            { text: 'Got it', style: 'cancel' },
          ]
        )
      } else {
        Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to submit report') })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <TouchableOpacity
          onPress={() => {
            setForm({ ...initialForm, province: user?.province || '', district: user?.district || '', municipality: user?.municipality || '' })
            setImages([])
            setLocation(null)
            setAiResult(null)
            setGpsStatus('')
          }}
          style={styles.clearBtn}
          activeOpacity={0.7}
        >
          <X size={18} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Issue Details</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(value) => updateField('title', value)}
            placeholder="e.g. Large pothole on main road"
            placeholderTextColor={COLORS.muted}
            maxLength={150}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Describe the issue, danger level, nearby landmarks..."
            placeholderTextColor={COLORS.muted}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {REPORT_CATEGORIES.map(cat => {
              const active = form.category === cat.value
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.choiceChip, active && styles.choiceChipActive]}
                  onPress={() => updateField('category', cat.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={styles.sectionLabel}>Severity</Text>
          <View style={styles.severityRow}>
            {SEVERITY_LEVELS.map(sev => {
              const active = form.severity === sev.value
              return (
                <TouchableOpacity
                  key={sev.value}
                  style={[styles.severityChip, active && { backgroundColor: sev.color + '18', borderColor: sev.color }]}
                  onPress={() => updateField('severity', sev.value)}
                >
                  <Text style={[styles.severityText, active && { color: sev.color, fontWeight: '800' }]}>{sev.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <TextInput
            style={styles.input}
            value={form.locationName}
            onChangeText={(value) => updateField('locationName', value)}
            placeholder="Location name, street, or landmark"
            placeholderTextColor={COLORS.muted}
            maxLength={200}
          />
          {/* Province Picker */}
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowProvincePicker(true)}>
            <Text style={[styles.pickerText, !form.province && styles.pickerPlaceholder]}>
              {form.province || 'Select province'}
            </Text>
          </TouchableOpacity>
          {showProvincePicker && (
            <View style={styles.pickerModal}>
              <ScrollView>
                <TouchableOpacity style={styles.pickerItem} onPress={() => handleProvinceSelect(null)}>
                  <Text style={styles.pickerItemText}>-- Clear --</Text>
                </TouchableOpacity>
                {provinces.map(p => (
                  <TouchableOpacity key={p.id} style={styles.pickerItem} onPress={() => handleProvinceSelect(p)}>
                    <Text style={[styles.pickerItemText, form.province === p.name && styles.pickerItemTextSelected]}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* District Picker */}
          <TouchableOpacity style={[styles.pickerBtn, !selectedProvinceId && styles.pickerBtnDisabled]} onPress={() => selectedProvinceId && setShowDistrictPicker(true)} disabled={!selectedProvinceId}>
            <Text style={[styles.pickerText, !form.district && styles.pickerPlaceholder]}>
              {form.district || 'Select district'}
            </Text>
          </TouchableOpacity>
          {showDistrictPicker && (
            <View style={styles.pickerModal}>
              <ScrollView>
                {districts.map(d => (
                  <TouchableOpacity key={d.id} style={styles.pickerItem} onPress={() => handleDistrictSelect(d)}>
                    <Text style={[styles.pickerItemText, form.district === d.name && styles.pickerItemTextSelected]}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Municipality Picker */}
          <TouchableOpacity style={[styles.pickerBtn, !selectedDistrictId && styles.pickerBtnDisabled]} onPress={() => selectedDistrictId && setShowMunicipalityPicker(true)} disabled={!selectedDistrictId}>
            <Text style={[styles.pickerText, !form.municipality && styles.pickerPlaceholder]}>
              {form.municipality || 'Select municipality'}
            </Text>
          </TouchableOpacity>
          {showMunicipalityPicker && (
            <View style={styles.pickerModal}>
              <ScrollView>
                {municipalities.map(m => (
                  <TouchableOpacity key={m.id} style={styles.pickerItem} onPress={() => handleMunicipalitySelect(m)}>
                    <Text style={[styles.pickerItemText, form.municipality === m.name && styles.pickerItemTextSelected]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <LocationPicker location={location} onLocationSelect={setLocation} />
          {gpsStatus ? <Text style={styles.gpsStatus}>{gpsStatus}</Text> : null}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.photoHeader}>
            <Text style={styles.cardTitle}>Photos</Text>
            <Text style={styles.photoCount}>{images.length}/{MAX_REPORT_IMAGES}</Text>
          </View>
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto} activeOpacity={0.85}>
              <Camera size={18} color={COLORS.primary} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickImages} activeOpacity={0.85}>
              <ImageIcon size={18} color={COLORS.primary} />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageStrip}>
              {images.map(img => (
                <View key={img.uri} style={styles.imageWrap}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} />
                  <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(img.uri)}>
                    <X size={14} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <Text style={styles.aiNote}>
            AI detects road damage, landslides, and garbage. Other problems like drainage or streetlight issues should still be reported regardless.
          </Text>

          {analyzing && (
            <View style={styles.aiStatusRow}>
              <Scan size={16} color={COLORS.primary} />
              <Text style={styles.aiStatusText}>Analyzing image with AI...</Text>
            </View>
          )}

          {aiResult?.annotated_image && !analyzing && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.secondary, marginBottom: 6 }}>AI Detections</Text>
              <Image
                source={{ uri: `data:image/jpeg;base64,${aiResult.annotated_image}` }}
                style={{ width: '100%', height: 220, borderRadius: RADIUS.md, backgroundColor: COLORS.skeleton }}
                resizeMode="cover"
              />
            </View>
          )}
          {aiResult && !analyzing && (
            <View style={[styles.aiBox, aiResult.detections?.length > 0 ? styles.aiDanger : styles.aiGood]}>
              {aiResult.detections?.length > 0 ? (
                <XCircle size={18} color={COLORS.danger} />
              ) : (
                <CheckCircle2 size={18} color={COLORS.accent} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiBoxTitle, { color: aiResult.detections?.length > 0 ? COLORS.danger : COLORS.accentDark }]}> 
                  {aiResult.detections?.length > 0 ? 'AI detected issues' : 'No issues detected'}
                </Text>
                {aiResult.detections?.length > 0 && (
                  <Text style={styles.aiBoxText}>
                    {aiResult.detections.map(d => `${d.type.replace(/_/g, ' ')} (${(d.confidence * 100).toFixed(0)}%)`).join(', ')}
                  </Text>
                )}
              </View>
            </View>
          )}
        </GlassCard>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.submitGradient}>
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Send size={18} color={COLORS.white} />
                <Text style={styles.submitLabel}>Submit Report</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.secondary },
  clearBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 14 },
  card: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: COLORS.secondary, marginBottom: 14 },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 14,
    fontSize: 14, color: COLORS.secondary, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 12,
  },
  textArea: { minHeight: 110 },
  sectionLabel: {
    fontSize: 13, fontWeight: '800', color: COLORS.secondary,
    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10, marginTop: 4,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  choiceChip: {
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  choiceChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  choiceText: { fontSize: 12, fontWeight: '700', color: COLORS.mutedText },
  choiceTextActive: { color: COLORS.white },
  severityRow: { flexDirection: 'row', gap: 8 },
  severityChip: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  severityText: { fontSize: 13, fontWeight: '700', color: COLORS.mutedText },
  photoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  photoCount: { fontSize: 13, fontWeight: '700', color: COLORS.mutedText, marginBottom: 14 },
  photoActions: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 1.5,
    borderColor: COLORS.primary + '30', backgroundColor: COLORS.primary + '08',
  },
  photoBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  imageStrip: { gap: 10, paddingTop: 14 },
  imageWrap: { width: 92, height: 92, borderRadius: RADIUS.md, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  removeImg: {
    position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.72)', alignItems: 'center', justifyContent: 'center',
  },
  aiStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  aiStatusText: { fontSize: 13, fontWeight: '600', color: COLORS.mutedText },
  aiBox: {
    flexDirection: 'row', gap: 10, padding: 12, borderRadius: RADIUS.lg,
    borderWidth: 1, marginTop: 14,
  },
  aiDanger: { backgroundColor: COLORS.danger + '08', borderColor: COLORS.danger + '30' },
  aiGood: { backgroundColor: COLORS.accent + '08', borderColor: COLORS.accent + '30' },
  aiBoxTitle: { fontSize: 14, fontWeight: '800' },
  aiBoxText: { fontSize: 12, color: COLORS.mutedText, marginTop: 4, textTransform: 'capitalize' },
  submitBtn: { borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOWS.md },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10,
  },
  submitLabel: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  pickerBtn: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 14,
    fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  pickerBtnDisabled: { opacity: 0.5 },
  pickerText: { fontSize: 14, color: COLORS.secondary },
  pickerPlaceholder: { color: COLORS.muted },
  pickerModal: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 8,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, maxHeight: 300,
  },
  pickerItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: RADIUS.sm },
  pickerItemText: { fontSize: 14, color: COLORS.secondary },
  pickerItemTextSelected: { color: COLORS.primary, fontWeight: '700' },
  gpsStatus: { fontSize: 12, color: COLORS.mutedText, marginTop: 8, fontStyle: 'italic' },
  aiNote: { fontSize: 11, color: COLORS.mutedText, marginTop: 14, lineHeight: 16 },
})