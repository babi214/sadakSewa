import { useEffect, useMemo, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { FormField, Select } from '../common/Input'
import { REPORT_STATUSES } from '../../utils/constants'
import { formatStatus } from '../../utils/formatters'

export default function UpdateStatusModal({
  isOpen,
  onClose,
  report,
  onSubmit,
  isLoading = false,
  allowedStatuses,
}) {
  const options = useMemo(() => {
    const statuses = allowedStatuses?.length ? allowedStatuses : REPORT_STATUSES
    return statuses.filter((s) => s !== report?.status)
  }, [allowedStatuses, report?.status])

  const [status, setStatus] = useState(options[0] || '')

  useEffect(() => {
    setStatus(options[0] || '')
  }, [options])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Report Status"
      description={report?.title}
      size="sm"
    >
      {options.length > 0 ? (
        <FormField label="New status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {options.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </FormField>
      ) : (
        <p className="text-sm text-muted">No status changes are available for this report.</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(status)}
          isLoading={isLoading}
          disabled={!status || status === report?.status || options.length === 0}
        >
          Update Status
        </Button>
      </div>
    </Modal>
  )
}
