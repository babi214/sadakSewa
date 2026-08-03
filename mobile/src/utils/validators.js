export function validateEmail(email) {
  if (!email?.trim()) return 'Email is required'
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format'
  return ''
}
export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/\d/.test(password)) return 'Password must include a number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character'
  return ''
}
export function validatePasswordRequired(password) {
  if (!password) return 'Password is required'
  return ''
}
export function validateRequired(value, fieldName) {
  if (!value?.trim()) return `${fieldName} is required`
  return ''
}
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return ''
}
export function validatePhone(phone) {
  if (!phone?.trim()) return ''
  if (!/^\+?[1-9]\d{6,14}$/.test(phone.trim())) return 'Invalid phone number format'
  return ''
}
export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback
}
