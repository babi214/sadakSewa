import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadService } from '../../services/uploadService'
import { MAX_REPORT_IMAGES } from '../../utils/constants'
import { getApiErrorMessage } from '../../utils/validators'

export default function ImageUploader({ images, onChange, error, onFileSelect }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_REPORT_IMAGES - images.length
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_REPORT_IMAGES} images allowed`)
      return
    }

    const filesToUpload = files.slice(0, remaining)
    if (files.length > remaining) {
      toast.error(`Only ${remaining} more image(s) can be added`)
    }

    if (onFileSelect && filesToUpload.length > 0) {
      onFileSelect(filesToUpload[0])
    }

    setUploading(true)
    try {
      const response = await uploadService.uploadImages(filesToUpload)
      if (response.success) {
        onChange([...images, ...response.images])
        toast.success('Images uploaded')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload images'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async (index) => {
    const image = images[index]

    try {
      if (image.publicId) {
        await uploadService.deleteImage(image.publicId)
      }
      onChange(images.filter((_, i) => i !== index))
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove image'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={image.publicId || index}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-background"
          >
            <img
              src={image.url}
              alt={`Upload ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-1.5 top-1.5 rounded-lg bg-secondary/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X strokeWidth={1.5} className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.length < MAX_REPORT_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 strokeWidth={1.5} className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <ImagePlus strokeWidth={1.5} className="h-6 w-6" />
                <span className="text-xs font-medium">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-muted">
        Upload up to {MAX_REPORT_IMAGES} photos (JPEG, PNG, WebP). Photos help workers
        identify the issue faster.
      </p>
    </div>
  )
}
