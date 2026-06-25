const services = [
  {
    icon: '❤️',
    title: 'Personal Care',
    description: 'Assistance with daily activities, hygiene, and personal needs tailored to individual requirements.',
  },
  {
    icon: '🛡️',
    title: 'Companion Care',
    description: 'Social engagement, emotional support, and companionship to enhance quality of life.',
  },
  {
    icon: '👥',
    title: 'Elder Care',
    description: 'Specialized support for seniors including medication reminders and mobility assistance.',
  },
  {
    icon: '📅',
    title: 'Respite Care',
    description: 'Temporary relief for family caregivers, ensuring continuous, professional support.',
  },
]

export function ServicesSection() {
  return (
    <section
      id="services"
      style={{
        paddingTop: 'clamp(3rem, 10vw, 4rem)',
        paddingBottom: 'clamp(3rem, 10vw, 4rem)',
        paddingLeft: 'clamp(1rem, 5vw, 1.5rem)',
        paddingRight: 'clamp(1rem, 5vw, 1.5rem)',
        background: 'var(--color-background)',
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
              color: 'var(--color-foreground)',
            }}
          >
            Our Services
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
            We offer a comprehensive range of professional homecare services designed to meet your unique needs.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {services.map((service) => (
            <div
              key={service.title}
              style={{
                padding: '1.5rem',
                background: 'var(--color-card)',
                borderRadius: '1rem',
                border: '1px solid var(--color-border)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(69, 39, 19, 0.1)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'none'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'var(--color-accent)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: 'var(--color-accent-foreground)',
                  fontSize: '1.75rem',
                }}
              >
                {service.icon}
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: 'var(--color-foreground)',
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--color-muted-foreground)',
                  lineHeight: 1.6,
                }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
