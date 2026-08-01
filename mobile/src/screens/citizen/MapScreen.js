import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl,
  Modal, Dimensions, Platform, TextInput, ScrollView, Image, Keyboard,
} from 'react-native'
import MapView, { Marker, Callout, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import {
  Search, Crosshair, Plus, List, Layers, Filter, Navigation,
  MapPin, X, SlidersHorizontal, AlertTriangle, Trash2,
  Droplets, Lightbulb, TrafficCone, Zap, HelpCircle,
} from 'lucide-react-native'
import * as Location from 'expo-location'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'

import {
  COLORS, GRADIENTS, RADIUS, SHADOWS, DEFAULT_MAP_REGION,
  STATUS_COLORS, REPORT_CATEGORIES, STATUS_LABELS,
} from '../../constants'
import { reportService } from '../../services/reportService'
import GlassCard from '../../components/GlassCard'
import StatusBadge from '../../components/StatusBadge'
import FloatingActionButton from '../../components/FloatingActionButton'
import EnhancedHeader from '../../components/EnhancedHeader'
import { Skeleton } from '../../components/SkeletonLoader'

const { width, height } = Dimensions.get('window')

const MARKER_COLORS = {
  pending: '#EF4444',
  verified: '#F59E0B',
  in_progress: '#3B82F6',
  resolved: '#10B981',
  rejected: '#6B7280',
}

const categoryIconMap = {
  pothole: AlertTriangle,
  garbage: Trash2,
  drainage: Droplets,
  streetlight: Lightbulb,
  traffic_signal: TrafficCone,
  road_damage: AlertTriangle,
  water_leak: Droplets,
  electric_pole: Zap,
  other: HelpCircle,
}

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState('map')
  const [selectedReport, setSelectedReport] = useState(null)
  const [region, setRegion] = useState(DEFAULT_MAP_REGION)
  const [userLocation, setUserLocation] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sheetVisible, setSheetVisible] = useState(false)
  const [nearMeOnly, setNearMeOnly] = useState(false)
  const [routeCoords, setRouteCoords] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)

  useFocusEffect(useCallback(() => {
    fetchReports()
  }, [nearMeOnly]))

  const route = useRoute()
  const [initialRegion] = useState(DEFAULT_MAP_REGION)

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          const { latitude, longitude } = loc.coords
          setUserLocation({ latitude, longitude })
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    const dest = route.params?.destination
    if (!dest) return
    setRouteCoords(null)
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        mapRef.current?.animateToRegion(
          { latitude: dest.latitude, longitude: dest.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          500
        )
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const origin = `${loc.coords.longitude},${loc.coords.latitude}`
      const destination = `${dest.longitude},${dest.latitude}`
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?geometries=geojson&overview=full`
        )
        const data = await res.json()
        if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
          const coords = data.routes[0].geometry.coordinates.map(c => ({
            latitude: c[1],
            longitude: c[0],
          }))
          setRouteCoords(coords)
          mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 80, right: 40, bottom: 80, left: 40 }, animated: true })
          return
        }
      } catch {}
      mapRef.current?.animateToRegion(
        { latitude: dest.latitude, longitude: dest.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        500
      )
    })()
  }, [route.params?.destination])

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const { latitude, longitude } = loc.coords
      setUserLocation({ latitude, longitude })
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
      setRegion(newRegion)
      mapRef.current?.animateToRegion(newRegion, 500)
    } catch {}
  }

  const fetchReports = async () => {
    try {
      let res
      if (nearMeOnly) {
        const params = { distance: 10000 }
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          const { latitude, longitude } = loc.coords
          params.latitude = latitude
          params.longitude = longitude
          setUserLocation({ latitude, longitude })
          setRegion(prev => ({ ...prev, latitude, longitude }))
        }
        res = await reportService.getNearbyReports(params)
      } else {
        res = await reportService.getReports({ limit: 100 })
      }

      const list = res?.reports || res?.data || []
      setReports(list)
    } catch {
      if (!refreshing) Toast.show({ type: 'error', text1: 'Failed to load reports' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchReports()
  }

  const focusLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Toast.show({ type: 'info', text1: 'Location permission denied' })
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
      setRegion(newRegion)
      mapRef.current?.animateToRegion(newRegion, 500)
    } catch {
      Toast.show({ type: 'info', text1: 'Could not get your location' })
    }
  }

  const markers = useMemo(() => {
    return reports
      .filter(r => r.location?.coordinates?.length === 2)
      .map(r => ({
        id: r._id,
        coordinate: {
          latitude: r.location.coordinates[1],
          longitude: r.location.coordinates[0],
        },
        title: r.title,
        description: r.description,
        status: r.status,
        category: r.category,
        address: r.locationName || r.location?.address,
        distance: r.distance,
        images: r.images,
        color: MARKER_COLORS[r.status] || MARKER_COLORS.pending,
      }))
  }, [reports])

  const filteredReports = useMemo(() => {
    let list = reports
    if (selectedStatuses.length > 0) {
      list = list.filter(r => selectedStatuses.includes(r.status))
    }
    if (selectedCategories.length > 0) {
      list = list.filter(r => selectedCategories.includes(r.category))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.locationName?.toLowerCase().includes(q) ||
        r.location?.address?.toLowerCase().includes(q)
      )
    }
    return list
  }, [reports, selectedStatuses, selectedCategories, searchQuery])

  const filteredMarkers = useMemo(() => {
    const filteredIds = new Set(filteredReports.map(r => r._id))
    return markers.filter(m => filteredIds.has(m.id))
  }, [markers, filteredReports])

  const handleMarkerPress = (marker) => {
    setSelectedReport(marker)
    setSheetVisible(true)
  }

  const handleCloseSheet = () => {
    setSheetVisible(false)
    setSelectedReport(null)
  }

  const handleMapPress = () => {
    if (sheetVisible) handleCloseSheet()
    Keyboard.dismiss()
  }

  const toggleStatus = (status) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const resetFilters = () => {
    setSelectedStatuses([])
    setSelectedCategories([])
    setNearMeOnly(false)
  }

  const activeFilterCount = selectedStatuses.length + selectedCategories.length + (nearMeOnly ? 1 : 0)

  const navigateToReport = (reportId) => {
    navigation.navigate('ReportDetails', { reportId })
  }

  const navigateToCreate = () => {
    navigation.navigate('Report')
  }

  const fetchRoute = async (dest) => {
    if (!dest) return
    setRouteLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') { Toast.show({ type: 'info', text1: 'Location permission needed' }); setRouteLoading(false); return }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const origin = `${loc.coords.longitude},${loc.coords.latitude}`
      const destination = `${dest.longitude},${dest.latitude}`
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin};${destination}?geometries=geojson&overview=full`)
      const data = await res.json()
      if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
        const coords = data.routes[0].geometry.coordinates.map(c => ({ latitude: c[1], longitude: c[0] }))
        setRouteCoords(coords)
        setSheetVisible(false)
      } else {
        Toast.show({ type: 'info', text1: 'Could not find a route' })
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to get route' })
    } finally {
      setRouteLoading(false)
    }
  }

  const MarkerPin = ({ color }) => (
    <View style={styles.markerWrap}>
      <View style={[styles.markerOuter, { backgroundColor: color }]}>
        <TrafficCone size={24} color={COLORS.white} strokeWidth={2.5} />
      </View>
      <View style={[styles.markerTail, { borderTopColor: color }]} />
    </View>
  )

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonOverlay} pointerEvents="none">
      <SafeAreaView edges={['top']} style={styles.skeletonSafeTop} />
      <View style={styles.skeletonContainer}>
        {[1, 2, 3].map(i => (
          <Animated.View key={i} entering={FadeInUp.delay(i * 120).springify()}>
            <View style={styles.skeletonCard}>
              <Skeleton width={60} height={60} borderRadius={RADIUS.md} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="65%" height={14} borderRadius={RADIUS.sm} />
                <Skeleton width="90%" height={10} borderRadius={RADIUS.sm} />
                <Skeleton width="45%" height={10} borderRadius={RADIUS.sm} />
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  )

  const renderFilterSheet = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilters(false)}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <Animated.View entering={FadeInUp.springify()}>
            <LinearGradient
              colors={[COLORS.surface, COLORS.background]}
              style={styles.filterSheet}
            >
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filters</Text>
                <TouchableOpacity
                  style={styles.filterCloseBtn}
                  onPress={() => setShowFilters(false)}
                >
                  <X size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterScrollContent}
              >
                <Text style={styles.filterSectionTitle}>Scope</Text>
                <TouchableOpacity
                  style={[styles.nearMeToggle, nearMeOnly && styles.nearMeToggleActive]}
                  onPress={() => setNearMeOnly(prev => !prev)}
                  activeOpacity={0.75}
                >
                  <Crosshair size={16} color={nearMeOnly ? COLORS.white : COLORS.secondary} />
                  <Text style={[styles.nearMeToggleText, nearMeOnly && { color: COLORS.white }]}>Near me only</Text>
                </TouchableOpacity>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.chipRow}>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => {
                    const isActive = selectedStatuses.includes(key)
                    const chipColor = MARKER_COLORS[key] || COLORS.muted
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.chip,
                          isActive && {
                            backgroundColor: chipColor + '18',
                            borderColor: chipColor,
                          },
                        ]}
                        onPress={() => toggleStatus(key)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.chipDot, { backgroundColor: chipColor }]} />
                        <Text style={[
                          styles.chipText,
                          isActive && { color: chipColor, fontWeight: '700' },
                        ]}>{label}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>

                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.chipRow}>
                  {REPORT_CATEGORIES.map(cat => {
                    const isActive = selectedCategories.includes(cat.value)
                    return (
                      <TouchableOpacity
                        key={cat.value}
                        style={[
                          styles.chip,
                          isActive && {
                            backgroundColor: COLORS.primary + '18',
                            borderColor: COLORS.primary,
                          },
                        ]}
                        onPress={() => toggleCategory(cat.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.chipText,
                          isActive && { color: COLORS.primary, fontWeight: '700' },
                        ]}>{cat.label}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </ScrollView>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={resetFilters}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => setShowFilters(false)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.applyGradient}
                  >
                    <Text style={styles.applyBtnText}>
                      Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )

  const renderBottomSheet = () => {
    if (!selectedReport || !sheetVisible) return null
    const r = selectedReport
    return (
      <Animated.View
        entering={FadeInUp.springify()}
        style={styles.bottomSheet}
      >
        <GlassCard padding={20} style={styles.bottomSheetCard}>
          <TouchableOpacity
            style={styles.sheetHandle}
            onPress={handleCloseSheet}
            hitSlop={{ top: 10, bottom: 10, left: 50, right: 50 }}
          >
            <View style={styles.sheetHandleBar} />
          </TouchableOpacity>

          <View style={styles.sheetTop}>
            <StatusBadge status={r.status} size="sm" />
            {r.category && (
              <View style={styles.sheetCategory}>
                <MapPin size={12} color={COLORS.mutedText} />
                <Text style={styles.sheetCategoryText}>
                  {r.category.replace(/_/g, ' ')}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sheetTitle} numberOfLines={2}>{r.title}</Text>

          {r.address && (
            <View style={styles.sheetAddress}>
              <MapPin size={13} color={COLORS.mutedText} />
              <Text style={styles.sheetAddressText} numberOfLines={1}>{r.address}</Text>
            </View>
          )}

          {r.description && (
            <Text style={styles.sheetDesc} numberOfLines={2}>{r.description}</Text>
          )}

          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.sheetBtn}
              onPress={() => navigateToReport(r.id)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.sheetBtnGrad}>
                <Text style={styles.sheetBtnText}>View Details</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetNavBtn} onPress={() => fetchRoute(r.coordinate)} activeOpacity={0.7}>
              <Navigation size={16} color={COLORS.primary} />
              <Text style={styles.sheetNavText}>{routeLoading ? 'Loading...' : 'Navigate'}</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>
    )
  }

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MapPin size={40} color={COLORS.muted} />
      </View>
      <Text style={styles.emptyTitle}>No reports found</Text>
      <Text style={styles.emptyDesc}>
        {activeFilterCount > 0
          ? 'Try adjusting your filters to see more results'
          : nearMeOnly ? 'There are no reports nearby your current location' : 'There are no reports to show yet'}
      </Text>
    </Animated.View>
  )

  const renderListItem = ({ item, index }) => {
    const thumbnail = item.images?.length > 0
      ? { uri: typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url }
      : null

    return (
      <Animated.View entering={FadeInUp.delay(index * 60).springify()}>
        <TouchableOpacity
          style={styles.listCard}
          onPress={() => navigateToReport(item._id)}
          activeOpacity={0.7}
        >
          {thumbnail ? (
            <Image source={thumbnail} style={styles.listCardThumb} />
          ) : (
            <View style={[styles.listCardThumb, styles.listCardThumbPlaceholder]}>
              <MapPin size={24} color={COLORS.muted} />
            </View>
          )}
          <View style={styles.listCardBody}>
            <View style={styles.listCardTop}>
              <StatusBadge status={item.status} size="sm" />
              <Text style={styles.listCardDist}>
                {item.distance ? `${(item.distance / 1000).toFixed(1)} km` : 'nearby'}
              </Text>
            </View>
            <Text style={styles.listCardTitle} numberOfLines={1}>{item.title}</Text>
            {(item.locationName || item.location?.address || item.province || item.district || item.municipality) && (
              <View style={styles.listCardAddress}>
                <MapPin size={10} color={COLORS.muted} />
                <Text style={styles.listCardAddressText} numberOfLines={1}>
                  {[item.province, item.district, item.municipality].filter(Boolean).join(', ') || item.locationName || item.location.address}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  if (!initialRegion) {
    return <View style={styles.container} />
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
        />
        {renderSkeletonLoader()}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {routeCoords && (
          <Polyline coordinates={routeCoords} strokeColor={COLORS.primary} strokeWidth={4} />
        )}
        {routeCoords?.length > 0 && (
          <Marker coordinate={routeCoords[routeCoords.length - 1]} pinColor={COLORS.primary} />
        )}
        {filteredMarkers.map(m => (
          <Marker
            key={m.id}
            coordinate={m.coordinate}
            onPress={() => handleMarkerPress(m)}
            tracksViewChanges={false}
          >
            <MarkerPin color={m.color} />
            <Callout tooltip onPress={() => navigateToReport(m.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle} numberOfLines={1}>{m.title}</Text>
                <View style={styles.calloutBadge}>
                  <StatusBadge status={m.status} size="sm" />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {viewMode === 'map' ? (
        <>
          <SafeAreaView
            edges={['top']}
            style={styles.topOverlay}
            pointerEvents="box-none"
          >
            <GlassCard padding={14} style={styles.topGlass}>
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Search size={16} color={COLORS.mutedText} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search reports..."
                    placeholderTextColor={COLORS.mutedText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={16} color={COLORS.muted} />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    activeFilterCount > 0 && styles.iconBtnActive,
                  ]}
                  onPress={() => setShowFilters(true)}
                  activeOpacity={0.7}
                >
                  <Filter
                    size={18}
                    color={activeFilterCount > 0 ? COLORS.white : COLORS.secondary}
                  />
                  {(activeFilterCount > 0 || nearMeOnly) && (
                    <View style={styles.iconBadge}>
                      <Text style={styles.iconBadgeText}>{activeFilterCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setViewMode('list')}
                  activeOpacity={0.7}
                >
                  <List size={18} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.searchMeta}>
                <Text style={styles.reportCount}>
                  {filteredMarkers.length} report{filteredMarkers.length !== 1 ? 's' : ''}{nearMeOnly ? ' nearby' : ' total'}
                </Text>
                {(activeFilterCount > 0 || nearMeOnly) && (
                  <TouchableOpacity onPress={resetFilters} hitSlop={{ top: 8, bottom: 8 }}>
                    <Text style={styles.clearFilter}>Clear filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            </GlassCard>
          </SafeAreaView>

          {!routeCoords && (
            <TouchableOpacity
              style={styles.locateBtn}
              onPress={focusLocation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.97)', 'rgba(255,255,255,0.85)']}
                style={styles.locateGrad}
              >
                <Crosshair size={20} color={COLORS.secondary} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {routeCoords && (
            <TouchableOpacity
              style={styles.locateBtn}
              onPress={() => setRouteCoords(null)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.97)', 'rgba(255,255,255,0.85)']}
                style={styles.locateGrad}
              >
                <Text style={{ fontSize: 20, color: COLORS.primary }}>✕</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <FloatingActionButton
            icon={Plus}
            onPress={navigateToCreate}
            color="primary"
            size={56}
          />

          {renderBottomSheet()}
        </>
      ) : (
        <View style={styles.listContainer}>
          <EnhancedHeader
            title={nearMeOnly ? 'Nearby Reports' : 'All Reports'}
            subtitle={`${filteredReports.length} report${filteredReports.length !== 1 ? 's' : ''} found`}
            rightAction={
              <TouchableOpacity
                style={styles.toggleMapBtn}
                onPress={() => setViewMode('map')}
                activeOpacity={0.7}
              >
                <MapPin size={18} color={COLORS.primary} />
              </TouchableOpacity>
            }
          />
          <View style={styles.listFilterBar}>
            <TouchableOpacity
              style={[
                styles.listFilterChip,
                activeFilterCount > 0 && styles.listFilterChipActive,
              ]}
              onPress={() => setShowFilters(true)}
              activeOpacity={0.7}
            >
              <SlidersHorizontal
                size={14}
                color={activeFilterCount > 0 ? COLORS.white : COLORS.mutedText}
              />
              <Text style={[
                styles.listFilterChipText,
                activeFilterCount > 0 && { color: COLORS.white },
              ]}>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
            <Text style={styles.listResultText}>
              {filteredReports.length} result{filteredReports.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={filteredReports}
            keyExtractor={r => r._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
                progressBackgroundColor={COLORS.surface}
              />
            }
            ListEmptyComponent={renderEmptyState}
            renderItem={renderListItem}
          />

          <SafeAreaView edges={['bottom']} style={styles.listBottomBar}>
            <TouchableOpacity
              style={styles.viewMapBtn}
              onPress={() => {
                setViewMode('map')
                if (filteredMarkers.length > 0) {
                  const m = filteredMarkers[0]
                  mapRef.current?.animateToRegion({
                    latitude: m.coordinate.latitude,
                    longitude: m.coordinate.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                  }, 500)
                }
              }}
              activeOpacity={0.85}
            >
              <MapPin size={18} color={COLORS.white} />
              <Text style={styles.viewMapBtnText}>View on Map</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {renderFilterSheet()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // --- Skeleton ---
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  skeletonSafeTop: {
    flex: 0,
  },
  skeletonContainer: {
    padding: 20,
    gap: 14,
    marginTop: 80,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    gap: 14,
    ...SHADOWS.md,
  },

  // --- Top Overlay ---
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topGlass: {
    marginHorizontal: 12,
    marginTop: 0,
    paddingVertical: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
    paddingVertical: 0,
    fontWeight: '500',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnActive: {
    backgroundColor: COLORS.primary,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  reportCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedText,
  },
  clearFilter: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // --- Locate Button ---
  locateBtn: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    ...SHADOWS.lg,
    zIndex: 50,
  },
  locateGrad: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  // --- Marker Pin ---
  markerWrap: {
    alignItems: 'center',
  },
  markerOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -3,
  },

  // --- Callout ---
  callout: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 10,
    minWidth: 140,
    maxWidth: 220,
    ...SHADOWS.md,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  calloutBadge: {
    alignSelf: 'flex-start',
  },

  // --- Bottom Sheet (Selected Report) ---
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 20,
    zIndex: 110,
  },
  bottomSheetCard: {
    paddingTop: 12,
  },
  sheetHandle: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  sheetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sheetCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  sheetCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mutedText,
    textTransform: 'capitalize',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  sheetAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  sheetAddressText: {
    fontSize: 12,
    color: COLORS.mutedText,
    flex: 1,
  },
  sheetDesc: {
    fontSize: 13,
    color: COLORS.mutedText,
    lineHeight: 18,
    marginBottom: 14,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sheetBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  sheetBtnGrad: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
  },
  sheetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  sheetNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.primary + '08',
  },
  sheetNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // --- Filter Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: height * 0.72,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -0.4,
  },
  filterCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 10,
    marginTop: 6,
  },
  nearMeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  nearMeToggleActive: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  nearMeToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  applyBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  applyGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // --- List Mode ---
  listContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    zIndex: 60,
  },
  toggleMapBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  listFilterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.mutedText,
  },
  listResultText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.mutedText,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: 10,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  listCardThumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    margin: 10,
  },
  listCardThumbPlaceholder: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardBody: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  listCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  listCardDist: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  listCardAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  listCardAddressText: {
    fontSize: 11,
    color: COLORS.muted,
    flex: 1,
  },
  listBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    ...SHADOWS.md,
  },
  viewMapBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
})
