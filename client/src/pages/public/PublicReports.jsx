import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '../../components/common/Pagination'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import ReportCard from '../../components/report/ReportCard'
import ReportFilters from '../../components/report/ReportFilters'
import { reportService } from '../../services/reportService'
import { getApiErrorMessage } from '../../utils/validators'

const emptyFilters = {
  search: '',
  status: '',
  category: '',
  severity: '',
}

export default function PublicReports() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters.status, filters.category, filters.severity])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (debouncedSearch) params.search = debouncedSearch
      if (filters.status) params.status = filters.status
      if (filters.category) params.category = filters.category
      if (filters.severity) params.severity = filters.severity

      const response = await reportService.getAllReports(params)
      if (response.success) {
        setReports(response.reports || [])
        setPagination({
          total: response.total || 0,
          pages: response.pages || 1,
        })
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load reports'))
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters.status, filters.category, filters.severity])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Public Reports</h1>
        <p className="mt-2 text-muted">
          Browse community-submitted road issues and track their resolution status
        </p>
      </motion.div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
        resultCount={pagination.total}
      />

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-20 text-center"
        >
          <FileText className="h-12 w-12 text-muted/30" />
          <h3 className="mt-4 text-lg font-medium text-secondary">No reports found</h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Try adjusting your filters or check back later for new community reports.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => (
              <ReportCard
                key={report._id}
                report={report}
                index={index}
                onUpdate={(updated) =>
                  setReports((prev) =>
                    prev.map((r) => (r._id === updated._id ? updated : r))
                  )
                }
              />
            ))}
          </div>

          <div className="mt-10">
            <Pagination
              page={page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  )
}
