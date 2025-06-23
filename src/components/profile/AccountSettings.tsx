"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Settings,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  LogOut,
  Key,
  AlertTriangle
} from "lucide-react"

interface AccountSettingsProps {
  className?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  mealReminders: boolean
  weeklyReports: boolean
  newRecipes: boolean
  goalAchievements: boolean
}

interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private"
  shareProgress: boolean
  analyticsOptIn: boolean
  marketingEmails: boolean
}

interface AppSettings {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  units: "metric" | "imperial"
  soundEnabled: boolean
}

export const AccountSettings = ({ className }: AccountSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    mealReminders: true,
    weeklyReports: false,
    newRecipes: true,
    goalAchievements: true
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "friends",
    shareProgress: true,
    analyticsOptIn: true,
    marketingEmails: false
  })

  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: "system",
    language: "fr",
    timezone: "Europe/Paris",
    units: "metric",
    soundEnabled: true
  })

  const languages = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" }
  ]

  const timezones = [
    { value: "Europe/Paris", label: "Paris (UTC+1)" },
    { value: "Europe/London", label: "Londres (UTC+0)" },
    { value: "America/New_York", label: "New York (UTC-5)" },
    { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)" },
    { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" }
  ]

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean | string) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  const handleAppSettingChange = (key: keyof AppSettings, value: string | boolean) => {
    setAppSettings(prev => ({ ...prev, [key]: value }))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }
    
    setIsLoading(true)
    try {
      // Simulation changement de mot de passe
      await new Promise(resolve => setTimeout(resolve, 2000))
      // TODO: Implémenter avec NextAuth.js
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error changing password:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    // TODO: Implémenter l'export des données
    console.log("Exporting user data...")
  }

  const handleDeleteAccount = async () => {
    if (confirm("Etes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      // TODO: Implémenter la suppression de compte
      console.log("Deleting account...")
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sécurité et Mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Sécurité et Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isLoading || !currentPassword || !newPassword}>
              <Key className="h-4 w-4 mr-2" />
              {isLoading ? "Modification..." : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <label className="text-sm font-medium">Notifications par email</label>
                </div>
                <p className="text-xs text-muted-foreground">Recevoir les notifications importantes par email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <label className="text-sm font-medium">Notifications push</label>
                </div>
                <p className="text-xs text-muted-foreground">Notifications en temps réel sur votre appareil</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Rappels de repas</label>
                <p className="text-xs text-muted-foreground">Rappels pour prendre vos repas</p>
              </div>
              <Switch
                checked={notifications.mealReminders}
                onCheckedChange={(checked) => handleNotificationChange("mealReminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Rapports hebdomadaires</label>
                <p className="text-xs text-muted-foreground">Bilan nutritionnel de la semaine</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Nouvelles recettes</label>
                <p className="text-xs text-muted-foreground">Etre alerté des nouvelles recettes</p>
              </div>
              <Switch
                checked={notifications.newRecipes}
                onCheckedChange={(checked) => handleNotificationChange("newRecipes", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Objectifs atteints</label>
                <p className="text-xs text-muted-foreground">Célébrer vos réussites</p>
              </div>
              <Switch
                checked={notifications.goalAchievements}
                onCheckedChange={(checked) => handleNotificationChange("goalAchievements", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidentialité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Visibilité du profil</Label>
            <Select
              value={privacy.profileVisibility}
              onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Visible par tous</SelectItem>
                <SelectItem value="friends">Amis - Visible par vos amis</SelectItem>
                <SelectItem value="private">Privé - Visible par vous seul</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Partager mes progrès</label>
              <p className="text-xs text-muted-foreground">Permettre le partage de vos statistiques</p>
            </div>
            <Switch
              checked={privacy.shareProgress}
              onCheckedChange={(checked) => handlePrivacyChange("shareProgress", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Analytics et améliorations</label>
              <p className="text-xs text-muted-foreground">Aider à améliorer l'application</p>
            </div>
            <Switch
              checked={privacy.analyticsOptIn}
              onCheckedChange={(checked) => handlePrivacyChange("analyticsOptIn", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Emails marketing</label>
              <p className="text-xs text-muted-foreground">Recevoir des offres et conseils par email</p>
            </div>
            <Switch
              checked={privacy.marketingEmails}
              onCheckedChange={(checked) => handlePrivacyChange("marketingEmails", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Préférences de l'application */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Préférences de l'application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {appSettings.theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Thème
              </Label>
              <Select
                value={appSettings.theme}
                onValueChange={(value) => handleAppSettingChange("theme", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="system">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Langue
              </Label>
              <Select
                value={appSettings.language}
                onValueChange={(value) => handleAppSettingChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select
                value={appSettings.timezone}
                onValueChange={(value) => handleAppSettingChange("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unités de mesure</Label>
              <Select
                value={appSettings.units}
                onValueChange={(value) => handleAppSettingChange("units", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Métrique (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Impérial (lb, ft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {appSettings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <label className="text-sm font-medium">Sons et vibrations</label>
              </div>
              <p className="text-xs text-muted-foreground">Activer les retours sonores</p>
            </div>
            <Switch
              checked={appSettings.soundEnabled}
              onCheckedChange={(checked) => handleAppSettingChange("soundEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions de compte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Actions de compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter mes données
            </Button>
            
            <Button variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="sm:ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer le compte
            </Button>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Attention !</p>
                <p>La suppression de votre compte est définitive et irréversible. Toutes vos données seront perdues.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}