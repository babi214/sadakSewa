import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { ReportCardSkeleton } from '../../components/common/Skeleton'
import { FormField, Input, Select, Textarea } from '../../components/common/Input'
import ImageUploader from '../../components/report/ImageUploader'
import LocationPicker from '../../components/report/LocationPicker'
import { reportService } from '../../services/reportService'
import { getReportCoordinates } from '../../utils/leafletSetup'
import {
  NEPAL_MUNICIPALITIES,
  REPORT_CATEGORIES,
  SEVERITY_LEVELS,
} from '../../utils/constants'
import { getApiErrorMessage, validateRequired } from '../../utils/validators'

export default function EditReport() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [location, setLocation] = useState(null)
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await reportService.getReportById(id)
        if (response.success) {
          const report = response.report
          setForm({
            title: report.title || '',
            description: report.description || '',
            category: report.category || '',
            severity: report.severity || 'medium',
            municipality: report.municipality || '',
            locationName: report.locationName || '',
          })
          setImages(report.images || [])
          const coords = getReportCoordinates(report)
          if (coords) setLocation(coords)
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load report'))
        navigate('/citizen/reports')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {
      title: validateRequired(form.title, 'Title'),
      description: validateRequired(form.description, 'Description'),
      category: validateRequired(form.category, 'Category'),
      location: !location ? 'Please select a location on the map' : '',
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        municipality: form.municipality || '',
        locationName: form.locationName.trim(),
        longitude: location.lng,
        latitude: location.lat,
        images: images.map(({ url, publicId }) => ({ url, publicId })),
      }

      const response = await reportService.updateReport(id, payload)
      if (response.success) {
        toast.success('Report updated successfully')
        navigate('/citizen/reports')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update report'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !form) {
    return (
      <div className="mx-auto max-w-3xl">
        <ReportCardSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/citizen/reports"
          className="rounded-xl p-2 text-muted transition-colors hover:bg-white hover:text-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Edit Report</h1>
          <p className="mt-1 text-sm text-muted">Update your submitted issue details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <h2 className="mb-5 text-lg font-semibold text-secondary">Issue Details</h2>
          <div className="space-y-5">
            <FormField label="Title" error={errors.title} required>
              <Input name="title" value={form.title} onChange={handleChange} maxLength={150} error={errors.title} />
            </FormField>
            <FormField label="Description" error={errors.description} required>
              <Textarea name="description" value={form.description} onChange={handleChange} rows={5} maxLength={2000} error={errors.description} />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Category" error={errors.category} required>
                <Select name="category" value={form.category} onChange={handleChange} error={errors.category}>
                  <option value="">Select category</option>
                  {REPORT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Severity">
                <Select name="severity" value={form.severity} onChange={handleChange}>
                  {SEVERITY_LEVELS.map((sev) => (
                    <option key={sev.value} value={sev.value}>{sev.label}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-semibold text-secondary">Location</h2>
          <div className="space-y-5">
            <FormField label="Location name">
              <Input name="locationName" value={form.locationName} onChange={handleChange} maxLength={200} />
            </FormField>
            <FormField label="Municipality">
              <Select name="municipality" value={form.municipality} onChange={handleChange}>
                <option value="">Select municipality</option>
                {NEPAL_MUNICIPALITIES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Pin on map" error={errors.location} required>
              <LocationPicker
                value={location}
                onChange={(coords) => {
                  setLocation(coords)
                  if (errors.location) setErrors((prev) => ({ ...prev, location: '' }))
                }}
                error={errors.location}
              />
            </FormField>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-semibold text-secondary">Photos</h2>
          <ImageUploader images={images} onChange={setImages} />
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to="/citizen/reports">
            <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" isLoading={isSubmitting} leftIcon={!isSubmitting && <Save className="h-4 w-4" />} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
