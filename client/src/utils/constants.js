export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const ROLES = {
  CITIZEN: 'citizen',
  WORKER: 'worker',
  ADMIN: 'admin',
}

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.CITIZEN]: '/citizen/dashboard',
  [ROLES.WORKER]: '/worker/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
}

export const STORAGE_KEYS = {
  TOKEN: 'sadaksewa_token',
  USER: 'sadaksewa_user',
}

export const REPORT_CATEGORIES = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'streetlight', label: 'Streetlight' },
  { value: 'traffic_signal', label: 'Traffic Signal' },
  { value: 'road_damage', label: 'Road Damage' },
  { value: 'water_leak', label: 'Water Leak' },
  { value: 'electric_pole', label: 'Electric Pole' },
  { value: 'other', label: 'Other' },
]

export const REPORT_STATUSES = [
  'pending',
  'verified',
  'in_progress',
  'resolved',
  'rejected',
]

export const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const NEPAL_MUNICIPALITIES = [
  'Kathmandu Metropolitan City',
  'Lalitpur Metropolitan City',
  'Bhaktapur Municipality',
  'Pokhara Metropolitan City',
  'Biratnagar Metropolitan City',
  'Other',
]

export const DEFAULT_MAP_CENTER = {
  lat: 27.7172,
  lng: 85.324,
}

export const MAX_REPORT_IMAGES = 5
