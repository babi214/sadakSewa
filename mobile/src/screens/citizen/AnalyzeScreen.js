import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { ChevronLeft, Camera, Image as ImageIcon, Scan, CheckCircle2, XCircle, Trash2 } from 'lucide-react-native'
import GlassCard from '../../components/GlassCard'
import { aiService } from '../../services/aiService'
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../constants'
import { getApiErrorMessage } from '../../utils/validators'

export default function AnalyzeScreen({ navigation }) {
  const [image, setImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const analyzeImage = async (asset) => {
    setImage(asset)
    setResult(null)
    setAnalyzing(true)
    try {
      const response = await aiService.analyzeImage(asset)
      if (response.success) {
        setResult(response.data)
        if (response.data?.damage_detected) {
          Toast.show({ type: 'success', text1: 'AI detected road damage' })
        } else {
          Toast.show({ type: 'info', text1: 'AI did not detect damage' })
        }
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'AI analysis failed') })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync()
      if (!perm.granted) {
        Toast.show({ type: 'error', text1: 'Camera permission required' })
        return
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      if (!result.canceled) analyzeImage(result.assets[0])
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to open camera' })
    }
  }

  const handlePickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Toast.show({ type: 'error', text1: 'Gallery permission required' })
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 })
      if (!result.canceled) analyzeImage(result.assets[0])
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to open gallery' })
    }
  }

  const handleClear = () => {
    setImage(null)
    setResult(null)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!image ? (
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Analyze a Road Image</Text>
            <Text style={styles.cardDesc}>
              Take a photo or pick one from your gallery to analyze road conditions using AI.
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleTakePhoto} activeOpacity={0.85}>
                <Camera size={24} color={COLORS.white} />
                <Text style={styles.actionLabel}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handlePickImage} activeOpacity={0.85}>
                <ImageIcon size={24} color={COLORS.primary} />
                <Text style={[styles.actionLabel, { color: COLORS.primary }]}>Pick from Gallery</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.card}>
            <View style={styles.imageHeader}>
              <Text style={styles.cardTitle}>Selected Image</Text>
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <Trash2 size={16} color={COLORS.muted} />
                <Text style={styles.clearLabel}>Clear</Text>
              </TouchableOpacity>
            </View>
            <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />
          </GlassCard>
        )}

        {analyzing && (
          <GlassCard style={styles.card}>
            <View style={styles.statusRow}>
              <Scan size={20} color={COLORS.primary} />
              <Text style={styles.statusText}>Analyzing image with AI...</Text>
            </View>
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 12 }} />
          </GlassCard>
        )}

        {result && !analyzing && (
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Analysis Result</Text>
            <View style={[styles.resultBox, result.damage_detected ? styles.resultDanger : styles.resultGood]}>
              {result.damage_detected ? (
                <XCircle size={24} color={COLORS.danger} />
              ) : (
                <CheckCircle2 size={24} color={COLORS.accent} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultTitle, { color: result.damage_detected ? COLORS.danger : COLORS.accentDark }]}>
                  {result.damage_detected ? 'Damage Detected' : 'No Damage Detected'}
                </Text>
                {result.damage_detected && result.detections?.length > 0 && (
                  <View style={{ marginTop: 8, gap: 6 }}>
                    {result.detections.map((d, i) => (
                      <View key={i} style={styles.detectionRow}>
                        <Text style={styles.detectionType}>{d.type.replace(/_/g, ' ')}</Text>
                        <Text style={styles.detectionConfidence}>
                          {(d.confidence * 100).toFixed(0)}% confidence
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </GlassCard>
        )}

        {!image && !analyzing && !result && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Scan size={64} color={COLORS.muted} />
            <Text style={styles.placeholderTitle}>AI-Powered Road Analysis</Text>
            <Text style={styles.placeholderDesc}>
              Upload a road image to detect potholes, cracks, and other damage automatically.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.secondary },
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  card: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: COLORS.secondary, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: COLORS.mutedText, lineHeight: 20, marginBottom: 20 },
  actions: { gap: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: RADIUS.xl, backgroundColor: COLORS.primary,
  },
  actionBtnSecondary: {
    backgroundColor: COLORS.primary + '10', borderWidth: 1.5, borderColor: COLORS.primary + '30',
  },
  actionLabel: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  imageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  clearLabel: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  preview: { width: '100%', height: 240, borderRadius: RADIUS.md, backgroundColor: COLORS.skeleton },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { fontSize: 15, fontWeight: '600', color: COLORS.mutedText },
  resultBox: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 4 },
  resultDanger: { backgroundColor: COLORS.danger + '08', borderColor: COLORS.danger + '30' },
  resultGood: { backgroundColor: COLORS.accent + '08', borderColor: COLORS.accent + '30' },
  resultTitle: { fontSize: 16, fontWeight: '800' },
  detectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detectionType: { fontSize: 13, fontWeight: '600', color: COLORS.secondary, textTransform: 'capitalize' },
  detectionConfidence: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  placeholderTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, textAlign: 'center', marginTop: 16 },
  placeholderDesc: { fontSize: 14, color: COLORS.mutedText, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 20 },
})
