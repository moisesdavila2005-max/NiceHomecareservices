// components/advanced-form.tsx
"use client"

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, Trash2, Upload, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const consultationSchema = z.object({
  // Información personal
  fullName: z.string()
    .min(3, 'Nombre completo es requerido')
    .regex(/^[a-zA-ZáéíóúñÑ\s]+$/, 'Solo letras y espacios'),
  
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido'),
  
  phone: z.string()
    .regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/, 'Teléfono inválido'),
  
  // Información del servicio
  serviceType: z.enum(['elderly-care', 'medical-assistance', 'physical-therapy', 'companionship'], {
    errorMap: () => ({ message: 'Selecciona un tipo de servicio' })
  }),
  
  preferredDate: z.date({
    required_error: 'Selecciona una fecha preferida',
  }).min(new Date(), 'La fecha debe ser futura'),
  
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  
  duration: z.number().min(1, 'Duración mínima 1 hora').max(24, 'Duración máxima 24 horas'),
  
  // Dirección
  address: z.object({
    street: z.string().min(5, 'Dirección completa requerida'),
    city: z.string().min(2, 'Ciudad requerida'),
    zipCode: z.string().regex(/^\d{5}$/, 'Código postal inválido (5 dígitos)'),
  }),
  
  // Detalles adicionales
  description: z.string()
    .min(20, 'Describe el servicio que necesitas (mínimo 20 caracteres)')
    .max(1000, 'Máximo 1000 caracteres'),
  
  specialRequirements: z.array(z.string()).optional(),
  
  hasPet: z.boolean().default(false),
  hasAllergies: z.boolean().default(false),
  
  allergies: z.string().optional(),
  
  emergencyContact: z.object({
    name: z.string().min(2, 'Nombre del contacto de emergencia'),
    phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/, 'Teléfono inválido'),
    relationship: z.string().min(2, 'Parentesco requerido'),
  }),
  
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  }),
  
  acceptCommunications: z.boolean().default(false),
})

type ConsultationFormData = z.infer<typeof consultationSchema>

const serviceTypes = {
  'elderly-care': 'Cuidado de Ancianos',
  'medical-assistance': 'Asistencia Médica',
  'physical-therapy': 'Terapia Física',
  'companionship': 'Compañía'
}

const specialRequirementsOptions = [
  'Accesibilidad para silla de ruedas',
  'Enfermera especializada',
  'Equipo médico especializado',
  'Interpretación de señas',
  'Transporte incluido'
]

export function AdvancedConsultationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      specialRequirements: [],
      hasPet: false,
      hasAllergies: false,
      acceptTerms: false,
      acceptCommunications: false,
      duration: 1
    }
  })

  const hasAllergies = watch('hasAllergies')
  const selectedService = watch('serviceType')
  const preferredDate = watch('preferredDate')
  const specialRequirements = watch('specialRequirements')

  const steps = [
    { title: 'Información Personal', fields: ['fullName', 'email', 'phone'] },
    { title: 'Detalles del Servicio', fields: ['serviceType', 'preferredDate', 'preferredTime', 'duration'] },
    { title: 'Ubicación', fields: ['address.street', 'address.city', 'address.zipCode'] },
    { title: 'Necesidades Específicas', fields: ['description'] },
    { title: 'Emergencias y Términos', fields: ['emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship'] }
  ]

  const nextStep = async () => {
    const fieldsToValidate = steps[currentStep].fields
    const isValid = await trigger(fieldsToValidate as any)
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setSubmitSuccess(true)
        // Enviar a CRM
        await fetch('/api/crm/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            source: 'website',
            timestamp: new Date().toISOString()
          })
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg"
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="size-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h3>
        <p className="text-muted-foreground mb-4">
          Nos pondremos en contacto contigo en las próximas 24 horas para confirmar los detalles.
        </p>
        <p className="text-sm text-muted-foreground">
          Número de referencia: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "text-xs font-medium",
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step.title}
            </div>
          ))}
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
            animate={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Step 1: Información Personal */}
          {currentStep === 0 && (
            <>
              <div>
                <label className="text-sm font-medium">Nombre Completo *</label>
                <Input
                  {...register('fullName')}
                  placeholder="Juan Pérez"
                  className={errors.fullName && "border-red-500"}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="juan@ejemplo.com"
                  className={errors.email && "border-red-500"}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Teléfono *</label>
                <Input
                  {...register('phone')}
                  placeholder="+1 234 567 8900"
                  className={errors.phone && "border-red-500"}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </>
          )}

          {/* Step 2: Detalles del Servicio */}
          {currentStep === 1 && (
            <>
              <div>
                <label className="text-sm font-medium">Tipo de Servicio *</label>
                <Select onValueChange={(value) => setValue('serviceType', value as any)}>
                  <SelectTrigger className={errors.serviceType && "border-red-500"}>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(serviceTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceType && (
                  <p className="text-sm text-red-500 mt-1">{errors.serviceType.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Fecha Preferida *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !preferredDate && "text-muted-foreground",
                        errors.preferredDate && "border-red-500"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {preferredDate ? format(preferredDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={preferredDate}
                      onSelect={(date) => setValue('preferredDate', date!)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.preferredDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.preferredDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Hora Preferida *</label>
                <Input
                  {...register('preferredTime')}
                  type="time"
                  className={errors.preferredTime && "border-red-500"}
                />
                {errors.preferredTime && (
                  <p className="text-sm text-red-500 mt-1">{errors.preferredTime.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Duración (horas) *</label>
                <Input
                  {...register('duration', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="24"
                  className={errors.duration && "border-red-500"}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
                )}
              </div>
            </>
          )}

          {/* Step 3: Ubicación */}
          {currentStep === 2 && (
            <>
              <div>
                <label className="text-sm font-medium">Calle y Número *</label>
                <Input
                  {...register('address.street')}
                  placeholder="Calle Principal 123"
                  className={errors.address?.street && "border-red-500"}
                />
                {errors.address?.street && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.street.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Ciudad *</label>
                <Input
                  {...register('address.city')}
                  placeholder="Ciudad"
                  className={errors.address?.city && "border-red-500"}
                />
                {errors.address?.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Código Postal *</label>
                <Input
                  {...register('address.zipCode')}
                  placeholder="12345"
                  className={errors.address?.zipCode && "border-red-500"}
                />
                {errors.address?.zipCode && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.zipCode.message}</p>
                )}
              </div>
            </>
          )}

          {/* Step 4: Necesidades Específicas */}
          {currentStep === 3 && (
            <>
              <div>
                <label className="text-sm font-medium">Descripción detallada del servicio *</label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe en detalle el tipo de cuidado que necesitas..."
                  rows={5}
                  className={errors.description && "border-red-500"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 20 caracteres. Incluye información sobre horarios, necesidades especiales, etc.
                </p>
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Requisitos Especiales</label>
                <div className="space-y-2 mt-2">
                  {specialRequirementsOptions.map((req) => (
                    <label key={req} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={req}
                        checked={specialRequirements?.includes(req)}
                        onChange={(e) => {
                          const current = specialRequirements || []
                          if (e.target.checked) {
                            setValue('specialRequirements', [...current, req])
                          } else {
                            setValue('specialRequirements', current.filter(r => r !== req))
                          }
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{req}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={watch('hasPet')}
                    onCheckedChange={(checked) => setValue('hasPet', checked as boolean)}
                  />
                  <span className="text-sm">Tengo mascotas en casa</span>
                </label>

                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={watch('hasAllergies')}
                    onCheckedChange={(checked) => setValue('hasAllergies', checked as boolean)}
                  />
                  <span className="text-sm">Tengo alergias</span>
                </label>

                {hasAllergies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-6"
                  >
                    <Textarea
                      {...register('allergies')}
                      placeholder="Describe tus alergias..."
                      rows={3}
                    />
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Step 5: Emergencias y Términos */}
          {currentStep === 4 && (
            <>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Phone className="size-4" />
                  Contacto de Emergencia
                </h4>
                <div className="space-y-3">
                  <Input
                    {...register('emergencyContact.name')}
                    placeholder="Nombre completo"
                    className={errors.emergencyContact?.name && "border-red-500"}
                  />
                  <Input
                    {...register('emergencyContact.phone')}
                    placeholder="Teléfono"
                    className={errors.emergencyContact?.phone && "border-red-500"}
                  />
                  <Input
                    {...register('emergencyContact.relationship')}
                    placeholder="Parentesco (ej: Hijo, Hermano, etc.)"
                    className={errors.emergencyContact?.relationship && "border-red-500"}
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 border border-border rounded-lg">
                <label className="flex items-start gap-2">
                  <Checkbox
                    checked={watch('acceptTerms')}
                    onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                  />
                  <span className="text-sm">
                    Acepto los <a href="/terms" className="text-primary hover:underline">términos y condiciones</a> y la{' '}
                    <a href="/privacy" className="text-primary hover:underline">política de privacidad</a>
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <Checkbox
                    checked={watch('acceptCommunications')}
                    onCheckedChange={(checked) => setValue('acceptCommunications', checked as boolean)}
                  />
                  <span className="text-sm">
                    Deseo recibir comunicaciones sobre promociones y novedades
                  </span>
                </label>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={nextStep}>
            Siguiente
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Solicitud'
            )}
          </Button>
        )}
      </div>
    </form>
  )
}