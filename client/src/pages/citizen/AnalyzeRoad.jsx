import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Scan, Send, MapPin, Navigation, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { aiService } from '../../services/aiService'
import { uploadService } from '../../services/uploadService'
import { getApiErrorMessage } from '../../utils/validators'

export default function AnalyzeRoad() {
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationName, setLocationName] = useState('')

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image')
      return
    }

    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setAnalyzing(true)
    try {
      const response = await aiService.analyzeImage(file)
      if (response.success) {
        setResult(response.data)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Analysis failed'))
    } finally {
      setAnalyzing(false)
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        toast.success('Location detected')
      },
      () => {
        toast.error('Could not detect location. Please enter manually.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmitReport = async () => {
    if (!location) {
      toast.error('Please detect your location first')
      return
    }

    setSubmitting(true)
    try {
      const uploadRes = await uploadService.uploadImages([file])
      if (!uploadRes.success) {
        throw new Error('Failed to upload image')
      }

      const uploadedImage = uploadRes.images[0]

      const reportRes = await aiService.createAiReport({
        image: uploadedImage,
        annotatedImage: `data:image/jpeg;base64,${result.annotated_image}`,
        damageType: result.detections[0]?.type || 'road_damage',
        confidence: result.detections[0]?.confidence || 0,
        longitude: location.lng,
        latitude: location.lat,
        locationName: locationName || '',
      })

      if (reportRes.success) {
        toast.success('Report submitted successfully')
        navigate('/citizen/reports')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit report'))
    } finally {
      setSubmitting(false)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setLocation(null)
    setLocationName('')
    if (inputRef.current) inputRef.current.value = ''
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
          <h1 className="text-2xl font-bold text-secondary">Analyze Road</h1>
          <p className="mt-1 text-sm text-muted">
            Upload a road image for AI-powered damage detection
          </p>
        </div>
      </div>

      {!result && (
        <Card>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-secondary">Upload Image</h2>
                <p className="text-sm text-muted">Select a road image to analyze</p>
              </div>
            </div>

            {preview ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-96 w-full object-contain bg-black/5"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => inputRef.current?.click()}>
                    Change Image
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    isLoading={analyzing}
                    leftIcon={!analyzing && <Scan className="h-4 w-4" />}
                  >
                    Analyze
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background py-12 text-muted transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Camera className="h-10 w-10" />
                <span className="text-sm font-medium">Click to upload road image</span>
                <span className="text-xs">JPG, PNG, or WebP</span>
              </button>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          {result.detections?.length > 0 ? (
            <>
              <Card>
                <h2 className="mb-4 text-lg font-semibold text-secondary">Analysis Result</h2>
                <div className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={`data:image/jpeg;base64,${result.annotated_image}`}
                    alt="Annotated"
                    className="w-full object-contain bg-black/5"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
                      <XCircle className="h-4 w-4" />
                      Issues Detected
                    </span>
                    <span className="text-sm text-muted">
                      Status: {result.road_status}
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-4">
                    <h3 className="mb-3 text-sm font-medium text-secondary">Detected Issues</h3>
                    <div className="space-y-2">
                      {result.detections.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm"
                        >
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
                </div>
              </Card>

              <Card>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-secondary">Location</h2>
                      <p className="text-sm text-muted">Set your location for the report</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      leftIcon={<Navigation className="h-3.5 w-3.5" />}
                    >
                      {location ? 'Update Location' : 'Use My Location'}
                    </Button>
                    {location && (
                      <span className="text-sm text-muted">
                        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Location name (optional) — e.g. Near Baneshwor Chowk"
                    className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-muted/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
                    maxLength={200}
                  />
                </div>
              </Card>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={resetAnalysis}>
                  Start Over
                </Button>
                <Button
                  onClick={handleSubmitReport}
                  isLoading={submitting}
                  size="lg"
                  leftIcon={!submitting && <Send className="h-4 w-4" />}
                  disabled={!location}
                >
                  Submit Report
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-secondary">
                  No issues detected
                </h2>
                <p className="mt-2 text-sm text-muted">
                  No road damage, landslide, or garbage detected in this image.
                </p>
                <div className="mt-8">
                  <Button variant="outline" onClick={resetAnalysis}>
                    Analyze Another Image
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
