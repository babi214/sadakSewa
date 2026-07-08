import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { FormField, Input } from '../../components/common/Input'
import { authService } from '../../services/authService'
import { getApiErrorMessage, validateEmail } from '../../utils/validators'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    setError(emailError)
    if (emailError) return

    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(email.trim())
      toast.success(response.message || 'Password reset request sent')
      navigate('/reset-password', {
        state: {
          email: email.trim(),
        },
      })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not start password reset'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <h1 className="font-display text-2xl font-bold text-secondary">SadakSewa</h1>
        <p className="mt-1 text-sm text-muted">Reset your password</p>
      </div>

      <div className="mb-8 hidden lg:block">
        <h1 className="font-display text-2xl font-bold text-secondary">Forgot password?</h1>
        <p className="mt-2 text-muted">
          Enter your email and we&apos;ll send a 6-digit reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField label="Email address" error={error} required>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            placeholder="you@example.com"
            autoComplete="email"
            error={error}
          />
        </FormField>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          leftIcon={!isLoading && <Mail strokeWidth={1.5} className="h-4 w-4" />}
        >
          Send Reset Code
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  )
}
