import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Navigation, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../../components/common/Badge'
import ReportsMap from '../../components/report/ReportsMap'
import { reportService } from '../../services/reportService'
import { DEFAULT_MAP_CENTER } from '../../utils/constants'
import { getApiErrorMessage } from '../../utils/validators'

const DISTANCE_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 3000, label: '3 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 20000, label: '20 km' },
]

export default function NearbyReports() {
  const [userLocation, setUserLocation] = useState(null)
  const [reports, setReports] = useState([])
  const [allReports, setAllReports] = useState([])
  const [distance, setDistance] = useState(5000)
  const [activeReportId, setActiveReportId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState('')

  const fetchAllReports = useCallback(async () => {
    try {
      const response = await reportService.getAllReports()
      if (response.success) {
        setAllReports(response.reports || response.data || [])
      }
    } catch (_) {}
  }, [])

  const fetchNearby = useCallback(async (coords) => {
    setLoading(true)
    try {
      const response = await reportService.getNearbyReports({
        latitude: coords.lat,
        longitude: coords.lng,
        distance,
      })
      if (response.success) {
        setReports(response.reports || [])
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load nearby reports'))
    } finally {
      setLoading(false)
    }
  }, [distance])

  const requestLocation = useCallback(() => {
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setUserLocation(DEFAULT_MAP_CENTER)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {
        setLocationError('Unable to get your location. Showing default area.')
        setUserLocation(DEFAULT_MAP_CENTER)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    requestLocation()
    fetchAllReports()
  }, [requestLocation, fetchAllReports])

  useEffect(() => {
    if (userLocation) fetchNearby(userLocation)
  }, [userLocation, distance, fetchNearby])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">Nearby Reports</h1>
          <p className="mt-1 text-muted">
            Road issues reported near your current location
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-secondary focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {DISTANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Within {opt.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            leftIcon={<Navigation strokeWidth={1.5} className="h-4 w-4" />}
          >
            Refresh Location
          </Button>
        </div>
      </div>

      {locationError && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          {locationError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Map */}
        <div className="xl:col-span-3">
          {userLocation ? (
            <ReportsMap
              reports={allReports}
              userLocation={userLocation}
              activeReportId={activeReportId}
              onMarkerClick={setActiveReportId}
              height="h-[300px] sm:h-[400px] xl:h-[520px]"
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-xl border border-border bg-white sm:h-[400px] xl:h-[520px]">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* List */}
        <div className="xl:col-span-2">
          <Card padding="none" className="max-h-[300px] sm:max-h-[400px] xl:max-h-[520px] overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-secondary">
                {loading ? 'Loading...' : `${reports.length} nearby report${reports.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="max-h-[240px] overflow-y-auto sm:max-h-[340px] xl:max-h-[460px]">
              {loading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ReportCardSkeleton key={i} />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-12 text-center">
                  <MapPin className="h-10 w-10 text-muted/30" />
                  <p className="mt-3 text-sm font-medium text-secondary">No nearby reports</p>
                  <p className="mt-1 text-xs text-muted">
                    Try increasing the search radius
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {reports.map((report) => (
                    <li key={report._id}>
                      <button
                        type="button"
                        onClick={() => setActiveReportId(report._id)}
                        className={[
                          'w-full px-4 py-4 text-left transition-colors hover:bg-background',
                          activeReportId === report._id && 'bg-primary/5',
                        ].join(' ')}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={report.status} />
                          <CategoryBadge category={report.category} />
                        </div>
                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-secondary">
                          {report.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          {report.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <SeverityBadge severity={report.severity} />
                          <Link
                            to={`/reports/${report._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            View details
                          </Link>
                        </div>
                        {report.locationName && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                            <MapPin className="h-3 w-3" />
                            {report.locationName}
                          </p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
