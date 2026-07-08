import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card, { CardHeader } from '../../components/common/Card'
import { FormField, Input, Textarea } from '../../components/common/Input'
import { validateEmail, validateRequired } from '../../utils/validators'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'Bimalbhandari563@gmail.com',
    href: 'mailto:Bimalbhandari563@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+977 9816604620',
    href: 'tel:+9779816604620',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Pokhara, Nepal',
    href: null,
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {
      name: validateRequired(form.name, 'Name'),
      email: validateEmail(form.email),
      subject: validateRequired(form.subject, 'Subject'),
      message: validateRequired(form.message, 'Message'),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // Simulated submit — no backend contact endpoint yet
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success('Message sent! We will get back to you soon.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <MessageSquare strokeWidth={1.5} className="h-4 w-4" />
          Contact Us
        </div>
        <h1 className="text-3xl font-bold text-secondary sm:text-4xl">Get in Touch</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Have a question, feedback, or partnership inquiry? We would love to hear from you.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Contact Info */}
        <div className="space-y-4 lg:col-span-2">
          {contactInfo.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="flex items-start gap-4 !p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block text-sm font-medium text-secondary hover:text-primary"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-secondary">{item.value}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}

          <Card className="bg-primary/5 border-primary/20 !p-5">
            <p className="text-sm text-secondary">
              For urgent road safety emergencies, please contact your local municipality
              directly or dial the national emergency hotline.
            </p>
          </Card>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader
              title="Send a Message"
              subtitle="Fill out the form and our team will respond within 2 business days"
            />
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Full name" error={errors.name} required>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    error={errors.name}
                  />
                </FormField>
                <FormField label="Email" error={errors.email} required>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    error={errors.email}
                  />
                </FormField>
              </div>

              <FormField label="Subject" error={errors.subject} required>
                <Input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  error={errors.subject}
                />
              </FormField>

              <FormField label="Message" error={errors.message} required>
                <Textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={6}
                  error={errors.message}
                />
              </FormField>

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={!isSubmitting && <Send strokeWidth={1.5} className="h-4 w-4" />}
              >
                Send Message
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
