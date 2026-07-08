import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
const footerLinks = {
  platform: [
    { to: '/reports', label: 'Reports' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ],
  citizen: [
    { to: '/citizen/reports/new', label: 'Report an Issue' },
  ],
}

export default function Footer() {
  const { isAuthenticated } = useAuth()
  const currentYear = new Date().getFullYear()
  const citizenLinks = isAuthenticated
    ? footerLinks.citizen
    : [{ to: '/register', label: 'Register' }, { to: '/login', label: 'Login' }, ...footerLinks.citizen]

  return (
    <footer className="border-t border-border bg-secondary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/logoSadakSewa.png"
                alt="SadakSewa"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-lg font-bold">SadakSewa</span>
            </Link>
            <p className="mt-4 max-w-full text-sm leading-relaxed text-slate-400 sm:max-w-xs">
              A civic issue reporting platform empowering citizens to improve road
              infrastructure and public services in their communities.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Get Involved
            </h3>
            <ul className="mt-4 space-y-2.5">
              {citizenLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <Mail strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                Bimalbhandari563@gmail.com
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <Phone strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                +977 9816604620
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                Pokhara, Nepal
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-700/50 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} SadakSewa. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Final Year Project &mdash; Civic Technology Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
