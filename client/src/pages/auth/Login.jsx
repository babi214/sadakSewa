import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { FormField, Input } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_DASHBOARD_PATHS } from '../../utils/constants'
import {
  getApiErrorMessage,
  validateEmail,
  validatePassword,
} from '../../utils/validators'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
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
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      })

      if (response.success) {
        toast.success('Welcome back!')
        const redirectTo =
          location.state?.from?.pathname ||
          ROLE_DASHBOARD_PATHS[response.user.role] ||
          '/'
        navigate(redirectTo, { replace: true })
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed'))
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
        <p className="text-sm text-muted">Sign in to your account</p>
      </div>

      <div className="mb-8 hidden lg:block">
        <h1 className="text-2xl font-bold text-secondary">Welcome back</h1>
        <p className="mt-2 text-muted">Sign in to continue reporting and tracking issues</p>
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

        <FormField label="Password" error={errors.password} required>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
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

        <div className="-mt-2 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          leftIcon={!isLoading && <LogIn className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          state={location.state}
          className="font-medium text-primary hover:text-primary-dark"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
