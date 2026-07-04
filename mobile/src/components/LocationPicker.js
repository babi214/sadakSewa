import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { MapPin, Crosshair, Check } from 'lucide-react-native'
import * as Location from 'expo-location'
import Toast from 'react-native-toast-message'
import Button from './Button'
import { COLORS, RADIUS, SHADOWS, DEFAULT_MAP_REGION } from '../constants'

const { width, height } = Dimensions.get('window')

export default function LocationPicker({ location, onLocationSelect, style }) {
  const [visible, setVisible] = useState(false)
  const [region, setRegion] = useState(DEFAULT_MAP_REGION)
  const [marker, setMarker] = useState(null)

  const handleOpen = () => {
    setMarker(location?.coordinates ? { latitude: location.coordinates[1], longitude: location.coordinates[0] } : null)
    if (location?.coordinates) {
      setRegion({ latitude: location.coordinates[1], longitude: location.coordinates[0], latitudeDelta: 0.02, longitudeDelta: 0.02 })
    }
    setVisible(true)
  }

  const handleMapPress = (e) => {
    setMarker(e.nativeEvent.coordinate)
  }

  const handleMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') { Toast.show({ type: 'info', text1: 'Location permission required' }); return }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
      setMarker(coord)
      setRegion({ ...coord, latitudeDelta: 0.02, longitudeDelta: 0.02 })
    } catch { Toast.show({ type: 'error', text1: 'Could not get location' }) }
  }

  const handleConfirm = () => {
    if (!marker) { Toast.show({ type: 'info', text1: 'Tap the map to place a pin' }); return }
    onLocationSelect({ coordinates: [marker.longitude, marker.latitude], address: `${marker.latitude.toFixed(4)}, ${marker.longitude.toFixed(4)}` })
    setVisible(false)
  }

  return (
    <>
      <TouchableOpacity style={[styles.picker, style]} onPress={handleOpen}>
        <MapPin size={18} color={location?.coordinates ? COLORS.primary : COLORS.muted} />
        <Text style={[styles.pickerText, !location?.coordinates && { color: COLORS.muted }]}>
          {location?.address || location?.coordinates ? `${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}` : 'Pin on map'}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setVisible(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.headerTitle}>Select Location</Text>
            <TouchableOpacity onPress={handleConfirm}><Check size={24} color={marker ? COLORS.primary : COLORS.muted} /></TouchableOpacity>
          </View>

          <MapView style={styles.map} region={region} onPress={handleMapPress}
            showsUserLocation showsMyLocationButton={false}
          >
            {marker && <Marker coordinate={marker} draggable onDragEnd={handleMapPress} />}
          </MapView>

          <TouchableOpacity style={styles.myLocationBtn} onPress={handleMyLocation}>
            <Crosshair size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  picker: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.background },
  pickerText: { fontSize: 15, color: COLORS.secondary, flex: 1 },
  modal: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, backgroundColor: COLORS.surface },
  cancel: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.secondary },
  map: { flex: 1 },
  myLocationBtn: { position: 'absolute', bottom: 32, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.md },
})
