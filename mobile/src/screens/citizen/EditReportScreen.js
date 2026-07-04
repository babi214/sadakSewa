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

export default function EditReportScreen({ route, navigation }) {
  const { reportId } = route.params || {}
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', severity: 'medium', locationName: '' })
  const [location, setLocation] = useState(null)

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
})