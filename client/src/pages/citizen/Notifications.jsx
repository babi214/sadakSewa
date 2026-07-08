import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  AlertTriangle,
  ArrowRight,
  Activity,
  CheckCheck,
  Clock,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card, { CardHeader } from '../../components/common/Card'
import { Skeleton } from '../../components/common/Skeleton'
import { notificationService } from '../../services/notificationService'
import { formatDateTime } from '../../utils/formatters'

const iconMap = {
  report_update: AlertTriangle,
  assignment: ArrowRight,
  status_change: Activity,
}

const iconStyles = {
  report_update: 'bg-amber-100 text-amber-700',
  assignment: 'bg-purple-100 text-purple-700',
  status_change: 'bg-accent/10 text-accent',
}

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return formatDateTime(dateString)
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications()
      setNotifications(res?.notifications || res?.data || [])
      setUnreadCount(res?.unreadCount ?? 0)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id, reportId) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
    if (reportId) navigate(`/reports/${reportId}`)
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
      const removed = notifications.find(n => n._id === id)
      if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1))
      toast.success('Notification deleted')
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-secondary">Notifications</h1>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-secondary">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck strokeWidth={1.5} className="mr-1.5 h-4 w-4" />
            Mark All Read
          </Button>
        )}
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={async () => {
            if (!window.confirm('Delete all notifications? This cannot be undone.')) return
            try {
              await notificationService.deleteAllNotifications()
              setNotifications([])
              setUnreadCount(0)
              toast.success('All notifications deleted')
            } catch {
              toast.error('Failed to delete notifications')
            }
          }}>
            <Trash2 strokeWidth={1.5} className="mr-1.5 h-4 w-4" />
            Delete All
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-16">
            <Bell className="mb-4 h-12 w-12 text-muted" />
            <p className="text-lg font-medium text-secondary">No notifications yet</p>
            <p className="mt-1 text-sm text-muted">
              You'll see updates about your reports here
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const type = item.type || 'bell'
            const Icon = iconMap[type] || Bell
            const style = iconStyles[type] || 'bg-secondary/5 text-muted'
            const unread = !item.isRead

            return (
              <div
                key={item._id}
                onClick={() => handleMarkAsRead(item._id, item.report)}
                className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${
                  unread
                    ? 'border-primary/20 bg-primary/[0.03]'
                    : 'border-border bg-white'
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${unread ? 'font-semibold text-secondary' : 'font-medium text-secondary/80'}`}>
                      {item.title || 'Notification'}
                    </p>
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted line-clamp-2">
                    {item.message || item.body || ''}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  className="shrink-0 self-start rounded-lg p-1.5 text-muted opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                  title="Delete notification"
                >
                  <Trash2 strokeWidth={1.5} className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
