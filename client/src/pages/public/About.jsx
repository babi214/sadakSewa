import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  Shield,
  Target,
  Users,
} from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description:
      'We connect citizens with municipal services to resolve road issues faster and more transparently.',
  },
  {
    icon: Shield,
    title: 'Accountability',
    description:
      'Every report is tracked from submission to resolution with a full audit trail and status history.',
  },
  {
    icon: Users,
    title: 'Community First',
    description:
      'Citizens, workers, and administrators collaborate on a single platform to improve public infrastructure.',
  },
  {
    icon: Heart,
    title: 'Public Service',
    description:
      'Built as a civic technology solution to make roads safer and communities more livable across Nepal.',
  },
]

const team = [
  { name: 'Bimal Bhandari', role: 'Developer' },
  { name: 'Krishna Prasad Lamichhane', role: 'Developer' },
]

export default function About() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-secondary py-20 text-white sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.4)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm">
              <MapPin strokeWidth={1.5} className="h-4 w-4 text-primary-light" />
              About SadakSewa
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Building better roads, together
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              SadakSewa is a civic issue reporting platform that empowers citizens to report
              road-related problems — from potholes and broken streetlights to drainage issues —
              and enables municipalities to respond efficiently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-secondary">Our Story</h2>
              <p className="mt-4 leading-relaxed text-muted">
                Road infrastructure affects every citizen daily. Yet reporting issues to local
                authorities has traditionally been slow, opaque, and difficult to track. SadakSewa
                was created to change that.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                Developed as a Final Year Project, SadakSewa bridges the gap between citizens
                who spot problems and the workers who fix them — with administrators overseeing
                the entire workflow from a unified dashboard.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'GPS-pinned reports with photo evidence',
                  'Real-time status tracking and history',
                  'Role-based dashboards for all stakeholders',
                  'Community upvoting to prioritize critical issues',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-secondary">
                    <CheckCircle2 strokeWidth={1.5} className="h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {values.map((value, index) => (
                <Card key={value.title} hover className="!p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <value.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold text-secondary">{value.title}</h3>
                  <p className="mt-1 text-sm text-muted">{value.description}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="border-y border-border bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-secondary">About This Project</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted">
            SadakSewa is a BCA 8th Semester Final Year Project developed as a civic issue
            reporting platform to bridge the gap between citizens and municipal services.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {team.map((member) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-background p-6 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-secondary">{member.name}</h3>
                <p className="mt-1 text-sm text-muted">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary">Join the movement</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Whether you are a citizen reporting an issue or a municipality looking to improve
            response times, SadakSewa is built for you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg" rightIcon={<ArrowRight strokeWidth={1.5} className="h-4 w-4" />}>
                Get Started
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
