import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { MapPin, Navigation, ChevronRight, FileText, TrendingUp, AlertTriangle, LogIn } from 'lucide-react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import { reportService } from '../../services/reportService'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const H_GUTTER = 24
const CARD_GAP = 12

export default function PublicHomeScreen() {
  const navigation = useNavigation()
  const [stats, setStats] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        reportService.getPublicStats().catch(() => ({})),
        reportService.getReports({ limit: 5 }).catch(() => ({ reports: [] })),
      ])
      setStats({
        total: statsRes?.stats?.totalReports ?? 0,
        pending: statsRes?.stats?.pending ?? 0,
        inProgress: statsRes?.stats?.inProgress ?? 0,
        resolved: statsRes?.stats?.resolved ?? 0,
      })
      setRecentReports(reportsRes?.reports || reportsRes?.data || [])
    } catch {
      if (!stats) setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 })
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(React.useCallback(() => { fetchData() }, []))

  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image source={require('../../../assets/logoSadakSewa.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.greeting}>SadakSewa</Text>
            </View>
            <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <LogIn size={18} color="#FFF" />
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.taglineSection}>
            <Text style={styles.tagline}>Report road issues in your community</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickCard, { width: (SCREEN_WIDTH - H_GUTTER * 2 - CARD_GAP) / 2 }]}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={GRADIENTS.warning} style={styles.quickGradient}>
              <MapPin size={24} color="#FFF" />
              <Text style={styles.quickLabel}>Browse Map</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickCard, { width: (SCREEN_WIDTH - H_GUTTER * 2 - CARD_GAP) / 2 }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={GRADIENTS.primary} style={styles.quickGradient}>
              <AlertTriangle size={24} color="#FFF" />
              <Text style={styles.quickLabel}>Report an Issue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.sectionOuter}>
          <Text style={styles.sectionTitle}>Community Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { key: 'total', label: 'Total Reports', color: COLORS.primary },
              { key: 'pending', label: 'Pending', color: COLORS.warning },
              { key: 'inProgress', label: 'In Progress', color: COLORS.secondary },
              { key: 'resolved', label: 'Resolved', color: COLORS.accent },
            ].map((item) => (
              <GlassCard key={item.key} style={{ width: (SCREEN_WIDTH - H_GUTTER * 2 - CARD_GAP) / 2, padding: 16 }}>
                <Text style={[styles.statValue, { color: item.color }]}>{stats?.[item.key] ?? 0}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </GlassCard>
            ))}
          </View>
        </View>

        <View style={styles.sectionOuter}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {recentReports.length === 0 ? (
            <GlassCard padding={24} style={{ alignItems: 'center' }}>
              <FileText size={28} color={COLORS.muted} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptyDesc}>Be the first to report an issue in your area</Text>
            </GlassCard>
          ) : (
            recentReports.map((item, i) => (
              <GlassCard
                key={item._id}
                padding={16}
                style={styles.reportCard}
                onPress={() => navigation.navigate('ReportDetails', { reportId: item._id })}
              >
                <View style={styles.reportRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.reportMeta} numberOfLines={1}>{[item.province, item.district, item.municipality].filter(Boolean).join(', ') || item.locationName || ''}</Text>
                  </View>
                  <StatusBadge status={item.status} size="sm" />
                </View>
              </GlassCard>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Map')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.ctaGradient}>
            <Navigation size={20} color="#FFF" />
            <Text style={styles.ctaText}>View All Reports on Map</Text>
            <ChevronRight size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  greeting: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  taglineSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  signInBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  signInText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: H_GUTTER, paddingTop: 16, gap: 16 },
  quickGrid: { flexDirection: 'row', gap: CARD_GAP },
  quickCard: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  quickGradient: { padding: 20, alignItems: 'center', gap: 10 },
  quickLabel: { fontSize: 13, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  sectionOuter: {},
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.secondary, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: COLORS.mutedText, marginTop: 4 },
  reportCard: { marginBottom: 8 },
  reportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reportTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  reportMeta: { fontSize: 12, color: COLORS.mutedText, marginTop: 2 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.secondary, marginTop: 8 },
  emptyDesc: { fontSize: 13, color: COLORS.mutedText, marginTop: 4, textAlign: 'center' },
  ctaBtn: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10,
  },
  ctaText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
})
