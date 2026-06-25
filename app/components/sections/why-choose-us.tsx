const reasons = [
  {
    icon: '✓',
    title: 'Vetted Professionals',
    description: 'All caregivers undergo thorough background checks, training, and certification.',
    stat: '500+',
    statLabel: 'Verified Caregivers',
  },
  {
    icon: '⭐',
    title: '24/7 Support',
    description: 'Our care coordinators are available around the clock to ensure continuity of care.',
    stat: '99%',
    statLabel: 'Satisfaction Rate',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'HIPAA-compliant systems protect your sensitive health information.',
    stat: '100%',
    statLabel: 'Confidentiality',
  },
  {
    icon: '📈',
    title: 'Personalized Plans',
    description: 'Custom care plans developed with families and healthcare professionals.',
    stat: '10k+',
    statLabel: 'Families Served',
  },
]

export function WhyChooseUs() {
  return (
    <section
      style={{
        paddingTop: 'clamp(3rem, 10vw, 4rem)',
        paddingBottom: 'clamp(3rem, 10vw, 4rem)',
        paddingLeft: 'clamp(1rem, 5vw, 1.5rem)',
        paddingRight: 'clamp(1rem, 5vw, 1.5rem)',
        background: 'var(--color-secondary)',
        color: 'var(--color-foreground)',
      }}
    >
      <div style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Why Choose Us
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-muted-foreground)',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}
          >
            We combine expertise, compassion, and technology to deliver exceptional homecare services.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {reasons.map((reason) => (
            <div
              key={reason.title}
              style={{
                padding: '2rem',
                background: 'var(--color-card)',
                borderRadius: '1.25rem',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '4px solid var(--color-primary)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 16px 32px rgba(69, 39, 19, 0.1)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'none'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--color-accent)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    color: 'var(--color-accent-foreground)',
                    fontSize: '1.5rem',
                  }}
                >
                  {reason.icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: 'var(--color-foreground)',
                  }}
                >
                  {reason.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-muted-foreground)',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}
                >
                  {reason.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {reason.stat}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-muted-foreground)',
                    fontWeight: 500,
                  }}
                >
                  {reason.statLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
