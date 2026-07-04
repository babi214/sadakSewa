import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, Save } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import GlassCard from '../../components/GlassCard'
import LocationPicker from '../../components/LocationPicker'
import { reportService } from '../../services/reportService'
import { COLORS, RADIUS, REPORT_CATEGORIES, SEVERITY_LEVELS } from '../../constants'
import { getApiErrorMessage } from '../../utils/validators'
import api from '../../api/axios'

export default function EditReportScreen({ route, navigation }) {
  const { reportId } = route.params || {}
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', severity: 'medium', province: '', district: '', municipality: '', locationName: '' })
  const [location, setLocation] = useState(null)
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

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await reportService.getReportById(reportId)
        const report = res?.report || res?.data || res
        if (!alive || !report) return
        setForm({
          title: report.title || '',
          description: report.description || '',
          category: report.category || '',
          severity: report.severity || 'medium',
          province: report.province || '',
          district: report.district || '',
          municipality: report.municipality || '',
          locationName: report.locationName || '',
        })
        if (report.location?.coordinates?.length === 2) {
          setLocation({
            coordinates: report.location.coordinates,
            address: report.locationName || `${report.location.coordinates[1].toFixed(4)}, ${report.location.coordinates[0].toFixed(4)}`,
          })
        }
      } catch (err) {
        Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to load report') })
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [reportId])

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

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

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      Toast.show({ type: 'error', text1: 'Title, description, and category are required' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        province: form.province || '',
        district: form.district || '',
        municipality: form.municipality || '',
        locationName: form.locationName.trim(),
      }
      if (location?.coordinates?.length === 2) {
        payload.longitude = location.coordinates[0]
        payload.latitude = location.coordinates[1]
      }
      await reportService.updateReport(reportId, payload)
      Toast.show({ type: 'success', text1: 'Report updated' })
      navigation.goBack()
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update report') })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Report</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <GlassCard style={styles.card}>
          <TextInput style={styles.input} value={form.title} onChangeText={v => updateField('title', v)} placeholder="Title" placeholderTextColor={COLORS.muted} />
          <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={v => updateField('description', v)} placeholder="Description" placeholderTextColor={COLORS.muted} multiline textAlignVertical="top" />
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {REPORT_CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.value} style={[styles.chip, form.category === cat.value && styles.chipActive]} onPress={() => updateField('category', cat.value)}>
                <Text style={[styles.chipText, form.category === cat.value && styles.chipTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Severity</Text>
          <View style={styles.severityRow}>
            {SEVERITY_LEVELS.map(sev => (
              <TouchableOpacity key={sev.value} style={[styles.severityChip, form.severity === sev.value && { borderColor: sev.color, backgroundColor: sev.color + '18' }]} onPress={() => updateField('severity', sev.value)}>
                <Text style={[styles.severityText, form.severity === sev.value && { color: sev.color }]}>{sev.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={form.locationName} onChangeText={v => updateField('locationName', v)} placeholder="Location name" placeholderTextColor={COLORS.muted} />
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
        </GlassCard>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : <><Save size={18} color={COLORS.white} /><Text style={styles.saveText}>Save Changes</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.surface },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.secondary },
  content: { padding: 16, paddingBottom: 40 },
  card: { padding: 16 },
  input: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: 14, color: COLORS.secondary, marginBottom: 12, fontSize: 14 },
  textArea: { minHeight: 120 },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.secondary, marginBottom: 10, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.mutedText },
  chipTextActive: { color: COLORS.white },
  severityRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  severityChip: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  severityText: { fontSize: 13, fontWeight: '800', color: COLORS.mutedText },
  saveBtn: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  pickerBtn: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  pickerBtnDisabled: { opacity: 0.5 },
  pickerText: { fontSize: 14, color: COLORS.secondary },
  pickerPlaceholder: { color: COLORS.muted },
  pickerModal: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 8,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, maxHeight: 180,
  },
  pickerItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: RADIUS.sm },
  pickerItemText: { fontSize: 14, color: COLORS.secondary },
  pickerItemTextSelected: { color: COLORS.primary, fontWeight: '700' },
})