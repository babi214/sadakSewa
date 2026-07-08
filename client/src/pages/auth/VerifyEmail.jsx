import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { FormField, Input } from '../../components/common/Input'
import { authService } from '../../services/authService'
import { getApiErrorMessage, validateEmail } from '../../utils/validators'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: location.state?.email || '',
    code: '',
  })
  const [errors, setErrors] = useState({})
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
      code: !form.code ? 'Verification code is required' : form.code.length !== 6 ? 'Code must be 6 digits' : '',
    }
    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const response = await authService.verifyEmail({
        email: form.email.trim(),
        code: form.code,
      })
      toast.success(response.message || 'Email verified')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Verification failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-secondary">Verify your email</h1>
        <p className="mt-2 text-muted">Enter the 6-digit code we sent to your email.</p>
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

        <FormField label="Verification code" error={errors.code} required>
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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          leftIcon={!isLoading && <MailCheck strokeWidth={1.5} className="h-4 w-4" />}
        >
          Verify Email
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already verified?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  )
}
