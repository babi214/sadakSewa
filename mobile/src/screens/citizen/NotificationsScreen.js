import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Bell, AlertTriangle, ArrowRight, Activity, Clock, CheckCheck } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { notificationService } from '../../services/notificationService'
import GlassCard from '../../components/GlassCard'
import { SkeletonList } from '../../components/SkeletonLoader'
import EmptyState from '../../components/EmptyState'
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants'

const iconMap = {
  bell: Bell,
  report_update: AlertTriangle,
  assignment: ArrowRight,
  status_change: Activity,
}

const iconBgMap = {
  bell: COLORS.primary + '15',
  report_update: COLORS.warning + '15',
  assignment: '#8B5CF615',
  status_change: COLORS.accent + '15',
}

const iconColorMap = {
  bell: COLORS.primary,
  report_update: COLORS.warning,
  assignment: '#8B5CF6',
  status_change: COLORS.accent,
}

function timeAgo(dateString) {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  const d = new Date(dateString)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications()
      const list = res?.notifications || res?.data || []
      setNotifications(list)
      setUnreadCount(res?.unreadCount || list.filter(n => !n.read).length)
    } catch {
      // silent
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    setLoading(true)
    fetchNotifications()
  }, [fetchNotifications]))

  const onRefresh = () => {
    setRefreshing(true)
    fetchNotifications()
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const handleDelete = (id) => {
    Alert.alert('Delete Notification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await notificationService.deleteNotification(id)
            setNotifications(prev => prev.filter(n => n._id !== id))
            const wasUnread = notifications.find(n => n._id === id)?.read === false
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
          } catch {}
        },
      },
    ])
  }

  const handlePress = (item) => {
    if (!item.read) handleMarkAsRead(item._id)
    if (item.data?.reportId) {
      navigation.navigate('ReportDetails', { reportId: item.data.reportId })
    }
  }

  const renderItem = ({ item, index }) => {
    const type = item.type || 'bell'
    const Icon = iconMap[type] || Bell
    const bg = iconBgMap[type] || iconBgMap.bell
    const color = iconColorMap[type] || iconColorMap.bell

    return (
      <GlassCard index={index} style={[styles.notifCard, !item.read && styles.notifUnread]}>
        <TouchableOpacity
          onPress={() => handlePress(item)}
          onLongPress={() => handleDelete(item._id)}
          activeOpacity={0.85}
          style={styles.notifTouch}
        >
          <View style={styles.notifRow}>
            <View style={[styles.iconWrap, { backgroundColor: bg }]}>
              <Icon size={20} color={color} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]} numberOfLines={1}>
                  {item.title || 'Notification'}
                </Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifMessage} numberOfLines={2}>
                {item.message || item.body || ''}
              </Text>
              <View style={styles.notifFooter}>
                <Clock size={12} color={COLORS.muted} />
                <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </GlassCard>
    )
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Bell size={20} color={COLORS.secondary} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
          <CheckCheck size={16} color={COLORS.primary} />
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Bell size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.listContainer}>
          <SkeletonList count={5} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            message="You'll see updates about your reports here"
            style={styles.empty}
          />
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: 32,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  badge: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.full,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  notifCard: {
    marginBottom: 10,
    padding: 0,
  },
  notifTouch: {
    flexDirection: 'row',
    padding: 16,
  },
  notifUnread: {
    backgroundColor: 'rgba(37,99,235,0.04)',
    borderColor: 'rgba(37,99,235,0.15)',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    flex: 1,
  },
  notifTitleBold: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notifMessage: {
    fontSize: 13,
    color: COLORS.mutedText,
    lineHeight: 18,
    marginTop: 2,
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.muted,
  },
  empty: {
    paddingTop: 80,
  },
})
