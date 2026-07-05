import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import '../../utils/leafletSetup'
import { DEFAULT_MAP_CENTER } from '../../utils/constants'

function MapRecenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

export default function ReportMap({
  lat,
  lng,
  zoom = 15,
  height = 'h-72',
  popup,
  className = '',
}) {
  const center = lat && lng ? { lat, lng } : DEFAULT_MAP_CENTER
  const hasMarker = Boolean(lat && lng)

  return (
    <div className={`overflow-hidden rounded-xl border border-border ${className}`} style={{ position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className={`w-full ${height}`}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasMarker && (
          <>
            <Marker position={[lat, lng]}>
              {popup && <Popup>{popup}</Popup>}
            </Marker>
            <MapRecenter center={{ lat, lng }} zoom={zoom} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
