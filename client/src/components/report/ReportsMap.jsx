import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import '../../utils/leafletSetup'
import { DEFAULT_MAP_CENTER } from '../../utils/constants'
import {
  createReportMarkerIcon,
  createUserLocationIcon,
  getReportCoordinates,
} from '../../utils/leafletSetup'
import { CategoryBadge, StatusBadge } from '../common/Badge'

function FitBounds({ reports }) {
  const map = useMap()

  useEffect(() => {
    const coords = reports
      .map(getReportCoordinates)
      .filter(Boolean)

    if (coords.length === 0) return

    if (coords.length === 1) {
      map.setView([coords[0].lat, coords[0].lng], 15)
      return
    }

    const lats = coords.map((c) => c.lat)
    const lngs = coords.map((c) => c.lng)
    const bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [reports, map])

  return null
}

function FlyToReport({ activeReportId, reports }) {
  const map = useMap()

  useEffect(() => {
    if (!activeReportId) return
    const report = reports.find((r) => r._id === activeReportId)
    const coords = getReportCoordinates(report)
    if (coords) map.flyTo([coords.lat, coords.lng], 16, { duration: 0.8 })
  }, [activeReportId, reports, map])

  return null
}

export default function ReportsMap({
  reports = [],
  userLocation = null,
  activeReportId = null,
  onMarkerClick,
  height = 'h-[480px]',
  className = '',
}) {
  const center = userLocation || DEFAULT_MAP_CENTER

  return (
    <div className={`border border-border ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        className={`w-full ${height}`}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {reports.map((report) => {
          const coords = getReportCoordinates(report)
          if (!coords) return null

          const isActive = report._id === activeReportId

          return (
            <Marker
              key={report._id}
              position={[coords.lat, coords.lng]}
              icon={createReportMarkerIcon(isActive, report.status)}
              eventHandlers={{
                click: () => onMarkerClick?.(report._id),
              }}
            >
              <Popup>
                <div className="min-w-[180px] space-y-2">
                  <p className="font-semibold text-secondary">{report.title}</p>
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={report.status} />
                    <CategoryBadge category={report.category} />
                  </div>
                  <Link
                    to={`/reports/${report._id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <FitBounds reports={reports} />
        <FlyToReport activeReportId={activeReportId} reports={reports} />
      </MapContainer>
    </div>
  )
}
