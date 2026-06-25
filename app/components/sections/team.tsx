const team = [
  {
    name: 'Sarah Johnson',
    role: 'Certified Caregiver',
    years: '8+ years experience',
    expertise: ['Senior Care', 'Mobility Assistance', 'Medication Management'],
  },
  {
    name: 'Michael Chen',
    role: 'Senior Care Specialist',
    years: '12+ years experience',
    expertise: ['Dementia Care', 'Post-Surgery Recovery', 'Palliative Care'],
  },
  {
    name: 'Elena Rodriguez',
    role: 'Personal Care Attendant',
    years: '6+ years experience',
    expertise: ['Daily Living Support', 'Companionship', 'Recreational Activities'],
  },
  {
    name: 'James Williams',
    role: 'Care Coordinator',
    years: '10+ years experience',
    expertise: ['Care Planning', 'Family Coordination', 'Medical Records'],
  },
]

export function TeamSection() {
  return (
    <section
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
            }}
          >
            Meet Our Team
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
            Our caregivers are compassionate professionals dedicated to providing exceptional care.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {team.map((member) => (
            <div
              key={member.name}
              style={{
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'none'
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #d4563c 100%)',
                  borderRadius: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-foreground)',
                }}
              >
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>

              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                  color: 'var(--color-foreground)',
                }}
              >
                {member.name}
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  marginBottom: '0.25rem',
                }}
              >
                {member.role}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-muted-foreground)',
                  marginBottom: '1rem',
                }}
              >
                {member.years}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  justifyContent: 'center',
                }}
              >
                {member.expertise.map((skill) => (
                  <div
                    key={skill}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'var(--color-secondary)',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--color-secondary-foreground)',
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
