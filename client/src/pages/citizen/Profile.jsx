import { useRef, useState, useEffect } from 'react'
import { Camera, Mail, MapPin, Phone, Save, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card, { CardHeader } from '../../components/common/Card'
import { FormField, Input, Select } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { formatDate } from '../../utils/formatters'
import api from '../../api/axios'
import {
  getApiErrorMessage,
  validateRequired,
} from '../../utils/validators'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    province: user?.province || '',
    district: user?.district || '',
    municipality: user?.municipality || '',
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')

  useEffect(() => {
    api.get('/locations/provinces').then(({ data }) => {
      if (data.success) setProvinces(data.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.province) {
      const p = provinces.find((p) => p.name === user.province)
      if (p) {
        setSelectedProvinceId(String(p.id))
        api.get(`/locations/districts?provinceId=${p.id}`).then(({ data }) => {
          if (data.success) {
            setDistricts(data.data)
            const d = data.data.find((d) => d.name === user.district)
            if (d) setSelectedDistrictId(String(d.id))
          }
        }).catch(() => {})
      }
    }
  }, [user, provinces])

  useEffect(() => {
    if (selectedDistrictId) {
      api.get(`/locations/municipalities?districtId=${selectedDistrictId}`).then(({ data }) => {
        if (data.success) setMunicipalities(data.data)
      }).catch(() => {})
    }
  }, [selectedDistrictId])

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
    setMunicipalities([])
    if (!id) setDistricts([])
  }

  const handleDistrictChange = (e) => {
    const id = e.target.value
    setSelectedDistrictId(id)
    const name = id ? districts.find((d) => d.id === Number(id))?.name : ''
    setForm((prev) => ({ ...prev, district: name, municipality: '' }))
    if (!id) setMunicipalities([])
  }

  const handleMunicipalityChange = (e) => {
    setForm((prev) => ({ ...prev, municipality: e.target.value }))
  }

  const validate = () => {
    const newErrors = {
      fullName: validateRequired(form.fullName, 'Full name'),
      phone: validateRequired(form.phone, 'Phone number'),
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
        province: form.province || null,
        district: form.district || null,
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
        <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">Profile</h1>
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
                className="h-24 w-24 rounded-xl object-cover ring-4 ring-primary/10"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 text-3xl font-bold text-primary ring-4 ring-primary/10">
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
              <Camera strokeWidth={1.5} className="h-4 w-4" />
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
            <Mail strokeWidth={1.5} className="h-4 w-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-secondary">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background px-4 py-3">
            <User strokeWidth={1.5} className="h-4 w-4 text-muted" />
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
            required
          >
            <div className="relative">
              <Phone strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
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

          <FormField label="Province">
            <div className="relative">
              <MapPin strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Select
                value={selectedProvinceId}
                onChange={handleProvinceChange}
                className="pl-9"
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
          </FormField>

          <FormField label="District">
            <div className="relative">
              <MapPin strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Select
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                disabled={!selectedProvinceId}
                className="pl-9"
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
          </FormField>

          <FormField label="Municipality">
            <div className="relative">
              <MapPin strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Select
                value={form.municipality}
                onChange={handleMunicipalityChange}
                disabled={!selectedDistrictId}
                className="pl-9"
              >
                <option value="">Select municipality</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </Select>
            </div>
          </FormField>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={isSaving}
              leftIcon={!isSaving && <Save strokeWidth={1.5} className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
