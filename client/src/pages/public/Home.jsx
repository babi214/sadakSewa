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
  'Report it with photo & location',
  'Track it until it gets resolved',
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/reports/stats').then(({ data }) => {
      if (data.success) setStats(data.stats)
    }).catch(() => {})
  }, [])

  const totalReports = stats?.totalReports?.toLocaleString() ?? '\u2014'
  const resolutionRate = stats ? `${stats.resolutionRate}%` : '\u2014'
  const avgTime = '3-4 hrs'
  const openCount = stats?.pending?.toLocaleString() ?? '\u2014'
  const inProgressCount = stats?.inProgress?.toLocaleString() ?? '\u2014'
  const resolvedCount = stats?.resolved?.toLocaleString() ?? '\u2014'

  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(27,75,94,0.08)_0%,_transparent_50%)]" />
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -left-32 top-32 -z-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap strokeWidth={1.5} className="h-3.5 w-3.5" />
                Civic Technology Platform
              </span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-secondary sm:text-5xl lg:text-6xl">
              Report Road Issues.{' '}
              <span className="text-primary">Track Until Resolved.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              SadakSewa connects citizens with municipal workers to report and resolve
              road-related issues &mdash; from potholes and drainage problems to broken
              streetlights and traffic signals.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight strokeWidth={1.5} className="h-4 w-4" />}>
                  Start Reporting
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" size="lg">
                  View Public Reports
                </Button>
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-xl border border-border bg-white p-2 shadow-card">
              <div className="overflow-hidden rounded-lg bg-white">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-status-rejected/80" />
                  <div className="h-3 w-3 rounded-full bg-warning/80" />
                  <div className="h-3 w-3 rounded-full bg-accent/80" />
                  <span className="ml-2 text-xs text-muted">SadakSewa Dashboard</span>
                </div>
                <div className="grid gap-4 p-6 sm:grid-cols-3">
                  {[
                    { label: 'Open Reports', value: openCount, color: 'text-warning' },
                    { label: 'In Progress', value: inProgressCount, color: 'text-status-in-progress' },
                    { label: 'Resolved', value: resolvedCount, color: 'text-accent' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border bg-background p-4 text-center"
                    >
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="mt-1 text-xs text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {[
              { value: totalReports, label: 'Reports Submitted' },
              { value: resolutionRate, label: 'Resolution Rate' },
              { value: avgTime, label: 'Avg. Response Time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-secondary sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
              Everything you need to improve your roads
            </h2>
            <p className="mt-4 text-muted">
              A complete platform for citizens, workers, and administrators to collaborate
              on civic infrastructure.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-white p-6 shadow-card transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors">
                  <feature.icon strokeWidth={1.5} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-secondary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-slate-400">
              Three simple steps to make a difference in your community.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
                  {index + 1}
                </div>
                <p className="mt-4 text-base font-medium text-white">{step}</p>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-6 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/50 to-transparent md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-xl bg-primary px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
              <div className="relative">
                <CheckCircle2 strokeWidth={1.5} className="mx-auto h-12 w-12 text-white/80" />
                <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
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
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
