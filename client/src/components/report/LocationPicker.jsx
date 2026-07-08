import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { MapPin, Navigation } from 'lucide-react'
import '../../utils/leafletSetup'
import { DEFAULT_MAP_CENTER } from '../../utils/constants'
import Button from '../common/Button'

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom())
  }, [center, map])
  return null
}

export default function LocationPicker({ value, onChange, error }) {
  const position = value || DEFAULT_MAP_CENTER

  useEffect(() => {
    if (value) return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        // Geolocation failed — keep current position
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted break-all">
          <MapPin strokeWidth={1.5} className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {value
              ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
              : 'Click on the map to pin the issue location'}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseMyLocation}
          leftIcon={<Navigation strokeWidth={1.5} className="h-3.5 w-3.5" />}
        >
          My Location
        </Button>
      </div>

      <div
        className={[
          'overflow-hidden rounded-xl border',
          error ? 'border-danger/50' : 'border-border',
        ].join(' ')}
      >
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          className="h-56 w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onChange} />
          {value && (
            <>
              <Marker position={[value.lat, value.lng]} />
              <MapRecenter center={value} />
            </>
          )}
        </MapContainer>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-muted">
        Tap anywhere on the map to set the exact location of the issue
      </p>
    </div>
  )
}
