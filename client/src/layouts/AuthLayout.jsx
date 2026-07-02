import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-secondary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.3)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.15)_0%,_transparent_50%)]" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">SadakSewa</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Report civic issues.
            <br />
            <span className="text-primary-light">Build better roads.</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Join thousands of citizens working together to improve road infrastructure
            and public services in their communities.
          </p>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          Trusted civic reporting platform
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
