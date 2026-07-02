import { useRef, useState } from 'react'
import { Camera, Mail, MapPin, Phone, Save, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card, { CardHeader } from '../../components/common/Card'
import { FormField, Input, Select } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { NEPAL_MUNICIPALITIES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import {
  getApiErrorMessage,
  validatePhone,
  validateRequired,
} from '../../utils/validators'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    municipality: user?.municipality || '',
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {
      fullName: validateRequired(form.fullName, 'Full name'),
      phone: validatePhone(form.phone),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        municipality: form.municipality || null,
      }

      const response = await authService.updateProfile(payload)

      if (response.success) {
        updateUser(response.user)
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update profile'))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setIsUploadingPhoto(true)
    try {
      const response = await authService.updateProfilePicture(file)
      if (response.success) {
        updateUser(response.user)
        toast.success('Profile picture updated')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload photo'))
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Profile</h1>
        <p className="mt-1 text-muted">Manage your account information</p>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader title="Profile Picture" subtitle="Update your avatar" />
        <div className="mt-6 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-primary/10"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-bold text-primary ring-4 ring-primary/10">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute -bottom-2 -right-2 rounded-xl bg-primary p-2 text-white shadow-lg transition-colors hover:bg-primary-dark disabled:opacity-60"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div>
            <p className="font-medium text-secondary">{user?.fullName}</p>
            <p className="text-sm capitalize text-muted">{user?.role}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              isLoading={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>
      </Card>

      {/* Account Info (read-only) */}
      <Card>
        <CardHeader title="Account Information" />
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-background px-4 py-3">
            <Mail className="h-4 w-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-secondary">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background px-4 py-3">
            <User className="h-4 w-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Member since</p>
              <p className="text-sm font-medium text-secondary">
                {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader title="Edit Profile" subtitle="Update your personal details" />
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <FormField label="Full name" error={errors.fullName} required>
            <Input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              error={errors.fullName}
            />
          </FormField>

          <FormField
            label="Phone number"
            error={errors.phone}
            hint="Optional — include country code"
          >
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+9779800000000"
                className="pl-9"
                error={errors.phone}
              />
            </div>
          </FormField>

          <FormField label="Municipality">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Select
                name="municipality"
                value={form.municipality}
                onChange={handleChange}
                className="pl-9"
              >
                <option value="">Select municipality</option>
                {NEPAL_MUNICIPALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </FormField>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={isSaving}
              leftIcon={!isSaving && <Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
