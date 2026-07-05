import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { User, LogIn, UserPlus, MapPin, Shield } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import GlassCard from '../../components/GlassCard'
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../constants'

export default function PublicProfileScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <User size={40} color="#FFF" />
            <Text style={styles.title}>Account</Text>
            <Text style={styles.subtitle}>Sign in to access all features</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        <GlassCard style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: COLORS.primary + '15' }]}>
              <LogIn size={20} color={COLORS.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Sign In</Text>
              <Text style={styles.rowDesc}>Access your reports and notifications</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: COLORS.accent + '15' }]}>
              <UserPlus size={20} color={COLORS.accentDark} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Create Account</Text>
              <Text style={styles.rowDesc}>Join your community and start reporting</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.featureTitle}>Why sign in?</Text>
          <View style={styles.featureRow}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.featureText}>Report road issues with photos</Text>
          </View>
          <View style={styles.featureRow}>
            <Shield size={16} color={COLORS.primary} />
            <Text style={styles.featureText}>Track the status of your reports</Text>
          </View>
          <View style={styles.featureRow}>
            <User size={16} color={COLORS.primary} />
            <Text style={styles.featureText}>Get notified when issues are resolved</Text>
          </View>
        </GlassCard>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  body: { flex: 1, padding: SPACING.section, gap: 16 },
  card: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  rowDesc: { fontSize: 12, color: COLORS.mutedText, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureText: { fontSize: 13, color: COLORS.mutedText, flex: 1 },
})
