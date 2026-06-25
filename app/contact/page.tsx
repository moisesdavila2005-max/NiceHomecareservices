'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  Heading,
  Text,
  TextInput,
  Textarea,
  PageLayout,
  Select,
  Checkbox,
  Stack,
  Label,
  Link,
  Flash,
} from '@primer/react'
import { MailIcon, GitBranchIcon, CheckIcon } from '@primer/octicons-react'

type FormData = {
  name: string
  email: string
  subject: string
  category: string
  message: string
  subscribe: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    subscribe: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
        subscribe: false,
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  return (
    <PageLayout>
      <PageLayout.Content>
        <Box sx={{ py: [3, 4, 5], px: [3, 4] }}>
          {/* Header */}
          <Box sx={{ mb: 6, maxWidth: '600px' }}>
            <Heading as="h1" sx={{ fontSize: 6, mb: 2 }}>
              Get in Touch
            </Heading>
            <Text as="p" sx={{ fontSize: 3, color: 'fg.muted', lineHeight: 1.5 }}>
              Have a question or feedback? We&apos;d love to hear from you. Send us a message and
              we&apos;ll respond as soon as possible.
            </Text>
          </Box>

          {/* Success Message */}
          {submitSuccess && (
            <Box sx={{ mb: 4 }}>
              <Flash variant="success">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckIcon />
                  <Box>
                    <Text sx={{ fontWeight: 'bold' }}>Message sent successfully!</Text>
                    <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                      Thank you for reaching out. We&apos;ll get back to you shortly.
                    </Text>
                  </Box>
                </Box>
              </Flash>
            </Box>
          )}

          {/* Contact Form */}
          <Box
            as="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: '600px',
              backgroundColor: 'canvas.default',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              p: 4,
            }}
          >
            <Stack direction="vertical" gap={4}>
              {/* Name Field */}
              <FormControl>
                <FormControl.Label sx={{ fontWeight: 'bold' }}>Name</FormControl.Label>
                <TextInput
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  sx={{
                    borderColor: errors.name ? 'danger.emphasis' : undefined,
                  }}
                  aria-label="Name"
                />
                {errors.name && (
                  <FormControl.Validation variant="error">{errors.name}</FormControl.Validation>
                )}
              </FormControl>

              {/* Email Field */}
              <FormControl>
                <FormControl.Label sx={{ fontWeight: 'bold' }}>Email</FormControl.Label>
                <TextInput
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{
                    borderColor: errors.email ? 'danger.emphasis' : undefined,
                  }}
                  aria-label="Email"
                />
                {errors.email && (
                  <FormControl.Validation variant="error">{errors.email}</FormControl.Validation>
                )}
              </FormControl>

              {/* Subject Field */}
              <FormControl>
                <FormControl.Label sx={{ fontWeight: 'bold' }}>Subject</FormControl.Label>
                <TextInput
                  name="subject"
                  type="text"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  sx={{
                    borderColor: errors.subject ? 'danger.emphasis' : undefined,
                  }}
                  aria-label="Subject"
                />
                {errors.subject && (
                  <FormControl.Validation variant="error">{errors.subject}</FormControl.Validation>
                )}
              </FormControl>

              {/* Category Select */}
              <FormControl>
                <FormControl.Label sx={{ fontWeight: 'bold' }}>Category</FormControl.Label>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  aria-label="Category"
                >
                  <Select.OptGroup label="General">
                    <Select.Option value="general">General Inquiry</Select.Option>
                  </Select.OptGroup>
                  <Select.OptGroup label="Support">
                    <Select.Option value="support">Technical Support</Select.Option>
                    <Select.Option value="billing">Billing Question</Select.Option>
                    <Select.Option value="account">Account Help</Select.Option>
                  </Select.OptGroup>
                  <Select.OptGroup label="Other">
                    <Select.Option value="feedback">Feedback</Select.Option>
                    <Select.Option value="partnership">Partnership</Select.Option>
                  </Select.OptGroup>
                </Select>
              </FormControl>

              {/* Message Field */}
              <FormControl>
                <FormControl.Label sx={{ fontWeight: 'bold' }}>
                  Message
                  <Text sx={{ fontSize: 1, color: 'fg.muted', fontWeight: 'normal', ml: 1 }}>
                    (minimum 10 characters)
                  </Text>
                </FormControl.Label>
                <Textarea
                  name="message"
                  placeholder="Please describe your message in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  sx={{
                    borderColor: errors.message ? 'danger.emphasis' : undefined,
                  }}
                  aria-label="Message"
                />
                {errors.message && (
                  <FormControl.Validation variant="error">{errors.message}</FormControl.Validation>
                )}
              </FormControl>

              {/* Subscribe Checkbox */}
              <FormControl>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox
                    name="subscribe"
                    checked={formData.subscribe}
                    onChange={handleChange}
                    aria-label="Subscribe to updates"
                  />
                  <Label sx={{ mb: 0, cursor: 'pointer', userSelect: 'none' }}>
                    Subscribe to our newsletter for updates and news
                  </Label>
                </Box>
              </FormControl>

              {/* Privacy Notice */}
              <Text sx={{ fontSize: 1, color: 'fg.muted', lineHeight: 1.5 }}>
                By submitting this form, you agree to our{' '}
                <Link href="/privacy">privacy policy</Link> and{' '}
                <Link href="/terms">terms of service</Link>.
              </Text>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ flex: 1 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
                <Button
                  type="reset"
                  variant="default"
                  size="large"
                  onClick={() => {
                    setFormData({
                      name: '',
                      email: '',
                      subject: '',
                      category: 'general',
                      message: '',
                      subscribe: false,
                    })
                    setErrors({})
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Stack>
          </Box>

          {/* Contact Info Cards */}
          <Box sx={{ mt: 8 }}>
            <Heading as="h2" sx={{ fontSize: 4, mb: 4 }}>
              Other Ways to Reach Us
            </Heading>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: ['1fr', '1fr 1fr'],
                gap: 3,
              }}
            >
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 2,
                  p: 4,
                  backgroundColor: 'canvas.subtle',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <MailIcon sx={{ color: 'fg.emphasis' }} />
                  <Heading as="h3" sx={{ fontSize: 2 }}>
                    Email
                  </Heading>
                </Box>
                <Text sx={{ color: 'fg.muted' }}>
                  <Link href="mailto:support@example.com">support@example.com</Link>
                </Text>
              </Box>

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 2,
                  p: 4,
                  backgroundColor: 'canvas.subtle',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <GitBranchIcon sx={{ color: 'fg.emphasis' }} />
                  <Heading as="h3" sx={{ fontSize: 2 }}>
                    Response Time
                  </Heading>
                </Box>
                <Text sx={{ color: 'fg.muted' }}>We typically respond within 24 hours</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </PageLayout.Content>
    </PageLayout>
  )
}
