import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import StatusShield from '../components/common/StatusShield'

export default function AuthLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative hidden w-1/2 bg-secondary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(27,75,94,0.4)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(32,122,70,0.2)_0%,_transparent_50%)]" />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <img
            src="/logoSadakSewa.png"
            alt="SadakSewa"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-white">SadakSewa</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Report road issues.
            <br />
            <span className="text-primary-light">Track until resolved.</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Join citizens and workers improving road infrastructure in your community.
          </p>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          Civic issue reporting platform
        </p>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-background px-4 py-12 sm:px-6">
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
