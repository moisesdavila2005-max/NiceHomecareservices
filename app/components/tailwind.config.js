// tailwind.config.js (si no existe, créalo)
module.exports = {
  theme: {
    extend: {
      animation: {
        'slide-in-from-top-5': 'slideInFromTop 0.2s ease-out',
      },
      keyframes: {
        slideInFromTop: {
          '0%': { transform: 'translateY(-5px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
}