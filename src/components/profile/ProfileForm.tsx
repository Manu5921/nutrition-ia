"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Target,
  Save,
  Camera,
  Shield
} from "lucide-react"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: "male" | "female" | "other" | ""
  height: string
  weight: string
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active" | ""
  healthGoals: string[]
  allergies: string[]
  dietaryRestrictions: string[]
}

interface ProfileFormProps {
  className?: string
}

export const ProfileForm = ({ className }: ProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    healthGoals: [],
    allergies: [],
    dietaryRestrictions: []
  })

  const activityLevels = [
    { value: "sedentary", label: "Sédentaire", desc: "Peu ou pas d'exercice" },
    { value: "light", label: "Légèrement actif", desc: "Exercice léger 1-3 jours/semaine" },
    { value: "moderate", label: "Modérément actif", desc: "Exercice modéré 3-5 jours/semaine" },
    { value: "active", label: "Actif", desc: "Exercice intense 6-7 jours/semaine" },
    { value: "very_active", label: "Très actif", desc: "Exercice très intense, travail physique" }
  ]

  const healthGoalOptions = [
    "Perdre du poids",
    "Prendre du poids",
    "Maintenir le poids",
    "Améliorer l'énergie",
    "Réduire l'inflammation",
    "Améliorer la digestion",
    "Renforcer le système immunitaire",
    "Améliorer le sommeil",
    "Réduire le stress",
    "Améliorer les performances sportives"
  ]

  const allergyOptions = [
    "Arachides",
    "Fruits à coque",
    "Lait",
    "Œufs",
    "Blé/Gluten",
    "Soja",
    "Poisson",
    "Crustacés",
    "Sésame",
    "Sulfites"
  ]

  const dietaryOptions = [
    "Végétarien",
    "Vegan",
    "Sans gluten",
    "Sans lactose",
    "Paléo",
    "Cétogène",
    "Méditerranéen",
    "Anti-inflammatoire",
    "Diabétique",
    "Hypocalorique"
  ]

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => {
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulation d'une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000))
      // TODO: Implémenter la sauvegarde avec tRPC
      console.log("Profile saved:", profileData)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations personnelles
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Personnalisez votre profil pour des recommandations adaptées
            </p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Sécurisé
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="votre@email.com"
            />
          </div>

          {/* Informations physiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date de naissance
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Taille (cm)
              </Label>
              <Input
                id="height"
                type="number"
                value={profileData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                placeholder="170"
                min="100"
                max="250"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Poids (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={profileData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                placeholder="70"
                min="30"
                max="300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select value={profileData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Niveau d'activité
              </Label>
              <Select value={profileData.activityLevel} onValueChange={(value) => handleInputChange("activityLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Votre niveau d'activité" />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Objectifs de santé */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectifs de santé
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {healthGoalOptions.map((goal) => (
                <Badge
                  key={goal}
                  variant={profileData.healthGoals.includes(goal) ? "default" : "outline"}
                  className="cursor-pointer justify-center p-2 hover:scale-105 transition-transform"
                  onClick={() => handleArrayToggle("healthGoals", goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-3">
            <Label>Allergies alimentaires</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allergyOptions.map((allergy) => (
                <Badge
                  key={allergy}
                  variant={profileData.allergies.includes(allergy) ? "destructive" : "outline"}
                  className="cursor-pointer justify-center p-2 hover:scale-105 transition-transform"
                  onClick={() => handleArrayToggle("allergies", allergy)}
                >
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>

          {/* Restrictions alimentaires */}
          <div className="space-y-3">
            <Label>Préférences alimentaires</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dietaryOptions.map((diet) => (
                <Badge
                  key={diet}
                  variant={profileData.dietaryRestrictions.includes(diet) ? "default" : "outline"}
                  className="cursor-pointer justify-center p-2 hover:scale-105 transition-transform"
                  onClick={() => handleArrayToggle("dietaryRestrictions", diet)}
                >
                  {diet}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" type="button">
              <Camera className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}