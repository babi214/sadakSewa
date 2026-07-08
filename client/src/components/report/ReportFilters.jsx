import { Search, SlidersHorizontal } from 'lucide-react'
import { FormField, Input, Select } from '../common/Input'
import { REPORT_CATEGORIES, REPORT_STATUSES, SEVERITY_LEVELS } from '../../utils/constants'
import { formatStatus } from '../../utils/formatters'
import Button from '../common/Button'

export default function ReportFilters({
  filters,
  onChange,
  onReset,
  resultCount,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ ...filters, [name]: value })
  }

  const hasActiveFilters =
    filters.search || filters.status || filters.category || filters.severity

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal strokeWidth={1.5} className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-secondary">Filters</h3>
        </div>
        {resultCount !== undefined && (
          <span className="text-xs text-muted">
            {resultCount} report{resultCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Search">
          <div className="relative">
            <Search strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search reports..."
              className="pl-9"
            />
          </div>
        </FormField>

        <FormField label="Status">
          <Select name="status" value={filters.status} onChange={handleChange}>
            <option value="">All statuses</option>
            {REPORT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Category">
          <Select name="category" value={filters.category} onChange={handleChange}>
            <option value="">All categories</option>
            {REPORT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Severity">
          <Select name="severity" value={filters.severity} onChange={handleChange}>
            <option value="">All severities</option>
            {SEVERITY_LEVELS.map((sev) => (
              <option key={sev.value} value={sev.value}>
                {sev.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
