import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Scan, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { aiService } from '../../services/aiService'
import { getApiErrorMessage } from '../../utils/validators'

export default function AnalyzeRoad() {
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

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

  const resetAnalysis = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
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
          <h1 className="font-display text-2xl font-bold text-secondary">Analyze Road</h1>
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
                    leftIcon={!analyzing && <Scan strokeWidth={1.5} className="h-4 w-4" />}
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
                      <XCircle strokeWidth={1.5} className="h-4 w-4" />
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

              <div className="flex justify-end">
                <Button variant="outline" onClick={resetAnalysis}>
                  Analyze Another Image
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
