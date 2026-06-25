const testimonials = [
  {
    name: 'Margaret Thompson',
    relation: 'Daughter',
    quote: 'The care provided to my mother has been exceptional. The team treats her with such dignity and compassion. We feel completely confident leaving her in their hands.',
    rating: 5,
  },
  {
    name: 'David Martinez',
    relation: 'Son',
    quote: 'After my father\'s surgery, this team provided exactly the support we needed. Professional, reliable, and genuinely caring. Couldn\'t ask for better.',
    rating: 5,
  },
  {
    name: 'Patricia Liu',
    relation: 'Wife',
    quote: 'My husband\'s caregiver Sarah has become like family. She\'s attentive, patient, and always goes above and beyond. Our whole family is grateful.',
    rating: 5,
  },
  {
    name: 'Robert Johnson',
    relation: 'Son',
    quote: 'Finding reliable, compassionate care was stressful until we found this agency. They\'ve given us peace of mind and our mother the respect she deserves.',
    rating: 5,
  },
]

export function TestimonialsSection() {
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
            What Families Say
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
            Real stories from families who trust us with their loved ones.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              style={{
                padding: '1.5rem',
                background: 'var(--color-card)',
                borderRadius: '1rem',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} style={{ color: 'var(--color-accent)', fontSize: '1.25rem' }}>
                    ⭐
                  </span>
                ))}
              </div>

              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--color-foreground)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  flex: 1,
                  fontStyle: 'italic',
                }}
              >
                "{testimonial.quote}"
              </p>

              <div>
                <p
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--color-foreground)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {testimonial.name}
                </p>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-muted-foreground)',
                  }}
                >
                  {testimonial.relation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
