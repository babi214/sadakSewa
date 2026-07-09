import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import '../../utils/leafletSetup'
import { DEFAULT_MAP_CENTER } from '../../utils/constants'

function MapRecenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords && coords.length > 0) {
      map.fitBounds(coords, { padding: [40, 40] })
    }
  }, [coords, map])
  return null
}

export default function ReportMap({
  lat,
  lng,
  zoom = 15,
  height = 'h-72',
  popup,
  className = '',
  routeCoords,
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
        {routeCoords && routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#1B4B5E', weight: 4, opacity: 0.8 }} />
        )}
        {routeCoords && routeCoords.length > 0 && (
          <>
            <Marker position={routeCoords[routeCoords.length - 1]} />
            <FitBounds coords={routeCoords} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
