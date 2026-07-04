import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Scan, XCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { FormField, Input, Select, Textarea } from '../../components/common/Input'
import ImageUploader from '../../components/report/ImageUploader'
import LocationPicker from '../../components/report/LocationPicker'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import { aiService } from '../../services/aiService'
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

  const [aiResult, setAiResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileSelect = async (file) => {
    setAnalyzing(true)
    setAiResult(null)
    try {
      const response = await aiService.analyzeImage(file)
      if (response.success && response.data.damage_detected) {
        setAiResult(response.data)
        const detectedType = response.data.detections[0]?.type || ''
        const mappedCategory = detectedType === 'pothole' ? 'pothole' : 'road_damage'
        setForm((prev) => ({
          ...prev,
          category: prev.category || mappedCategory,
          title: prev.title || `AI Detected: ${detectedType.replace(/_/g, ' ')}`,
          description: prev.description || `AI detected ${detectedType} with ${(response.data.detections[0]?.confidence * 100).toFixed(0)}% confidence.`,
          severity: response.data.detections[0]?.confidence > 0.7 ? 'high' : response.data.detections[0]?.confidence > 0.4 ? 'medium' : 'low',
        }))
        toast.success(`AI detected: ${detectedType.replace(/_/g, ' ')}`)
      } else if (response.success) {
        setAiResult({ road_status: 'good', damage_detected: false, detections: [] })
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'AI analysis failed'))
    } finally {
      setAnalyzing(false)
    }
  }

  const validate = () => {
    const newErrors = {
      title: validateRequired(form.title, 'Title'),
      description: validateRequired(form.description, 'Description'),
      category: validateRequired(form.category, 'Category'),
      location: !location ? 'Please select a location on the map' : '',
      images: images.length === 0 ? 'At least one photo is required' : '',
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

    if (aiResult && !aiResult.damage_detected) {
      const confirmed = window.confirm(
        'AI analysis did not detect road damage in the image. Are you sure you want to submit this report?'
      )
      if (!confirmed) return
    }

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
          <ImageUploader
            images={images}
            onChange={setImages}
            onFileSelect={handleFileSelect}
          />
          {errors.images && (
            <p className="mt-2 text-sm text-danger">{errors.images}</p>
          )}

          {analyzing && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <Scan className="h-4 w-4 animate-pulse" />
              Analyzing image with AI...
            </div>
          )}

          {aiResult && !analyzing && (
            <div className="mt-3">
              {aiResult.damage_detected ? (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-danger">
                    <XCircle className="h-4 w-4" />
                    AI Detected Damage
                  </div>
                  <div className="space-y-2">
                    {aiResult.detections.map((d, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-white px-4 py-2 text-sm">
                        <span className="font-medium text-secondary capitalize">
                          {d.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-muted">
                          {(d.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-accent">
                  <CheckCircle2 className="h-4 w-4" />
                  No damage detected in image
                </div>
              )}
            </div>
          )}

          {aiResult?.annotated_image && (
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <img
                src={`data:image/jpeg;base64,${aiResult.annotated_image}`}
                alt="AI Analysis"
                className="w-full object-contain"
              />
            </div>
          )}
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
