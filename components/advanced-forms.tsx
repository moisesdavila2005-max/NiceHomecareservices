// components/advanced-form.tsx
"use client"

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Phone, Calendar, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { SERVICE_TYPES, SPECIAL_REQUIREMENTS_OPTIONS, FORM_STEPS } from '@/lib/constants'
import { COMPANY } from '@/lib/company'
import { getTranslation } from '@/lib/translations'
import { fetchWithRetry } from '@/lib/utils'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { useFormSteps } from '@/hooks/useFormSteps'

const consultationSchema = z.object({
  fullName: z.string().min(3, 'form.required').regex(/^[a-zA-ZáéíóúñÑ\s]+$/, 'Solo letras'),
  email: z.string().email('form.invalidEmail').min(1, 'form.required'),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/, 'form.invalidPhone'),
  serviceType: z.enum(['companionship', 'meal-preparation', 'errands-shopping', 'transportation', 'medication-reminders', 'light-housekeeping', 'personal-care'], {
    errorMap: () => ({ message: 'form.serviceRequired' })
  }),
  preferredDate: z.date({
    required_error: 'form.required',
  }).min(addDays(new Date(), 1), 'form.futureDate'),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM'),
  duration: z.number().min(1, 'form.durationMin').max(24, 'form.durationMax'),
  address: z.object({
    street: z.string().min(5, 'form.required'),
    city: z.string().min(2, 'form.required'),
    zipCode: z.string().regex(/^\d{5}$/, 'form.invalidZip'),
  }),
  description: z.string().min(20, 'form.minLength').max(1000, 'form.maxLength'),
  specialRequirements: z.array(z.string()).optional(),
  hasPet: z.boolean().default(false),
  hasAllergies: z.boolean().default(false),
  allergies: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2, 'form.required'),
    phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/, 'form.invalidPhone'),
    relationship: z.string().min(2, 'form.required'),
  }),
  acceptTerms: z.boolean().refine(val => val === true, { message: 'form.acceptTermsRequired' }),
  acceptCommunications: z.boolean().default(false),
  captcha: z.string().min(1, 'form.required'),
})

type ConsultationFormData = z.infer<typeof consultationSchema>

interface Props {
  lang?: 'es' | 'en'
  onSuccess?: () => void
}

export function AdvancedConsultationForm({ lang = 'es', onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState('')

  const { saveData, loadData, clearData } = useFormPersistence('consultationFormData')
  const { currentStep, nextStep, prevStep, goToStep, isLastStep } = useFormSteps(FORM_STEPS.length)

  const t = (key: string, params?: any) => getTranslation(lang, key, params)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      specialRequirements: [],
      hasPet: false,
      hasAllergies: false,
      acceptTerms: false,
      acceptCommunications: false,
      duration: 1,
      ...loadData()
    }
  })

  const hasAllergies = watch('hasAllergies')
  const preferredDate = watch('preferredDate')
  const specialRequirements = watch('specialRequirements')

  useEffect(() => {
    const subscription = watch((value) => {
      if (Object.keys(value).length > 0) saveData(value)
    })
    return () => subscription.unsubscribe()
  }, [watch, saveData])

  const validateCurrentStep = useCallback(async () => {
    const fields = FORM_STEPS[currentStep].fields as any[]
    return await trigger(fields)
  }, [trigger, currentStep])

  const handleNextStep = useCallback(async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      nextStep()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [validateCurrentStep, nextStep])

  const onSubmit = useCallback(async (data: ConsultationFormData) => {
    if (data.captcha !== '1234') {
      setCaptchaError(t('form.captchaError'))
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)
    setCaptchaError('')

    try {
      const response = await fetchWithRetry('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'website', lang, timestamp: new Date().toISOString() })
      })
      if (!response.ok) throw new Error('HTTP error')

      // Sincronización CRM (opcional)
      try {
        await fetchWithRetry('/api/crm/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source: 'website', lang, timestamp: new Date().toISOString() })
        })
      } catch (crmError) { console.warn('CRM sync failed:', crmError) }

      setSubmitSuccess(true)
      clearData()
      if (onSuccess) onSuccess()
    } catch (error) {
      setSubmitError(t('form.error'))
    } finally {
      setIsSubmitting(false)
    }
  }, [lang, onSuccess, clearData, t])

  if (submitSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="size-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{t('form.success')}</h3>
        <p className="text-muted-foreground mb-4">{t('form.successMessage')}</p>
        <p className="text-sm text-muted-foreground">
          {t('form.reference')} <span className="font-mono">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {FORM_STEPS.map((step, index) => (
            <button key={index} type="button" onClick={() => goToStep(index)}
              className={cn("text-xs font-medium transition-colors",
                index <= currentStep ? "text-primary" : "text-muted-foreground hover:text-primary/70"
              )}>
              {lang === 'es' ? step.title.es : step.title.en}
            </button>
          ))}
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary"
            initial={{ width: `${(currentStep / (FORM_STEPS.length - 1)) * 100}%` }}
            animate={{ width: `${(currentStep / (FORM_STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {submitError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="size-4" /> {submitError}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4">

          {/* Step 1 */}
          {currentStep === 0 && (
            <>
              <div>
                <label className="text-sm font-medium">{t('form.fullName')} *</label>
                <Input {...register('fullName')} placeholder={lang === 'es' ? 'Juan Pérez' : 'John Doe'}
                  className={errors.fullName && "border-red-500"} />
                {errors.fullName && <p className="text-sm text-red-500 mt-1">{t(errors.fullName.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input {...register('email')} type="email" placeholder="juan@ejemplo.com"
                  className={errors.email && "border-red-500"} />
                {errors.email && <p className="text-sm text-red-500 mt-1">{t(errors.email.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.phone')} *</label>
                <Input {...register('phone')} placeholder="+1 234 567 8900"
                  className={errors.phone && "border-red-500"} />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{t(errors.phone.message as string)}</p>}
              </div>
            </>
          )}

          {/* Step 2 */}
          {currentStep === 1 && (
            <>
              <div>
                <label className="text-sm font-medium">{t('form.serviceType')} *</label>
                <Select onValueChange={(value) => setValue('serviceType', value as any)}>
                  <SelectTrigger className={errors.serviceType && "border-red-500"}>
                    <SelectValue placeholder={lang === 'es' ? 'Selecciona un servicio' : 'Select a service'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {lang === 'es' ? label.es : label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceType && <p className="text-sm text-red-500 mt-1">{t(errors.serviceType.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.preferredDate')} *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal",
                      !preferredDate && "text-muted-foreground", errors.preferredDate && "border-red-500")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {preferredDate ? format(preferredDate, 'PPP', { locale: es }) : (lang === 'es' ? 'Selecciona una fecha' : 'Select a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={preferredDate}
                      onSelect={(date) => setValue('preferredDate', date!)}
                      disabled={(date) => date < addDays(new Date(), 1)} initialFocus />
                  </PopoverContent>
                </Popover>
                {errors.preferredDate && <p className="text-sm text-red-500 mt-1">{t(errors.preferredDate.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.preferredTime')} *</label>
                <Input {...register('preferredTime')} type="time" className={errors.preferredTime && "border-red-500"} />
                {errors.preferredTime && <p className="text-sm text-red-500 mt-1">{t(errors.preferredTime.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.duration')} *</label>
                <Input {...register('duration', { valueAsNumber: true })} type="number" min="1" max="24"
                  className={errors.duration && "border-red-500"} />
                {errors.duration && <p className="text-sm text-red-500 mt-1">{t(errors.duration.message as string)}</p>}
              </div>
            </>
          )}

          {/* Step 3 */}
          {currentStep === 2 && (
            <>
              <div>
                <label className="text-sm font-medium">{t('form.street')} *</label>
                <Input {...register('address.street')} placeholder={lang === 'es' ? 'Calle Principal 123' : 'Main St 123'}
                  className={errors.address?.street && "border-red-500"} />
                {errors.address?.street && <p className="text-sm text-red-500 mt-1">{t(errors.address.street.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.city')} *</label>
                <Input {...register('address.city')} placeholder={lang === 'es' ? 'San José' : 'San Jose'}
                  className={errors.address?.city && "border-red-500"} />
                {errors.address?.city && <p className="text-sm text-red-500 mt-1">{t(errors.address.city.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.zipCode')} *</label>
                <Input {...register('address.zipCode')} placeholder="95116"
                  className={errors.address?.zipCode && "border-red-500"} />
                {errors.address?.zipCode && <p className="text-sm text-red-500 mt-1">{t(errors.address.zipCode.message as string)}</p>}
              </div>
              <p className="text-xs text-muted-foreground">{COMPANY.serviceArea[lang]}</p>
            </>
          )}

          {/* Step 4 */}
          {currentStep === 3 && (
            <>
              <div>
                <label className="text-sm font-medium">{t('form.description')} *</label>
                <Textarea {...register('description')} placeholder={t('form.descriptionPlaceholder')} rows={5}
                  className={errors.description && "border-red-500"} />
                <p className="text-xs text-muted-foreground mt-1">{lang === 'es' ? 'Mínimo 20 caracteres.' : 'Min 20 characters.'}</p>
                {errors.description && <p className="text-sm text-red-500 mt-1">{t(errors.description.message as string)}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.specialRequirements')}</label>
                <div className="space-y-2 mt-2">
                  {SPECIAL_REQUIREMENTS_OPTIONS.map((req) => (
                    <label key={req.value} className="flex items-center gap-2">
                      <input type="checkbox" value={req.value}
                        checked={specialRequirements?.includes(req.value)}
                        onChange={(e) => {
                          const current = specialRequirements || []
                          setValue('specialRequirements', e.target.checked ? [...current, req.value] : current.filter(r => r !== req.value))
                        }} className="rounded border-border" />
                      <span className="text-sm">{lang === 'es' ? req.es : req.en}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Checkbox checked={watch('hasPet')} onCheckedChange={(checked) => setValue('hasPet', checked as boolean)} />
                  <span className="text-sm">{t('form.hasPet')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={watch('hasAllergies')} onCheckedChange={(checked) => setValue('hasAllergies', checked as boolean)} />
                  <span className="text-sm">{t('form.hasAllergies')}</span>
                </label>
                {hasAllergies && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="ml-6">
                    <Textarea {...register('allergies')} placeholder={t('form.allergiesPlaceholder')} rows={3} />
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Step 5 */}
          {currentStep === 4 && (
            <>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Phone className="size-4" /> {t('form.emergencyContact')}
                </h4>
                <div className="space-y-3">
                  <Input {...register('emergencyContact.name')} placeholder={t('form.emergencyName')}
                    className={errors.emergencyContact?.name && "border-red-500"} />
                  {errors.emergencyContact?.name && <p className="text-sm text-red-500 mt-1">{t(errors.emergencyContact.name.message as string)}</p>}
                  <Input {...register('emergencyContact.phone')} placeholder={t('form.emergencyPhone')}
                    className={errors.emergencyContact?.phone && "border-red-500"} />
                  {errors.emergencyContact?.phone && <p className="text-sm text-red-500 mt-1">{t(errors.emergencyContact.phone.message as string)}</p>}
                  <Input {...register('emergencyContact.relationship')} placeholder={t('form.emergencyRelationship')}
                    className={errors.emergencyContact?.relationship && "border-red-500"} />
                  {errors.emergencyContact?.relationship && <p className="text-sm text-red-500 mt-1">{t(errors.emergencyContact.relationship.message as string)}</p>}
                </div>
              </div>
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <label className="flex items-start gap-2">
                  <Checkbox checked={watch('acceptTerms')} onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)} />
                  <span className="text-sm">{t('form.acceptTerms')}</span>
                </label>
                {errors.acceptTerms && <p className="text-sm text-red-500 mt-1">{t(errors.acceptTerms.message as string)}</p>}
                <label className="flex items-start gap-2">
                  <Checkbox checked={watch('acceptCommunications')} onCheckedChange={(checked) => setValue('acceptCommunications', checked as boolean)} />
                  <span className="text-sm">{t('form.acceptCommunications')}</span>
                </label>
              </div>
              <div>
                <label className="text-sm font-medium">{t('form.captcha')}</label>
                <Input placeholder={t('form.captchaPlaceholder')} value={watch('captcha') || ''}
                  onChange={(e) => setValue('captcha', e.target.value)} className={captchaError && "border-red-500"} />
                {captchaError && <p className="text-sm text-red-500 mt-1">{captchaError}</p>}
                <p className="text-xs text-muted-foreground mt-1">{t('form.captchaHint')}</p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          {t('form.previous')}
        </Button>
        {!isLastStep ? (
          <Button type="button" onClick={handleNextStep}>{t('form.next')}</Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('form.submitting')}</> : t('form.submit')}
          </Button>
        )}
      </div>
    </form>
  )
}