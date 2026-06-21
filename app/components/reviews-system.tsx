// components/reviews-system.tsx
"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star, ThumbsUp, Flag, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Rating } from '@/components/ui/rating'
import { cn } from '@/lib/utils'

const reviewSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  rating: z.number().min(1, 'Selecciona una calificación').max(5),
  title: z.string().min(5, 'Título muy corto'),
  comment: z.string().min(10, 'Comentario muy corto').max(500, 'Comentario muy largo'),
  serviceType: z.string().optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface Review {
  id: string
  name: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
  reported: boolean
  verified: boolean
  serviceType?: string
  avatar?: string
}

export function ReviewsSystem({ serviceId }: { serviceId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0
    }
  })

  const rating = watch('rating')

  // Calcular estadísticas
  useEffect(() => {
    if (reviews.length > 0) {
      const avg = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
      setAverageRating(avg)

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      reviews.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })
      setRatingDistribution(distribution)
    }
  }, [reviews])

  const onSubmit = async (data: ReviewFormData) => {
    const newReview: Review = {
      id: Date.now().toString(),
      name: data.name,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      date: new Date().toISOString(),
      helpful: 0,
      reported: false,
      verified: Math.random() > 0.5,
      serviceType: data.serviceType,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`
    }

    // Enviar a API
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newReview, serviceId })
    })

    if (response.ok) {
      setReviews(prev => [newReview, ...prev])
      setIsDialogOpen(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    )
    // Enviar a API
    await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' })
  }

  const handleReport = async (reviewId: string) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, reported: true }
          : review
      )
    )
    // Enviar a API
    await fetch(`/api/reviews/${reviewId}/report`, { method: 'POST' })
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'helpful') return b.helpful - a.helpful
    return 0
  })

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-secondary/20 rounded-lg">
        <div className="text-center md:text-left">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center md:justify-start gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "size-5",
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Basado en {reviews.length} reseñas
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm w-8">{star}★</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{
                    width: `${(ratingDistribution[star as keyof typeof ratingDistribution] / reviews.length) * 100}%`
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12">
                {ratingDistribution[star as keyof typeof ratingDistribution]}
              </span>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">Escribir Reseña</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Escribe tu reseña</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Calificación</label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "size-8 transition-colors",
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground hover:text-yellow-400"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('name')}
                  placeholder="Tu nombre"
                  className={errors.name && "border-red-500"}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Tu email"
                  className={errors.email && "border-red-500"}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('title')}
                  placeholder="Título de la reseña"
                  className={errors.title && "border-red-500"}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('serviceType')}
                  placeholder="Tipo de servicio (opcional)"
                />
              </div>

              <div>
                <Textarea
                  {...register('comment')}
                  placeholder="Escribe tu experiencia..."
                  rows={4}
                  className={errors.comment && "border-red-500"}
                />
                {errors.comment && (
                  <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">Enviar Reseña</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['recent', 'rating', 'helpful'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option as any)}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                sortBy === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {option === 'recent' && 'Más Recientes'}
              {option === 'rating' && 'Mejor Calificados'}
              {option === 'helpful' && 'Más Útiles'}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {reviews.length} reseñas
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div key={review.id} className="p-4 border border-border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-5 text-primary" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{review.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "size-3",
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                    {review.verified && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Verificada</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {review.serviceType && (
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {review.serviceType}
                </span>
              )}
            </div>

            <h3 className="font-medium mt-3">{review.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ThumbsUp className="size-3" />
                Útil ({review.helpful})
              </button>
              <button
                onClick={() => handleReport(review.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Flag className="size-3" />
                Reportar
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay reseñas aún. ¡Sé el primero en escribir una!
          </div>
        )}
      </div>
    </div>
  )
}