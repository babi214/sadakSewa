import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { FormField, Select } from '../common/Input'
import { reportService } from '../../services/reportService'
import { getApiErrorMessage } from '../../utils/validators'

export default function AssignWorkerModal({
  isOpen,
  onClose,
  report,
  onSubmit,
  isLoading = false,
}) {
  const [workers, setWorkers] = useState([])
  const [workerId, setWorkerId] = useState('')
  const [loadingWorkers, setLoadingWorkers] = useState(false)

  useEffect(() => {
    if (!isOpen || !report?._id) return

    const fetchWorkers = async () => {
      setLoadingWorkers(true)
      try {
        const response = await reportService.getAvailableWorkers(report._id)
        if (response.success) {
          setWorkers(response.workers)
          const current = report?.assignedWorker?._id || report?.assignedWorker
          setWorkerId(current ? String(current) : '')
        }
      } catch (error) {
        console.error(getApiErrorMessage(error))
      } finally {
        setLoadingWorkers(false)
      }
    }

    fetchWorkers()
  }, [isOpen, report])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Worker"
      description={report?.title}
      size="sm"
    >
      <FormField label="Select worker">
        <Select
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          disabled={loadingWorkers}
        >
          <option value="">
            {loadingWorkers ? 'Loading workers...' : 'Choose a worker'}
          </option>
          {workers.map((worker) => (
            <option key={worker._id} value={worker._id}>
              {worker.fullName} - {worker.district || 'No district'}{worker.municipality ? `, ${worker.municipality}` : ''}
            </option>
          ))}
        </Select>
      </FormField>

      {workers.length === 0 && !loadingWorkers && (
        <p className="mt-2 text-xs text-muted">          No available workers found. All workers are currently busy with other assignments.</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(workerId)}
          isLoading={isLoading}
          disabled={!workerId}
        >
          Assign Worker
        </Button>
      </div>
    </Modal>
  )
}
