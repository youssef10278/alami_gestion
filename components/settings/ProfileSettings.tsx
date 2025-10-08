'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Building2, 
  Crown, 
  ShoppingCart,
  Calendar,
  Save,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import PasswordSettings from './PasswordSettings'

interface UserProfile {
  id: string
  name: string
  email: string
  company: string | null
  role: 'OWNER' | 'SELLER'
  isActive: boolean
  createdAt: string
}

export default function ProfileSettings() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  })

  // Charger les informations de l'utilisateur
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          company: data.user.company || ''
        })
      } else {
        toast.error(data.error || 'Erreur lors du chargement du profil')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      toast.error('Le nom et l\'email sont requis')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user?.id,
          name: formData.name,
          email: formData.email,
          company: formData.company || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profil mis à jour avec succès')
        fetchUserProfile() // Recharger les données
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    return role === 'OWNER' ? (
      <Badge variant="default" className="bg-purple-100 text-purple-800">
        <Crown className="w-3 h-3 mr-1" />
        Propriétaire
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        <ShoppingCart className="w-3 h-3 mr-1" />
        Vendeur
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Impossible de charger les informations du profil</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informations du profil */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Informations du Profil</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Gérez vos informations personnelles et professionnelles
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Informations actuelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name}</h3>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.company && (
                      <p className="text-xs text-gray-500">{user.company}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis le {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Formulaire de modification */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Nom complet *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Votre nom complet"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Adresse email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="profile-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-company">Entreprise</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="profile-company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nom de votre entreprise (optionnel)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de sécurité */}
      <PasswordSettings />
    </div>
  )
}
