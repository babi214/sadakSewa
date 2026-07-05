import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  User,
  X,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { notificationService } from '../../services/notificationService'
import Button from '../common/Button'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/reports', label: 'Public Reports' },
  { to: '/nearby', label: 'Nearby', icon: MapPin },
  { to: '/contact', label: 'Contact' },
]

const adminExcludedPaths = ['/', '/about', '/reports', '/contact']

const citizenLinks = [
  { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/citizen/reports', label: 'My Reports' },
]

const workerLinks = [
  { to: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/worker/assigned', label: 'Assigned Reports' },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'Manage Reports' },
  { to: '/admin/flagged-reports', label: 'Flagged' },
  { to: '/admin/users', label: 'Manage Users' },
]

function getRoleLinks(role) {
  switch (role) {
    case 'admin':
      return adminLinks
    case 'worker':
      return workerLinks
    case 'citizen':
      return citizenLinks
    default:
      return []
  }
}

function getProfilePath(role) {
  switch (role) {
    case 'admin':
      return '/admin/profile'
    case 'worker':
      return '/worker/profile'
    case 'citizen':
      return '/citizen/profile'
    default:
      return '/profile'
  }
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-secondary/70 hover:bg-secondary/5 hover:text-secondary',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const profileRef = useRef(null)

  const roleLinks = isAuthenticated ? getRoleLinks(user?.role) : []
  const profilePath = isAuthenticated ? getProfilePath(user?.role) : '/profile'
  const visibleLinks = user?.role === 'admin'
    ? publicLinks.filter(l => !adminExcludedPaths.includes(l.to))
    : publicLinks

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    const fetch = async () => {
      try {
        const res = await notificationService.getUnreadCount()
        if (!cancelled) setUnreadCount(res?.unreadCount ?? res?.count ?? 0)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [isAuthenticated])

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    setProfileOpen(false)
    setMobileOpen(false)
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/40 shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logoSadakSewa.png"
            alt="SadakSewa"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-secondary">
              SadakSewa
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted sm:block">
              Civic Reporting
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {visibleLinks.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} />
          ))}
          {roleLinks.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} />
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => navigate('/notifications')}
                className="relative rounded-xl p-2 text-secondary/60 transition-colors hover:bg-secondary/5 hover:text-secondary"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white" />
                )}
              </button>

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 transition-all hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden text-left xl:block">
                    <p className="text-sm font-medium text-secondary leading-tight">
                      {user?.fullName}
                    </p>
                    <p className="text-xs capitalize text-muted">{user?.role}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white shadow-lg shadow-secondary/10"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-medium text-secondary">{user?.fullName}</p>
                        <p className="text-xs text-muted">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary/80 hover:bg-background"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to={profilePath}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary/80 hover:bg-background"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-xl p-2 text-secondary transition-colors hover:bg-secondary/5 lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/50 lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {visibleLinks.map((link) => (
                <NavItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
              {roleLinks.map((link) => (
                <NavItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  onClick={() => setMobileOpen(false)}
                />
              ))}

              <div className="mt-4 border-t border-border pt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary">{user?.fullName}</p>
                        <p className="text-xs capitalize text-muted">{user?.role}</p>
                      </div>
                    </div>
                    <Link
                      to={profilePath}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary/80 hover:bg-background"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
