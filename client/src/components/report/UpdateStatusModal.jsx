import { useEffect, useState } from 'react'
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
}) {
  const [status, setStatus] = useState(report?.status || 'pending')

  useEffect(() => {
    if (report?.status) setStatus(report.status)
  }, [report])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Report Status"
      description={report?.title}
      size="sm"
    >
      <FormField label="New status">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {REPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {formatStatus(s)}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(status)}
          isLoading={isLoading}
          disabled={status === report?.status}
        >
          Update Status
        </Button>
      </div>
    </Modal>
  )
}
