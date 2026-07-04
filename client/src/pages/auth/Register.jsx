import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { FormField, Input } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { NEPAL_MUNICIPALITIES } from '../../utils/constants'
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
    municipality: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      }

      if (form.phone.trim()) payload.phone = form.phone.trim()
      if (form.municipality) payload.municipality = form.municipality

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
        <h1 className="text-2xl font-bold text-secondary">SadakSewa</h1>
        <p className="mt-1 text-sm text-muted">Create your citizen account</p>
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
          <Input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </FormField>

        <FormField label="Phone number" error={errors.phone} hint="Optional — include country code">
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

        <FormField label="Municipality" hint="Optional — helps route your reports">
          <select
            name="municipality"
            value={form.municipality}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-secondary transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select municipality</option>
            {NEPAL_MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
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
