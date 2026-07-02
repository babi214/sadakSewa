import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { FormField, Input, Select, Textarea } from '../../components/common/Input'
import ImageUploader from '../../components/report/ImageUploader'
import LocationPicker from '../../components/report/LocationPicker'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import {
  NEPAL_MUNICIPALITIES,
  REPORT_CATEGORIES,
  SEVERITY_LEVELS,
} from '../../utils/constants'
import {
  getApiErrorMessage,
  validateRequired,
} from '../../utils/validators'

const initialForm = {
  title: '',
  description: '',
  category: '',
  severity: 'medium',
  municipality: '',
  locationName: '',
}

export default function CreateReport() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    ...initialForm,
    municipality: user?.municipality || '',
  })
  const [location, setLocation] = useState(null)
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {
      title: validateRequired(form.title, 'Title'),
      description: validateRequired(form.description, 'Description'),
      category: validateRequired(form.category, 'Category'),
      location: !location ? 'Please select a location on the map' : '',
    }

    if (form.description && form.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters'
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
        longitude: location.lng,
        latitude: location.lat,
        images: images.map(({ url, publicId }) => ({ url, publicId })),
      }

      if (form.municipality) payload.municipality = form.municipality
      if (form.locationName.trim()) payload.locationName = form.locationName.trim()

      const response = await reportService.createReport(payload)

      if (response.success) {
        toast.success('Report submitted successfully!')
        navigate('/citizen/reports')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit report'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/citizen/dashboard"
          className="rounded-xl p-2 text-muted transition-colors hover:bg-white hover:text-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">Report an Issue</h1>
          <p className="mt-1 text-sm text-muted">
            Help improve your community by reporting road-related problems
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <h2 className="mb-5 text-lg font-semibold text-secondary">Issue Details</h2>
          <div className="space-y-5">
            <FormField label="Title" error={errors.title} required>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Large pothole on main road"
                maxLength={150}
                error={errors.title}
              />
            </FormField>

            <FormField label="Description" error={errors.description} required>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail — size, danger level, nearby landmarks..."
                rows={5}
                maxLength={2000}
                error={errors.description}
              />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Category" error={errors.category} required>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  error={errors.category}
                >
                  <option value="">Select category</option>
                  {REPORT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Severity">
                <Select name="severity" value={form.severity} onChange={handleChange}>
                  {SEVERITY_LEVELS.map((sev) => (
                    <option key={sev.value} value={sev.value}>
                      {sev.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-semibold text-secondary">Location</h2>
          <div className="space-y-5">
            <FormField label="Location name" hint="Optional — street name or landmark">
              <Input
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                placeholder="e.g. Near Baneshwor Chowk"
                maxLength={200}
              />
            </FormField>

            <FormField label="Municipality">
              <Select
                name="municipality"
                value={form.municipality}
                onChange={handleChange}
              >
                <option value="">Select municipality</option>
                {NEPAL_MUNICIPALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Pin on map" error={errors.location} required>
              <LocationPicker
                value={location}
                onChange={(coords) => {
                  setLocation(coords)
                  if (errors.location) {
                    setErrors((prev) => ({ ...prev, location: '' }))
                  }
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
          <Link to="/citizen/dashboard">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={!isSubmitting && <Send className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Submit Report
          </Button>
        </div>
      </form>
    </div>
  )
}
