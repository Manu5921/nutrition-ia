"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  age: number
  location: string
  rating: number
  text: string
  result: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Marie Dubois",
    age: 34,
    location: "Lyon",
    rating: 5,
    text: "Grâce à ce coach nutrition, j'ai enfin compris comment manger anti-inflammatoire sans me priver. Les recettes sont délicieuses et mes douleurs articulaires ont diminué en 3 semaines !",
    result: "-4kg en 2 mois",
    avatar: "MD"
  },
  {
    id: 2,
    name: "Jean-Pierre Martin",
    age: 42,
    location: "Toulouse",
    rating: 5,
    text: "L'IA comprend vraiment mes préférences. Les plans de repas sont variés et adaptés à mon rythme. Plus de ballonnements et une énergie retrouvée !",
    result: "Énergie +80%",
    avatar: "JP"
  },
  {
    id: 3,
    name: "Sophie Lemoine",
    age: 28,
    location: "Paris",
    rating: 5,
    text: "Interface intuitive, recettes faciles à préparer même avec un emploi du temps chargé. Le système de listes de courses automatique est un vrai plus !",
    result: "-6kg en 3 mois",
    avatar: "SL"
  },
  {
    id: 4,
    name: "Robert Moreau",
    age: 55,
    location: "Bordeaux",
    rating: 5,
    text: "Diabétique de type 2, j'ai enfin trouvé une méthode qui s'adapte à mes contraintes. Mes analyses sanguines se sont améliorées significativement.",
    result: "Glycémie -20%",
    avatar: "RM"
  },
  {
    id: 5,
    name: "Amélie Rousseau",
    age: 31,
    location: "Nantes",
    rating: 5,
    text: "Après des années de régimes yo-yo, cette approche anti-inflammatoire m'a enfin permis de perdre du poids durablement. Plus de frustration, que du plaisir !",
    result: "-8kg stabilisés",
    avatar: "AR"
  }
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Ce que disent nos utilisateurs</h2>
        <p className="text-muted-foreground">
          Découvrez les témoignages de personnes qui ont transformé leur santé
        </p>
      </div>

      <div className="relative">
        <Card className="min-h-[300px] bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <Quote className="h-12 w-12 text-primary/40 mb-6" />
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${
                      i < currentTestimonial.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>

              <blockquote className="text-lg leading-relaxed mb-6 max-w-2xl">
                "{currentTestimonial.text}"
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  {currentTestimonial.avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold">
                    {currentTestimonial.name}, {currentTestimonial.age} ans
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentTestimonial.location}
                  </div>
                </div>
                <div className="ml-4 px-3 py-1 bg-primary/20 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {currentTestimonial.result}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-primary">4.9/5</div>
          <div className="text-sm text-muted-foreground">Note moyenne</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-primary">2,847</div>
          <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-primary">89%</div>
          <div className="text-sm text-muted-foreground">Atteignent leurs objectifs</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-primary">-5.2kg</div>
          <div className="text-sm text-muted-foreground">Perte moyenne</div>
        </div>
      </div>
    </div>
  )
}