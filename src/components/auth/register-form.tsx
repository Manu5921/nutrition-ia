'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Lock, 
  Check, 
  X,
  Loader2
} from 'lucide-react';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  preferences: {
    allergies: string[];
    dietaryRestrictions: string[];
    healthGoals: string[];
  };
}

const dietaryOptions = [
  { id: 'vegetarien', label: 'Végétarien', icon: '🥕' },
  { id: 'vegan', label: 'Végan', icon: '🌱' },
  { id: 'sans-gluten', label: 'Sans gluten', icon: '🌾' },
  { id: 'sans-lactose', label: 'Sans lactose', icon: '🥛' },
  { id: 'keto', label: 'Cétogène', icon: '🥑' },
  { id: 'paleo', label: 'Paléo', icon: '🥩' }
];

const healthGoals = [
  { id: 'perte-poids', label: 'Perte de poids', icon: '⚖️' },
  { id: 'gain-energie', label: 'Gain énergie', icon: '⚡' },
  { id: 'anti-inflammatoire', label: 'Anti-inflammatoire', icon: '💪' },
  { id: 'digestion', label: 'Améliorer digestion', icon: '🍃' },
  { id: 'sommeil', label: 'Meilleur sommeil', icon: '😴' },
  { id: 'performance', label: 'Performance sportive', icon: '🏃' }
];

const commonAllergies = [
  { id: 'arachides', label: 'Arachides', icon: '🥜' },
  { id: 'fruits-coque', label: 'Fruits à coque', icon: '🌰' },
  { id: 'crustaces', label: 'Crustacés', icon: '🦐' },
  { id: 'poisson', label: 'Poisson', icon: '🐟' },
  { id: 'oeufs', label: 'Œufs', icon: '🥚' },
  { id: 'soja', label: 'Soja', icon: '🫘' }
];

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferences: {
      allergies: [],
      dietaryRestrictions: [],
      healthGoals: []
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const { toast } = useToast();

  // Validation du mot de passe
  const passwordValidation = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isStep1Valid = formData.name.length >= 2 && 
                      formData.email.includes('@') && 
                      isPasswordValid && 
                      formData.password === formData.confirmPassword;

  // Vérifier la disponibilité de l'email
  const checkEmailAvailability = async (email: string) => {
    if (!email.includes('@')) return;
    
    try {
      const response = await fetch(`/api/auth/register?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setEmailAvailable(data.available);
    } catch (error) {
      console.error('Erreur vérification email:', error);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'email') {
      setEmailAvailable(null);
      // Debounce email check
      const timeoutId = setTimeout(() => checkEmailAvailability(value), 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const togglePreference = (category: keyof typeof formData.preferences, id: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: prev.preferences[category].includes(id)
          ? prev.preferences[category].filter(item => item !== id)
          : [...prev.preferences[category], id]
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          preferences: formData.preferences
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Compte créé avec succès !",
          description: "Vous pouvez maintenant vous connecter et commencer votre coaching nutritionnel.",
        });
        
        // Redirection vers la page de connexion ou dashboard
        window.location.href = '/dashboard';
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: data.error || "Une erreur s'est produite",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le compte. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Étape {currentStep} sur 2
          </span>
          <span className="text-sm text-gray-500">
            {currentStep === 1 ? 'Informations de base' : 'Préférences'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          />
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Créer votre compte
            </h2>
            <p className="text-gray-600 mt-2">
              Commencez votre parcours vers une meilleure nutrition
            </p>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Votre nom"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 pr-10"
              />
              {emailAvailable !== null && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {emailAvailable ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {emailAvailable === false && (
              <p className="text-sm text-red-600 mt-1">
                Cet email est déjà utilisé
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Validation du mot de passe */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className={`flex items-center text-sm ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.length ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                  Au moins 8 caractères
                </div>
                <div className={`flex items-center text-sm ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.uppercase ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                  Une majuscule
                </div>
                <div className={`flex items-center text-sm ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.lowercase ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                  Une minuscule
                </div>
                <div className={`flex items-center text-sm ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.number ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                  Un chiffre
                </div>
              </div>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmer votre mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <Button
            onClick={() => setCurrentStep(2)}
            disabled={!isStep1Valid || emailAvailable === false}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Continuer
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Personnalisez votre expérience
            </h2>
            <p className="text-gray-600 mt-2">
              Ces informations nous aident à mieux vous conseiller
            </p>
          </div>

          {/* Objectifs santé */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Vos objectifs santé
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {healthGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => togglePreference('healthGoals', goal.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.preferences.healthGoals.includes(goal.id)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{goal.icon}</span>
                    <span className="text-sm font-medium">{goal.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Restrictions alimentaires */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Restrictions alimentaires
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => togglePreference('dietaryRestrictions', option.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.preferences.dietaryRestrictions.includes(option.id)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Allergies alimentaires
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {commonAllergies.map((allergy) => (
                <button
                  key={allergy.id}
                  onClick={() => togglePreference('allergies', allergy.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.preferences.allergies.includes(allergy.id)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{allergy.icon}</span>
                    <span className="text-sm font-medium">{allergy.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}