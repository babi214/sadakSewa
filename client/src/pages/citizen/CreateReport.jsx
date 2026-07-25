import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Send, Scan, XCircle, CheckCircle2, MapPin, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import * as exifr from 'exifr'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { FormField, Input, Select, Textarea } from '../../components/common/Input'
import ImageUploader from '../../components/report/ImageUploader'
import LocationPicker from '../../components/report/LocationPicker'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import { aiService } from '../../services/aiService'
import api from '../../api/axios'
import {
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
  province: '',
  district: '',
  municipality: '',
  locationName: '',
}

export default function CreateReport() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    ...initialForm,
    province: user?.province || '',
    district: user?.district || '',
    municipality: user?.municipality || '',
  })
  const [location, setLocation] = useState(null)
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [duplicateDlg, setDuplicateDlg] = useState({ isOpen: false, title: '', message: '', similarReportId: '' })
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    api.get('/locations/provinces').then(({ data }) => {
      if (data.success) setProvinces(data.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (provinces.length && form.province && !selectedProvinceId) {
      const p = provinces.find((p) => p.name === form.province)
      if (p) setSelectedProvinceId(String(p.id))
    }
  }, [provinces, form.province, selectedProvinceId])

  useEffect(() => {
    if (districts.length && form.district && !selectedDistrictId) {
      const d = districts.find((d) => d.name === form.district)
      if (d) setSelectedDistrictId(String(d.id))
    }
  }, [districts, form.district, selectedDistrictId])

  useEffect(() => {
    if (selectedProvinceId) {
      api.get(`/locations/districts?provinceId=${selectedProvinceId}`).then(({ data }) => {
        if (data.success) {
          setDistricts(data.data)
          setMunicipalities([])
        }
      }).catch(() => {})
    } else {
      setDistricts([])
      setMunicipalities([])
    }
  }, [selectedProvinceId])

  useEffect(() => {
    if (selectedDistrictId) {
      api.get(`/locations/municipalities?districtId=${selectedDistrictId}`).then(({ data }) => {
        if (data.success) setMunicipalities(data.data)
      }).catch(() => {})
    } else {
      setMunicipalities([])
    }
  }, [selectedDistrictId])

  const [aiResult, setAiResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('')

  const clearForm = () => {
    setForm({ ...initialForm, province: '', district: '', municipality: '' })
    setLocation(null)
    setImages([])
    setErrors({})
    setAiResult(null)
    setGpsStatus('')
    setShowClearConfirm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleProvinceChange = (e) => {
    const id = e.target.value
    setSelectedProvinceId(id)
    const name = id ? provinces.find((p) => p.id === Number(id))?.name : ''
    setForm((prev) => ({ ...prev, province: name, district: '', municipality: '' }))
    setSelectedDistrictId('')
  }

  const handleDistrictChange = (e) => {
    const id = e.target.value
    setSelectedDistrictId(id)
    const name = id ? districts.find((d) => d.id === Number(id))?.name : ''
    setForm((prev) => ({ ...prev, district: name, municipality: '' }))
  }

  const handleMunicipalityChange = (e) => {
    setForm((prev) => ({ ...prev, municipality: e.target.value }))
  }

  const handleFileSelect = async (file) => {
    setAnalyzing(true)
    setAiResult(null)
    try {
      const response = await aiService.analyzeImage(file)
      if (response.success && response.data.detections?.length > 0) {
        setAiResult(response.data)
        const detectedType = response.data.detections[0]?.type || ''
        const mappedCategory = detectedType === 'pothole' ? 'pothole' : detectedType === 'landslide' ? 'landslide' : detectedType === 'garbage' ? 'garbage' : 'road_damage'
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

    if (!location) {
      let lat, lng
      try {
        const gps = await exifr.gps(file)
        if (gps?.latitude != null && gps?.longitude != null) {
          lat = gps.latitude; lng = gps.longitude
        }
      } catch { /* skip */ }

      if (lat != null && lng != null) {
        setLocation({ lat, lng })
        setGpsStatus(`Location extracted from photo: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } else {
        setGpsStatus('No GPS in photo. Click the map or use "My Location" to pin it.')
      }
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

    if (aiResult && aiResult.detections?.length === 0) {
      const confirmed = window.confirm(
        'AI analysis did not detect any issue in the image. Are you sure you want to submit this report?'
      )
      if (!confirmed) return
    }

    setIsSubmitting(true)
    try {
      const topDetection = aiResult?.detections?.[0]
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        longitude: location.lng,
        latitude: location.lat,
        images: images.map(({ url, publicId }) => ({ url, publicId })),
      }

      if (form.province) payload.province = form.province
      if (form.district) payload.district = form.district
      if (form.municipality) payload.municipality = form.municipality
      if (form.locationName.trim()) payload.locationName = form.locationName.trim()
      if (topDetection) {
        payload.aiAnalysis = {
          detectedIssue: topDetection.type,
          confidence: topDetection.confidence,
        }
      }
      if (aiResult?.annotated_image) {
        payload.annotatedImage = `data:image/jpeg;base64,${aiResult.annotated_image}`
      }

      const response = await reportService.createReport(payload)

      if (response.success) {
        toast.success('Report submitted successfully!')
        navigate('/citizen/reports')
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setDuplicateDlg({
          isOpen: true,
          title: 'Similar Report Found',
          message: error.response.data.message,
          similarReportId: error.response.data.similarReportId || '',
        })
      } else {
        toast.error(getApiErrorMessage(error, 'Failed to submit report'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/citizen/dashboard"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-white hover:text-secondary"
          >
            <ArrowLeft strokeWidth={1.5} className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-secondary">Report an Issue</h1>
            <p className="mt-1 text-sm text-muted">
              Help improve your community by reporting road-related problems
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-secondary"
          title="Clear form"
        >
          <RotateCcw strokeWidth={1.5} className="h-4 w-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column — Issue Details + Photos */}
          <div className="space-y-6">
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
              <h2 className="mb-5 text-lg font-semibold text-secondary">Photos</h2>
              <ImageUploader
                images={images}
                onChange={setImages}
                onFileSelect={handleFileSelect}
              />
              {errors.images && (
                <p className="mt-2 text-sm text-danger">{errors.images}</p>
              )}

              <p className="mt-3 text-xs text-muted">
                AI detects road damage, landslides, and garbage. Other problems like drainage or streetlight issues should still be reported regardless.
              </p>

              {analyzing && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <Scan strokeWidth={1.5} className="h-4 w-4 animate-pulse" />
                  Analyzing image...
                </div>
              )}

              {aiResult && !analyzing && (
                <div className="mt-3">
                  {aiResult.detections?.length > 0 ? (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-danger">
                        <XCircle strokeWidth={1.5} className="h-4 w-4" />
                        AI Detected
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
                      <CheckCircle2 strokeWidth={1.5} className="h-4 w-4" />
                      No issues detected in image
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
          </div>

          {/* Right column — Location */}
          <div className="space-y-6">
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

                <FormField label="Province">
                  <Select
                    value={selectedProvinceId}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Select province</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="District">
                  <Select
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceId}
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Municipality">
                  <Select
                    value={form.municipality}
                    onChange={handleMunicipalityChange}
                    disabled={!selectedDistrictId}
                  >
                    <option value="">Select municipality</option>
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Pin on map" error={errors.location} required>
                  {gpsStatus && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <MapPin strokeWidth={1.5} className="h-3.5 w-3.5" />
                      {gpsStatus}
                    </div>
                  )}
                  <LocationPicker
                    value={location}
                    onChange={(coords) => {
                      setLocation(coords)
                      setGpsStatus('')
                      if (errors.location) {
                        setErrors((prev) => ({ ...prev, location: '' }))
                      }
                    }}
                    error={errors.location}
                  />
                </FormField>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center mt-6">
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={!isSubmitting && <Send strokeWidth={1.5} className="h-4 w-4" />}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Report Issue
          </Button>
          <Link to="/citizen/dashboard" className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full sm:w-auto min-w-[200px]">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      <Modal
        isOpen={duplicateDlg.isOpen}
        onClose={() => setDuplicateDlg({ ...duplicateDlg, isOpen: false })}
        title={duplicateDlg.title}
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle strokeWidth={1.5} className="h-7 w-7 text-warning" />
          </div>
          <p className="text-sm text-muted">{duplicateDlg.message}</p>
          {duplicateDlg.similarReportId && (
            <Link
              to={`/reports/${duplicateDlg.similarReportId}`}
              className="text-sm font-medium text-primary hover:text-primary-dark underline"
              onClick={() => setDuplicateDlg({ ...duplicateDlg, isOpen: false })}
            >
              View existing report
            </Link>
          )}
          <Button
            variant="outline"
            onClick={() => setDuplicateDlg({ ...duplicateDlg, isOpen: false })}
            className="min-w-[120px]"
          >
            Got it
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear form"
        description="This will reset all fields and cannot be undone."
        size="sm"
      >
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={clearForm}
          >
            Clear everything
          </Button>
        </div>
      </Modal>
    </div>
  )
}
