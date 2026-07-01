import { COMPANY } from './company'

// Servicios mapeados exactamente de los flyers
export const SERVICE_TYPES = {
  'companionship': {
    es: 'Compañía y conversación',
    en: 'Companionship'
  },
  'meal-preparation': {
    es: 'Preparación de comidas',
    en: 'Meal Preparation'
  },
  'errands-shopping': {
    es: 'Compras y mandados',
    en: 'Errands & Shopping'
  },
  'transportation': {
    es: 'Transporte a citas',
    en: 'Transportation'
  },
  'medication-reminders': {
    es: 'Recordatorios de medicamentos',
    en: 'Medication Reminders'
  },
  'light-housekeeping': {
    es: 'Ayuda ligera en el hogar',
    en: 'Light Housekeeping'
  },
  'personal-care': {
    es: 'Apoyo con actividades diarias (baño, vestimenta, movilidad)',
    en: 'Personal Care (bathing, dressing, mobility)'
  }
}

// Opciones para requisitos especiales (adaptadas)
export const SPECIAL_REQUIREMENTS_OPTIONS = [
  { value: 'wheelchair-access', es: 'Accesibilidad para silla de ruedas', en: 'Wheelchair accessibility' },
  { value: 'specialized-nurse', es: 'Enfermera especializada', en: 'Specialized nurse' },
  { value: 'medical-equipment', es: 'Equipo médico especializado', en: 'Specialized medical equipment' },
  { value: 'sign-interpretation', es: 'Interpretación de señas', en: 'Sign language interpretation' },
  { value: 'transport-included', es: 'Transporte incluido', en: 'Transportation included' }
]

// Pasos del formulario (títulos)
export const FORM_STEPS = [
  { fields: ['fullName', 'email', 'phone'], title: { es: 'Datos personales', en: 'Personal Info' } },
  { fields: ['serviceType', 'preferredDate', 'preferredTime', 'duration'], title: { es: 'Servicio', en: 'Service' } },
  { fields: ['address.street', 'address.city', 'address.zipCode'], title: { es: 'Ubicación', en: 'Location' } },
  { fields: ['description'], title: { es: 'Necesidades', en: 'Needs' } },
  { fields: ['emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship', 'acceptTerms'], title: { es: 'Emergencia', en: 'Emergency' } }
]