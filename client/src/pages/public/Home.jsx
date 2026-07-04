import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  MapPin,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import api from '../../api/axios'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
}

const features = [
  {
    icon: Camera,
    title: 'Photo Evidence',
    description:
      'Upload images of potholes, broken streetlights, and other road issues with precise location data.',
  },
  {
    icon: MapPin,
    title: 'GPS Location',
    description:
      'Pin exact locations on an interactive map so workers can find and resolve issues quickly.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description:
      'Monitor report status from submission to resolution with real-time updates and notifications.',
  },
  {
    icon: Shield,
    title: 'Verified Reports',
    description:
      'Community upvoting and municipal verification ensure the most critical issues get priority.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description:
      'Join fellow citizens in making your municipality safer and more accessible for everyone.',
  },
  {
    icon: Zap,
    title: 'Fast Response',
    description:
      'Automated assignment to field workers ensures issues are addressed without unnecessary delays.',
  },
]

const steps = [
  'Spot a road issue in your area',
  'Submit a report with photo & location',
  'Track status until it gets resolved',
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/reports/stats').then(({ data }) => {
      if (data.success) setStats(data.stats)
    }).catch(() => {})
  }, [])

  const totalReports = stats?.totalReports?.toLocaleString() ?? '—'
  const resolutionRate = stats ? `${stats.resolutionRate}%` : '—'
  const avgTime = '3-4 hrs'
  const openCount = stats?.pending?.toLocaleString() ?? '—'
  const inProgressCount = stats?.inProgress?.toLocaleString() ?? '—'
  const resolvedCount = stats?.resolved?.toLocaleString() ?? '—'

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.08)_0%,_transparent_50%)]" />
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -left-32 top-32 -z-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-3.5 w-3.5" />
                Civic Technology Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-bold tracking-tight text-secondary sm:text-5xl lg:text-6xl"
            >
              Report Road Issues.{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Build Better Communities.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-muted sm:text-xl"
            >
              SadakSewa connects citizens with municipal workers to report and resolve
              road-related issues — from potholes and drainage problems to broken
              streetlights and traffic signals.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Reporting
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" size="lg">
                  View Public Reports
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="glass rounded-2xl border border-white/60 p-2 shadow-xl shadow-secondary/5">
              <div className="overflow-hidden rounded-xl bg-white">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-danger/80" />
                  <div className="h-3 w-3 rounded-full bg-warning/80" />
                  <div className="h-3 w-3 rounded-full bg-accent/80" />
                  <span className="ml-2 text-xs text-muted">SadakSewa Dashboard Preview</span>
                </div>
                <div className="grid gap-4 p-6 sm:grid-cols-3">
                  {[
                    { label: 'Open Reports', value: openCount, color: 'text-warning' },
                    { label: 'In Progress', value: inProgressCount, color: 'text-primary' },
                    { label: 'Resolved', value: resolvedCount, color: 'text-accent' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border bg-background p-4 text-center"
                    >
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="mt-1 text-xs text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {[
              { value: totalReports, label: 'Reports Submitted' },
              { value: resolutionRate, label: 'Resolution Rate' },
              { value: avgTime, label: 'Avg. Response Time' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-secondary sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
              Everything you need to improve your roads
            </h2>
            <p className="mt-4 text-muted">
              A complete platform for citizens, workers, and administrators to collaborate
              on civic infrastructure.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-2xl border border-border bg-white p-6 shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-secondary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-slate-400">
              Three simple steps to make a difference in your community.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
                  {index + 1}
                </div>
                <p className="mt-4 text-base font-medium text-white">{step}</p>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-6 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/50 to-transparent md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-16 text-center sm:px-16"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
            <div className="relative">
              <CheckCircle2 className="mx-auto h-12 w-12 text-white/80" />
              <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
                Ready to improve your roads?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-light/90">
                Join SadakSewa today and be part of the movement towards safer, better
                maintained roads in your municipality.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" variant="secondary">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
        </section>
      )}
    </div>
  )
}
