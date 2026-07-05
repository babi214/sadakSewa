import React, { useState, useContext, useCallback, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, FlatList, Dimensions, Modal, Share, Linking, TextInput } from 'react-native'
import { AlertCircle, ChevronLeft, MapPin, Calendar, User, ArrowUp, Share2, Activity, Flag, Edit3, Trash2, Clock, CheckCircle2, X, ChevronDown, ChevronUp, Camera } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, { Marker } from 'react-native-maps'
import Toast from 'react-native-toast-message'
import { useFocusEffect } from '@react-navigation/native'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import { SeverityBadge, CategoryBadge } from '../../components/Badge'
import SkeletonBlock from '../../components/SkeletonLoader'
import Button from '../../components/Button'
import { reportService } from '../../services/reportService'
import { AuthContext } from '../../context/AuthContext'
import { COLORS, RADIUS, SHADOWS, SPACING, STATUS_COLORS, STATUS_LABELS } from '../../constants'
import { formatDate, formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/validators'

const { width } = Dimensions.get('window')
const IMG_HEIGHT = 300

const actionIcons = {
  created: Flag,
  updated: Edit3,
  assigned: User,
  status_changed: Activity,
  deleted: Trash2,
}

const actionColors = {
  created: COLORS.primary,
  updated: COLORS.warning,
  assigned: '#8B5CF6',
  status_changed: COLORS.accent,
  deleted: COLORS.danger,
}

const getWorkerStatusOptions = (status) => {
  if (status === 'verified') return ['in_progress']
  if (status === 'in_progress') return ['resolved']
  return []
}

function ImageViewerModal({ visible, images, selectedIndex, onClose }) {
  const flatRef = useRef(null)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <X size={28} color={COLORS.white} />
        </TouchableOpacity>
        <FlatList
          ref={flatRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={selectedIndex || 0}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item }) => (
            <Image
              source={{ uri: typeof item === 'string' ? item : item?.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
          keyExtractor={(_, i) => String(i)}
        />
        <Text style={styles.modalCounter}>
          {(selectedIndex || 0) + 1} / {images.length}
        </Text>
      </View>
    </Modal>
  )
}

function TimelineItem({ item, index, isLast }) {
  const Icon = actionIcons[item.action] || Activity
  const color = actionColors[item.action] || COLORS.muted

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: color }]}>
          <Icon size={12} color={COLORS.white} />
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: COLORS.border }]} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineAction, { color }]}>
          {item.action.split('_').join(' ')}
        </Text>
        {item.details?.title && (
          <Text style={styles.timelineDetail}>{item.details.title}</Text>
        )}
        {item.details?.from && item.details?.to && (
          <Text style={styles.timelineDetail}>
            {STATUS_LABELS[item.details.from] || item.details.from} → {STATUS_LABELS[item.details.to] || item.details.to}
          </Text>
        )}
        {item.details?.workerName && (
          <Text style={styles.timelineDetail}>Assigned to {item.details.workerName}</Text>
        )}
        <View style={styles.timelineMeta}>
          <User size={10} color={COLORS.muted} />
          <Text style={styles.timelinePerson}>{item.performedBy?.fullName || 'System'}</Text>
          <Clock size={10} color={COLORS.muted} style={{ marginLeft: 8 }} />
          <Text style={styles.timelineTime}>{formatDateTime(item.createdAt)}</Text>
        </View>
      </View>
    </View>
  )
}

export default function ReportDetailsScreen({ route, navigation }) {
  const { user } = useContext(AuthContext)
  const { reportId } = route.params || {}
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [upvoting, setUpvoting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [workers, setWorkers] = useState([])
  const [updating, setUpdating] = useState(false)
  const [showAiSection, setShowAiSection] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [flagModalVisible, setFlagModalVisible] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedReject, setSelectedReject] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [flagCustom, setFlagCustom] = useState('')
  const [flagLoading, setFlagLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [reportRes, historyRes] = await Promise.all([
        reportService.getReportById(reportId),
        reportService.getReportHistory(reportId).catch(() => null),
      ])
      setReport(reportRes?.report || reportRes?.data || reportRes)
      setHistory(historyRes?.history || historyRes?.data || [])
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load report details' })
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useFocusEffect(useCallback(() => {
    if (reportId) {
      setLoading(true)
      fetchAll()
    }
  }, [reportId, fetchAll]))

  const handleUpvote = async () => {
    if (!user) return Toast.show({ type: 'info', text1: 'Sign in to upvote' })
    setUpvoting(true)
    try {
      const res = await reportService.upvoteReport(reportId)
      setReport(prev => ({
        ...prev,
        upvotes: res?.upvotes || prev.upvotes,
        upvoteCount: res?.upvoteCount ?? prev.upvoteCount,
      }))
      Toast.show({ type: 'success', text1: res?.message || 'Upvote updated!' })
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to upvote' })
    } finally {
      setUpvoting(false)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete Report', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await reportService.deleteReport(reportId)
            Toast.show({ type: 'success', text1: 'Report deleted' })
            navigation.goBack()
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete' })
          }
        },
      },
    ])
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this report on SadakSewa: ${report?.title}\n\n${report?.description || ''}`,
        title: report?.title || 'SadakSewa Report',
      })
    } catch {}
  }

  const handleStatusUpdate = async (newStatus, reason) => {
    setUpdating(true)
    try {
      await reportService.updateReportStatus(reportId, newStatus, reason || undefined)
      setShowStatusModal(false)
      setRejectionReason('')
      setSelectedReject(false)
      fetchAll()
      Toast.show({ type: 'success', text1: 'Status updated' })
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update status') })
    } finally {
      setUpdating(false)
    }
  }

  const handleAssign = async (workerId) => {
    setUpdating(true)
    try {
      await reportService.assignWorker(reportId, workerId)
      setShowAssignModal(false)
      fetchAll()
      Toast.show({ type: 'success', text1: 'Worker assigned' })
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to assign worker') })
    } finally {
      setUpdating(false)
    }
  }

  const loadWorkers = async () => {
    try {
      const res = await reportService.getAvailableWorkers(reportId)
      setWorkers(res?.workers || [])
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load workers' })
    }
  }

  const handleFlagReport = async () => {
    if (!flagReason) return
    setFlagLoading(true)
    try {
      const res = await reportService.flagReport(reportId, flagReason, flagCustom)
      if (res.success) {
        Toast.show({ type: 'success', text1: res.message })
        setFlagModalVisible(false)
        setFlagReason('')
        setFlagCustom('')
        fetchAll()
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to report') })
    } finally {
      setFlagLoading(false)
    }
  }

  const getCoords = () => {
    const coords = report?.location?.coordinates
    if (!coords || coords.length < 2) return null
    return { latitude: coords[1], longitude: coords[0] }
  }

  const openMap = () => {
    const coords = getCoords()
    if (!coords) return
    const { latitude, longitude } = coords
    const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`
    Linking.openURL(url).catch(() => {
      Toast.show({ type: 'info', text1: 'Map not available' })
    })
  }

  const isOwnerMobile = user && (user._id === report?.reportedBy?._id || user._id === report?.reportedBy)
  const canEdit = isOwnerMobile && report?.status === 'pending'
  const canDeleteMobile = isOwnerMobile && (report?.status === 'pending' || report?.status === 'rejected')
  const isAdmin = user?.role === 'admin'
  const statusOptions = isAdmin
    ? (report?.status === 'pending' ? ['verified', 'rejected'] : [])
    : (user?.role === 'worker' ? getWorkerStatusOptions(report?.status) : [])
  const canManageStatus = statusOptions.length > 0
  const canAssign = isAdmin && report?.status === 'verified'
  const images = report?.images || []
  const hasAiImage = report?.annotatedImage
  const statusColor = STATUS_COLORS[report?.status] || COLORS.muted
  const coords = getCoords()
  const locationLabel = report?.locationName || report?.location?.address || ''
  const upvoteCount = report?.upvoteCount ?? report?.upvotes?.length ?? 0
  const hasUpvoted = report?.upvotes?.some(uid => String(uid?._id || uid) === String(user?._id))
  const hasFlagged = report?.userFlags?.some(f => String(f.user?._id || f.user) === String(user?._id))

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems?.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0)
    }
  }, [])

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.skeletonContainer}>
          <SkeletonBlock width="100%" height={IMG_HEIGHT} borderRadius={0} />
          <View style={{ padding: SPACING.lg }}>
            <SkeletonBlock width={120} height={24} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="80%" height={28} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="100%" height={16} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="100%" height={16} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="60%" height={16} style={{ marginBottom: 24 }} />
            <SkeletonBlock width="100%" height={160} borderRadius={RADIUS.xl} />
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: COLORS.mutedText, fontSize: 16 }}>Report not found</Text>
          <Button variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageSection}>
            {images.length > 0 ? (
              <>
                <FlatList
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={1} onPress={() => setSelectedImage(currentImageIndex)}>
                      <Image
                        source={{ uri: typeof item === 'string' ? item : item?.url }}
                        style={styles.heroImage}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(_, i) => String(i)}
                />
                {images.length > 1 && (
                  <View style={styles.imageDots}>
                    {images.map((_, i) => (
                      <View key={i} style={[styles.dot, i === currentImageIndex && styles.dotActive]} />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noImage}>
                <Camera size={48} color={COLORS.muted} />
                <Text style={styles.noImageText}>No images</Text>
              </View>
            )}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            {report?.status && (
              <View style={[styles.statusOverlay, { backgroundColor: statusColor }]}>
                <Text style={styles.statusOverlayText}>
                  {STATUS_LABELS[report.status] || report.status}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.badgesRow}>
              <StatusBadge status={report.status} size="md" />
              {report.severity && <SeverityBadge severity={report.severity} />}
              {report.category && <CategoryBadge category={report.category} />}
            </View>

            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.desc}>{report.description}</Text>

            {hasAiImage && (
              <GlassCard style={styles.aiSection}>
                <TouchableOpacity
                  style={styles.aiHeader}
                  onPress={() => setShowAiSection(!showAiSection)}
                  activeOpacity={0.7}
                >
                  <View style={styles.aiHeaderLeft}>
                    <View style={[styles.aiIconWrap, { backgroundColor: COLORS.primary + '15' }]}>
                      <Camera size={16} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.aiTitle}>AI Analysis</Text>
                      <Text style={styles.aiSubtitle}>
                        {report.aiAnalysis?.detectedIssue ? `Detected ${report.aiAnalysis.detectedIssue}` : 'Tap to view'}
                      </Text>
                    </View>
                  </View>
                  {showAiSection ? (
                    <ChevronUp size={20} color={COLORS.muted} />
                  ) : (
                    <ChevronDown size={20} color={COLORS.muted} />
                  )}
                </TouchableOpacity>
                {showAiSection && (
                  <View style={styles.aiBody}>
                    <Image
                      source={{ uri: hasAiImage }}
                      style={styles.aiImage}
                      resizeMode="contain"
                    />
                    {report.aiAnalysis?.confidence && (
                      <View style={styles.aiConfidence}>
                        <Text style={styles.aiConfidenceText}>
                          Confidence: {Math.round(report.aiAnalysis.confidence * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </GlassCard>
            )}

            {coords && (
              <GlassCard style={styles.mapCard}>
                <View style={styles.mapHeader}>
                  <MapPin size={16} color={COLORS.danger} />
                  <Text style={styles.mapTitle}>Location</Text>
                </View>
                <TouchableOpacity onPress={openMap} activeOpacity={0.9}>
                  <MapView
                    style={styles.mapPreview}
                    region={{
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker coordinate={coords} />
                  </MapView>
                </TouchableOpacity>
                {!!locationLabel && (
                  <Text style={styles.mapAddress}>{locationLabel}</Text>
                )}
              </GlassCard>
            )}

            <GlassCard style={styles.metaCard}>
              <Text style={styles.metaSectionTitle}>Report Details</Text>
              <View style={styles.metaRow}>
                <Calendar size={16} color={COLORS.muted} />
                <Text style={styles.metaLabel}>Submitted</Text>
                <Text style={styles.metaValue}>{formatDateTime(report.createdAt)}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaRow}>
                <User size={16} color={COLORS.muted} />
                <Text style={styles.metaLabel}>Reported by</Text>
                <Text style={styles.metaValue}>{report.reportedBy?.fullName || 'Anonymous'}</Text>
              </View>
              {report.rejectionReason && report.status === 'rejected' && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaRow}>
                    <AlertCircle size={16} color={COLORS.danger} />
                    <Text style={[styles.metaLabel, { color: COLORS.danger }]}>Rejected</Text>
                    <Text style={[styles.metaValue, { color: COLORS.danger }]}>{report.rejectionReason}</Text>
                  </View>
                </>
              )}
              {report.assignedWorker && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaRow}>
                    <User size={16} color={COLORS.muted} />
                    <Text style={styles.metaLabel}>Assigned to</Text>
                    <Text style={styles.metaValue}>{report.assignedWorker?.fullName || 'Worker'}</Text>
                  </View>
                </>
              )}
              {report.resolvedAt && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaRow}>
                    <CheckCircle2 size={16} color={COLORS.accent} />
                    <Text style={styles.metaLabel}>Resolved</Text>
                    <Text style={styles.metaValue}>{formatDate(report.resolvedAt)}</Text>
                  </View>
                </>
              )}
              {report.upvotes !== undefined && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaRow}>
                    <ArrowUp size={16} color={COLORS.muted} />
                    <Text style={styles.metaLabel}>Upvotes</Text>
                    <Text style={styles.metaValue}>{upvoteCount}</Text>
                  </View>
                </>
              )}
            </GlassCard>

            {!hasUpvoted && (
              <Button
                variant="outline"
                onPress={handleUpvote}
                loading={upvoting}
                style={styles.upvoteBtn}
              >
                <ArrowUp size={18} color={COLORS.primary} /> Upvote ({upvoteCount})
              </Button>
            )}

            {user && !isOwnerMobile && !hasFlagged && user?.role !== 'admin' && (
              <Button
                variant="danger"
                outline
                onPress={() => setFlagModalVisible(true)}
                style={styles.flagBtn}
              >
                <Flag size={16} color={COLORS.danger} /> Report this issue
              </Button>
            )}

            {user && hasFlagged && user?.role !== 'admin' && (
              <View style={styles.flaggedBadge}>
                <Flag size={14} color={COLORS.danger} />
                <Text style={styles.flaggedText}>You reported this issue</Text>
              </View>
            )}

            {(canManageStatus || canAssign) && (
              <View style={styles.manageRow}>
                {canManageStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowStatusModal(true)}
                    style={{ flex: 1 }}
                  >
                    <Activity size={16} color={COLORS.primary} /> {isAdmin ? 'Review' : 'Update Status'}
                  </Button>
                )}
                {canAssign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => { loadWorkers(); setShowAssignModal(true) }}
                    style={{ flex: 1 }}
                  >
                    <User size={16} color={COLORS.primary} /> Assign Worker
                  </Button>
                )}
              </View>
            )}

            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('EditReport', { reportId })}
                style={{ flex: 1, marginTop: SPACING.md }}
              >
                <Edit3 size={16} color={COLORS.muted} /> Edit
              </Button>
            )}
            {canDeleteMobile && (
              <Button
                variant="danger"
                size="sm"
                onPress={handleDelete}
                style={{ flex: 1, marginTop: SPACING.md }}
              >
                <Trash2 size={16} color={COLORS.white} /> Delete
              </Button>
            )}

            {history.length > 0 && (
              <View style={styles.timelineSection}>
                <Text style={styles.sectionTitle}>Activity Timeline</Text>
                {history.map((h, i) => (
                  <TimelineItem
                    key={h._id || i}
                    item={h}
                    index={i}
                    isLast={i === history.length - 1}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 32 }} />
          </View>
        </ScrollView>

        {hasUpvoted && (
          <View style={styles.bottomBar}>
            <View style={styles.bottomUpvote}>
              <ArrowUp size={18} color={COLORS.primary} />
              <Text style={styles.bottomUpvoteText}>{upvoteCount}</Text>
            </View>
            <TouchableOpacity onPress={handleShare} style={styles.bottomShare}>
              <Share2 size={18} color={COLORS.muted} />
              <Text style={styles.bottomShareText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}

        <ImageViewerModal
          visible={selectedImage !== null}
          images={images}
          selectedIndex={selectedImage}
          onClose={() => setSelectedImage(null)}
        />

        <Modal visible={showStatusModal} transparent animationType="slide" onRequestClose={() => { setShowStatusModal(false); setRejectionReason(''); setSelectedReject(false) }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalSheetHeader}>
                <Text style={styles.modalTitle}>
                  {selectedReject ? 'Rejection Reason' : 'Update Status'}
                </Text>
                <TouchableOpacity onPress={() => { setShowStatusModal(false); setRejectionReason(''); setSelectedReject(false) }}>
                  <X size={22} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
              {selectedReject ? (
                <View>
                  <Text style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 12 }}>
                    Explain why this report is being rejected
                  </Text>
                  <TextInput
                    placeholder="Reason for rejection..."
                    placeholderTextColor={COLORS.muted}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    style={styles.rejectionInput}
                    multiline
                    maxLength={500}
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                    <Button
                      variant="outline"
                      style={{ flex: 1 }}
                      onPress={() => { setSelectedReject(false); setRejectionReason('') }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="danger"
                      style={{ flex: 1 }}
                      onPress={() => handleStatusUpdate('rejected', rejectionReason)}
                      loading={updating}
                      disabled={!rejectionReason.trim()}
                    >
                      Reject
                    </Button>
                  </View>
                </View>
              ) : (
                <ScrollView>
                  {statusOptions.map(s => {
                    const active = s === report.status
                    const c = STATUS_COLORS[s] || COLORS.muted
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.modalOption, active && { backgroundColor: c + '10' }]}
                        onPress={() => {
                          if (s === 'rejected') {
                            setSelectedReject(true)
                          } else {
                            handleStatusUpdate(s)
                          }
                        }}
                        disabled={active || updating}
                      >
                        <View style={[styles.modalOptionDot, { backgroundColor: c }]} />
                        <Text style={[styles.modalOptionText, active && { color: c, fontWeight: '700' }]}>
                          {STATUS_LABELS[s] || s.split('_').join(' ')}
                        </Text>
                        {active && <CheckCircle2 size={18} color={c} />}
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <Modal visible={showAssignModal} transparent animationType="slide" onRequestClose={() => setShowAssignModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalSheetHeader}>
                <Text style={styles.modalTitle}>Assign Worker</Text>
                <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                  <X size={22} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
              {workers.length === 0 ? (
                <Text style={styles.noWorkers}>No available workers in this district/municipality</Text>
              ) : (
                <ScrollView style={{ maxHeight: 360 }}>
                  {workers.map(w => (
                    <TouchableOpacity
                      key={w._id}
                      style={styles.workerRow}
                      onPress={() => handleAssign(w._id)}
                      disabled={updating}
                    >
                      <View style={styles.workerAvatar}>
                        {w.profilePicture ? (
                          <Image source={{ uri: w.profilePicture }} style={styles.workerAvatarImg} />
                        ) : (
                          <Text style={styles.workerAvatarText}>
                            {w.fullName?.charAt(0)?.toUpperCase() || 'W'}
                          </Text>
                        )}
                      </View>
                      <View style={styles.workerInfo}>
                        <Text style={styles.workerName}>{w.fullName}</Text>
                        <Text style={styles.workerEmail}>{w.email}</Text>
                        {w.district && (
                          <Text style={styles.workerLocation}>{w.district}{w.municipality ? ` / ${w.municipality}` : ''}</Text>
                        )}
                      </View>
                      <ChevronLeft size={18} color={COLORS.muted} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
        <Modal visible={flagModalVisible} transparent animationType="slide" onRequestClose={() => setFlagModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalSheetHeader}>
                <Text style={styles.modalTitle}>Report this issue</Text>
                <TouchableOpacity onPress={() => { setFlagModalVisible(false); setFlagReason(''); setFlagCustom('') }}>
                  <X size={22} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 16 }}>
                Why are you reporting this report?
              </Text>
              <ScrollView>
                {['fake', 'duplicate', 'inappropriate', 'wrong_location', 'other'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.modalOption, flagReason === r && { backgroundColor: COLORS.danger + '10' }]}
                    onPress={() => setFlagReason(r)}
                  >
                    <View style={[styles.radioOuter, flagReason === r && { borderColor: COLORS.danger }]}>
                      {flagReason === r && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.modalOptionText, flagReason === r && { color: COLORS.danger }]}>
                      {r.split('_').join(' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
                {flagReason === 'other' && (
                  <TextInput
                    placeholder="Describe the issue..."
                    placeholderTextColor={COLORS.muted}
                    value={flagCustom}
                    onChangeText={setFlagCustom}
                    style={styles.flagInput}
                  />
                )}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => { setFlagModalVisible(false); setFlagReason(''); setFlagCustom('') }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  style={{ flex: 1 }}
                  onPress={handleFlagReport}
                  loading={flagLoading}
                  disabled={!flagReason}
                >
                  Submit
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  imageSection: {
    position: 'relative',
  },
  heroImage: {
    width,
    height: IMG_HEIGHT,
    backgroundColor: COLORS.skeleton,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.white,
  },
  noImage: {
    height: IMG_HEIGHT,
    backgroundColor: COLORS.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
  },
  statusOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  statusOverlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  shareBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },

  body: {
    padding: SPACING.lg,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.secondary,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 15,
    color: COLORS.mutedText,
    lineHeight: 22,
    marginTop: 12,
  },

  aiSection: {
    marginTop: SPACING.lg,
    padding: 16,
    overflow: 'hidden',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  aiSubtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
    marginTop: 1,
  },
  aiBody: {
    marginTop: 16,
  },
  aiImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.skeleton,
  },
  aiConfidence: {
    marginTop: 8,
    alignItems: 'center',
  },
  aiConfidenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  mapCard: {
    marginTop: SPACING.lg,
    padding: 16,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  mapPreview: {
    width: '100%',
    height: 140,
    borderRadius: RADIUS.md,
  },
  mapAddress: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 10,
  },

  metaCard: {
    marginTop: SPACING.lg,
    padding: 16,
  },
  metaSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  metaLabel: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '500',
    width: 90,
  },
  metaValue: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
    flex: 1,
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.border + '60',
  },

  upvoteBtn: {
    marginTop: SPACING.lg,
  },
  manageRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
  },

  timelineSection: {
    marginTop: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 36,
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 28,
    width: 2,
    flex: 1,
    bottom: -20,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 2,
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timelineDetail: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 3,
  },
  timelinePerson: {
    fontSize: 11,
    color: COLORS.muted,
  },
  timelineTime: {
    fontSize: 11,
    color: COLORS.muted,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.md,
  },
  bottomUpvote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomUpvoteText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomShare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
  },
  bottomShareText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width,
    height: 400,
  },
  modalCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    width: width - 32,
    maxHeight: 500,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: 4,
    gap: 12,
  },
  modalOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalOptionText: {
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: '500',
    flex: 1,
    textTransform: 'capitalize',
  },
  noWorkers: {
    textAlign: 'center',
    color: COLORS.mutedText,
    paddingVertical: 24,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
    gap: 12,
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  workerAvatarImg: {
    width: 40,
    height: 40,
  },
  workerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  workerEmail: {
    fontSize: 12,
    color: COLORS.mutedText,
    marginTop: 1,
  },
  workerLocation: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  flagBtn: {
    marginTop: SPACING.lg,
  },
  flaggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.danger + '10',
  },
  flaggedText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '500',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
  },
  flagInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 8,
  },
  rejectionInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 14,
    color: COLORS.secondary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
})
