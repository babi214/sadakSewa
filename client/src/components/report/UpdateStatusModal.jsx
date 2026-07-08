import { useEffect, useMemo, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { FormField, Select } from '../common/Input'
import { REPORT_STATUSES } from '../../utils/constants'
import { formatStatus } from '../../utils/formatters'
import StatusShield from '../common/StatusShield'

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
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    setStatus(options[0] || '')
    setRejectionReason('')
  }, [options])

  const handleSubmit = () => {
    onSubmit(status, rejectionReason)
  }

  const isRejected = status === 'rejected'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Status"
      description={report?.title}
      size="sm"
    >
      {options.length > 0 ? (
        <>
          <FormField label="New status">
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setRejectionReason('') }}>
              {options.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </Select>
          </FormField>

          {status && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <StatusShield status={status} size="sm" />
              <span>Moving to: {formatStatus(status)}</span>
            </div>
          )}

          {isRejected && (
            <FormField label="Rejection reason" required>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this report is being rejected..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-danger/40 focus:ring-2 focus:ring-danger/15"
                rows={3}
                maxLength={500}
              />
              {rejectionReason.length > 400 && (
                <p className="mt-1 text-xs text-muted">{rejectionReason.length}/500</p>
              )}
            </FormField>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">No status changes available for this report.</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!status || status === report?.status || options.length === 0 || (isRejected && !rejectionReason.trim())}
        >
          Update Status
        </Button>
      </div>
    </Modal>
  )
}
