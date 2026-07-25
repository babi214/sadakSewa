import { COLORS, GRADIENTS, SPACING, RADIUS, SHADOWS } from './theme'
export { COLORS, GRADIENTS, SPACING, RADIUS, SHADOWS }
export { ANIMATION_DURATION, EASING, FADE_IN, SLIDE_UP, SLIDE_LEFT, SCALE_IN, STAGGER_DELAY, SPRING_CONFIG } from './animations'

export const API_BASE_URL = 'https://stencil-caddy-supplier.ngrok-free.dev/api'

export const ROLES = {
  CITIZEN: 'citizen',
  WORKER: 'worker',
  ADMIN: 'admin',
}

export const STORAGE_KEYS = {
  TOKEN: 'sadaksewa_token',
  USER: 'sadaksewa_user',
  THEME: 'sadaksewa_theme',
  SETTINGS: 'sadaksewa_settings',
}

export const REPORT_CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: 'AlertTriangle' },
  { value: 'garbage', label: 'Garbage', icon: 'Trash2' },
  { value: 'landslide', label: 'Landslide', icon: 'TriangleAlert' },
  { value: 'fire_smoke', label: 'Fire/Smoke', icon: 'Flame' },
  { value: 'drainage', label: 'Drainage', icon: 'Droplets' },
  { value: 'streetlight', label: 'Streetlight', icon: 'Lightbulb' },
  { value: 'traffic_signal', label: 'Traffic Signal', icon: 'TrafficCone' },
  { value: 'road_damage', label: 'Road Damage', icon: 'TriangleAlert' },
  { value: 'water_leak', label: 'Water Leak', icon: 'Droplets' },
  { value: 'electric_pole', label: 'Electric Pole', icon: 'Zap' },
  { value: 'other', label: 'Other', icon: 'HelpCircle' },
]

export const REPORT_STATUSES = ['pending', 'verified', 'in_progress', 'resolved', 'rejected']

export const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
]

export const NEPAL_MUNICIPALITIES = [
  'Kathmandu Metropolitan City',
  'Lalitpur Metropolitan City',
  'Bhaktapur Municipality',
  'Pokhara Metropolitan City',
  'Biratnagar Metropolitan City',
  'Other',
]

export const DEFAULT_MAP_REGION = {
  latitude: 27.7172,
  longitude: 85.324,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

export const MAX_REPORT_IMAGES = 5

export const STATUS_COLORS = {
  pending: '#F59E0B',
  verified: '#2563EB',
  in_progress: '#1D4ED8',
  resolved: '#10B981',
  rejected: '#EF4444',
}

export const STATUS_LABELS = {
  pending: 'Pending',
  verified: 'Verified',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

export const AI_STATUS = {
  ANALYZING: 'analyzing',
  GOOD_ROAD: 'good_road',
  DAMAGE_DETECTED: 'damage_detected',
  ERROR: 'error',
}
