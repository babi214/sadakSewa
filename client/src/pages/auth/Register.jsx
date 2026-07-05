import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { FormField, Input, Select } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import api from '../../api/axios'
import {
  getApiErrorMessage,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
} from '../../utils/validators'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    province: '',
    district: '',
    municipality: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    if (selectedProvinceId) {
      api.get(`/locations/districts?provinceId=${selectedProvinceId}`).then(({ data }) => {
        if (data.success) setDistricts(data.data)
      }).catch(() => {})
      setForm((prev) => ({ ...prev, district: '', municipality: '' }))
      setSelectedDistrictId('')
      setMunicipalities([])
    } else {
      setDistricts([])
      setForm((prev) => ({ ...prev, district: '', municipality: '' }))
      setSelectedDistrictId('')
      setMunicipalities([])
    }
  }, [selectedProvinceId])

  useEffect(() => {
    if (selectedDistrictId) {
      api.get(`/locations/municipalities?districtId=${selectedDistrictId}`).then(({ data }) => {
        if (data.success) setMunicipalities(data.data)
      }).catch(() => {})
      setForm((prev) => ({ ...prev, municipality: '' }))
    } else {
      setMunicipalities([])
      setForm((prev) => ({ ...prev, municipality: '' }))
    }
  }, [selectedDistrictId])

  const handleProvinceChange = (e) => {
    const id = e.target.value
    setSelectedProvinceId(id)
    const name = id ? provinces.find((p) => p.id === Number(id))?.name : ''
    setForm((prev) => ({ ...prev, province: name, district: '', municipality: '' }))
    setSelectedDistrictId('')
    if (!id) { setDistricts([]); setMunicipalities([]) }
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
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      phone: validatePhone(form.phone),
      province: validateRequired(form.province, 'Province'),
      district: validateRequired(form.district, 'District'),
      municipality: validateRequired(form.municipality, 'Municipality'),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        province: form.province,
        district: form.district,
        municipality: form.municipality,
      }

      const response = await register(payload)

      if (response.success) {
        toast.success('Account created. Check your email to verify it.')
        navigate('/verify-email', {
          replace: true,
          state: {
            email: payload.email,
          },
        })
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <div className="flex items-center gap-3 mb-3">
          <img src="/logoSadakSewa.png" alt="SadakSewa" className="h-10 w-10 rounded-xl object-cover" />
          <h1 className="text-2xl font-bold text-secondary">SadakSewa</h1>
        </div>
        <p className="text-sm text-muted">Create your citizen account</p>
      </div>

      <div className="mb-8 hidden lg:block">
        <h1 className="text-2xl font-bold text-secondary">Create an account</h1>
        <p className="mt-2 text-muted">
          Join SadakSewa and start reporting issues in your community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField label="Full name" error={errors.fullName} required>
          <Input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Ram Sharma"
            autoComplete="name"
            error={errors.fullName}
          />
        </FormField>

        <FormField label="Email address" error={errors.email} required>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email}
          />
        </FormField>

        <FormField label="Password" error={errors.password} required hint="Minimum 8 characters">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              error={errors.password}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword} required>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Phone number" error={errors.phone} required>
          <Input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+9779800000000"
            autoComplete="tel"
            error={errors.phone}
          />
        </FormField>

        <FormField label="Province" error={errors.province} required>
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

        <FormField label="District" error={errors.district} required>
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

        <FormField label="Municipality" error={errors.municipality} required>
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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          leftIcon={!isLoading && <UserPlus className="h-4 w-4" />}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          state={location.state}
          className="font-medium text-primary hover:text-primary-dark"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
