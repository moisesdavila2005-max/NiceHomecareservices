export function HeroSection() {
  return (
    <section
      style={{
        paddingTop: 'clamp(2.5rem, 10vw, 4rem)',
        paddingBottom: 'clamp(2.5rem, 10vw, 4rem)',
        paddingLeft: 'clamp(1rem, 5vw, 1.5rem)',
        paddingRight: 'clamp(1rem, 5vw, 1.5rem)',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #d4563c 100%)',
        color: 'var(--color-primary-foreground)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}
        >
          Compassionate Care, Professional Excellence
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            marginBottom: '2rem',
            opacity: 0.95,
            lineHeight: 1.6,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Connect with vetted, caring professionals who bring compassion and expertise to every moment. We&apos;re dedicated to enhancing quality of life through personalized homecare solutions.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="#services"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'var(--color-primary-foreground)',
              color: 'var(--color-primary)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              textDecoration: 'none',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)'
              ;(e.target as HTMLElement).style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)'
              ;(e.target as HTMLElement).style.boxShadow = 'none'
            }}
          >
            Find a Caregiver
          </a>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'transparent',
              color: 'var(--color-primary-foreground)',
              border: '2px solid var(--color-primary-foreground)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLElement).style.background = 'var(--color-primary-foreground)'
              ;(e.target as HTMLElement).style.color = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLElement).style.background = 'transparent'
              ;(e.target as HTMLElement).style.color = 'var(--color-primary-foreground)'
            }}
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
