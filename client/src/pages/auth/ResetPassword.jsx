import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { FormField, Input } from '../../components/common/Input'
import { authService } from '../../services/authService'
import {
  getApiErrorMessage,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from '../../utils/validators'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({
    email: location.state?.email || '',
    code: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'code' ? value.replace(/\D/g, '').slice(0, 6) : value
    setForm((prev) => ({ ...prev, [name]: nextValue }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {
      email: validateEmail(form.email),
      code: !form.code ? 'Reset code is required' : form.code.length !== 6 ? 'Code must be 6 digits' : '',
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    }
    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const response = await authService.resetPassword({
        email: form.email.trim(),
        code: form.code,
        password: form.password,
      })
      toast.success(response.message || 'Password reset successfully')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not reset password'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <h1 className="text-2xl font-bold text-secondary">SadakSewa</h1>
        <p className="mt-1 text-sm text-muted">Create a new password</p>
      </div>

      <div className="mb-8 hidden lg:block">
        <h1 className="text-2xl font-bold text-secondary">Reset password</h1>
        <p className="mt-2 text-muted">Enter your 6-digit code and choose a new password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

        <FormField label="Reset code" error={errors.code} required>
          <Input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
            error={errors.code}
            className="text-center text-lg font-semibold tracking-[0.35em]"
          />
        </FormField>

        <FormField label="New password" error={errors.password} required hint="Minimum 8 characters">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a new password"
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
            placeholder="Confirm your new password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </FormField>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          leftIcon={!isLoading && <KeyRound className="h-4 w-4" />}
        >
          Reset Password
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Back to{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
          sign in
        </Link>
      </p>
    </div>
  )
}
