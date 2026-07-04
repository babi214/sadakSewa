import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import { ChevronDown, ChevronRight, Mail, MapPin, Phone, Shield, Search, Users, CheckCircle2, XCircle } from 'lucide-react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Animated, { FadeInUp } from 'react-native-reanimated'
import GlassCard from '../../components/GlassCard'
import EnhancedHeader from '../../components/EnhancedHeader'
import { Input } from '../../components/Input'
import { SkeletonList } from '../../components/SkeletonLoader'
import { userService } from '../../services/userService'
import { COLORS, RADIUS } from '../../constants'

const ROLES = ['citizen', 'worker', 'admin']

export default function ManageUsersScreen({ navigation }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [updatingUser, setUpdatingUser] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      const res = await userService.getAllUsers(params)
      setUsers(res?.users || res?.data || [])
    } catch {
      if (!isRefresh) Toast.show({ type: 'error', text1: 'Failed to load users' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search])

  useFocusEffect(useCallback(() => { setLoading(true); fetchUsers() }, [search]))

  const onRefresh = () => { setRefreshing(true); fetchUsers(true) }

  const handleRoleChange = (userId, newRole) => {
    Alert.alert('Change Role', `Assign ${newRole} role to this user?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Change', onPress: async () => {
        setUpdatingUser(userId)
        try {
          await userService.updateUserRole(userId, newRole)
          Toast.show({ type: 'success', text1: 'Role updated' })
          fetchUsers()
        } catch {
          Toast.show({ type: 'error', text1: 'Failed to update role' })
        } finally { setUpdatingUser(null) }
      }},
    ])
  }

  const handleToggleActive = (userId, currentActive) => {
    const action = currentActive ? 'deactivate' : 'activate'
    Alert.alert(`${action.charAt(0).toUpperCase() + action.slice(1)} User`, `Are you sure you want to ${action} this user?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: action.charAt(0).toUpperCase() + action.slice(1), onPress: async () => {
        setUpdatingUser(userId)
        try {
          await userService.toggleUserActive(userId)
          Toast.show({ type: 'success', text1: `User ${action}d` })
          fetchUsers()
        } catch {
          Toast.show({ type: 'error', text1: `Failed to ${action} user` })
        } finally { setUpdatingUser(null) }
      }},
    ])
  }

  const renderItem = ({ item, index }) => {
    const isExpanded = expandedId === item._id
    const locationParts = [item.province, item.district, item.municipality].filter(Boolean)

    return (
    <Animated.View entering={FadeInUp.delay(index * 60).springify()}>
      <GlassCard style={styles.userCard}>
        <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item._id)} activeOpacity={0.7}>
          <View style={styles.userHeader}>
            <View style={[styles.avatar, { backgroundColor: item.isActive ? COLORS.primary + '20' : COLORS.muted + '20' }]}>
              <Text style={styles.avatarText}>{item.fullName?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.fullName}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <View style={styles.userMeta}>
                <Text style={styles.metaText}>{item.role}</Text>
                {item.phone && <Text style={styles.metaText}>· {item.phone}</Text>}
              </View>
            </View>
            <View style={styles.statusColumn}>
              <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.statusText, { color: item.isActive ? '#059669' : '#DC2626' }]}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              {isExpanded ? <ChevronDown size={16} color={COLORS.muted} /> : <ChevronRight size={16} color={COLORS.muted} />}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.userActions}>
          <View style={styles.roleRow}>
            <Shield size={14} color={COLORS.muted} />
            {ROLES.map(r => (
              <TouchableOpacity key={r}
                style={[styles.roleChip, item.role === r && styles.roleChipActive]}
                onPress={() => handleRoleChange(item._id, r)}
                disabled={updatingUser === item._id}>
                <Text style={[styles.roleChipText, item.role === r && { color: COLORS.primary }]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => handleToggleActive(item._id, item.isActive)}>
            {item.isActive ? <XCircle size={20} color={COLORS.danger} /> : <CheckCircle2 size={20} color={COLORS.accent} />}
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Mail size={14} color={COLORS.muted} />
              <Text style={styles.detailText}>{item.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Phone size={14} color={COLORS.muted} />
              <Text style={styles.detailText}>{item.phone || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color={COLORS.muted} />
              <Text style={styles.detailText}>{locationParts.length > 0 ? locationParts.join(', ') : 'Not provided'}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailMeta}>
              <Text style={styles.detailMetaText}>
                Email verified: {item.isVerified ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.detailMetaText}>
                Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </GlassCard>
    </Animated.View>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <EnhancedHeader title="Manage Users" subtitle={`${users.length} users`} onBack={() => navigation.goBack()} />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.muted} />
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email..."
            style={styles.searchInput}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.list}><SkeletonList count={4} /></View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={u => u._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Users size={48} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No users found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  searchRow: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, backgroundColor: 'transparent', borderWidth: 0, paddingLeft: 0 },
  list: { padding: 16, paddingTop: 4 },
  userCard: { marginBottom: 10 },
  userHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '600', color: COLORS.secondary },
  userEmail: { fontSize: 13, color: COLORS.mutedText, marginTop: 1 },
  userMeta: { flexDirection: 'row', gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, color: COLORS.muted, textTransform: 'capitalize' },
  statusColumn: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: '700' },
  userActions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
  },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  roleChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '0D' },
  roleChipText: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.mutedText, marginTop: 16 },

  detailSection: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4,
  },
  detailText: {
    fontSize: 13, color: COLORS.mutedText, flex: 1,
  },
  detailDivider: {
    height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 8,
  },
  detailMeta: {
    gap: 4,
  },
  detailMetaText: {
    fontSize: 12, color: COLORS.muted,
  },
})
