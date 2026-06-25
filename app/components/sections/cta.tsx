'use client'

import { useState } from 'react'

export function CTASection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section
      style={{
        paddingTop: 'clamp(3rem, 10vw, 4rem)',
        paddingBottom: 'clamp(3rem, 10vw, 4rem)',
        paddingLeft: 'clamp(1rem, 5vw, 1.5rem)',
        paddingRight: 'clamp(1rem, 5vw, 1.5rem)',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #d4563c 100%)',
        color: 'var(--color-primary-foreground)',
      }}
    >
      <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Ready to Enhance Your Loved One&apos;s Quality of Life?
          </h2>

          <p
            style={{
              fontSize: '1.125rem',
              marginBottom: '2rem',
              opacity: 0.95,
              lineHeight: 1.6,
            }}
          >
            Connect with our team today for a free consultation. We&apos;ll discuss your needs and find the perfect caregiver match.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexDirection: 'column',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: 'var(--color-primary-foreground)',
                color: 'var(--color-foreground)',
              }}
              aria-label="Email address"
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                background: 'var(--color-accent)',
                color: 'var(--color-accent-foreground)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLElement).style.transform = 'none'
                ;(e.target as HTMLElement).style.boxShadow = 'none'
              }}
            >
              Get Started
            </button>
          </form>

          {submitted && (
            <div
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'var(--color-primary-foreground)',
                color: 'var(--color-primary)',
                borderRadius: '0.5rem',
                fontWeight: 500,
              }}
            >
              ✓ Thanks! We&apos;ll be in touch shortly.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
