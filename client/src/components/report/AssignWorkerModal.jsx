import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { FormField, Select } from '../common/Input'
import { userService } from '../../services/userService'
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
    if (!isOpen) return

    const fetchWorkers = async () => {
      setLoadingWorkers(true)
      try {
        const response = await userService.getUsers({ role: 'worker', isActive: true })
        if (response.success) {
          setWorkers(response.users)
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
              {worker.fullName} ({worker.email})
            </option>
          ))}
        </Select>
      </FormField>

      {workers.length === 0 && !loadingWorkers && (
        <p className="mt-2 text-xs text-muted">No active workers found.</p>
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
