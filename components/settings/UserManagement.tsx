'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  UserPlus,
  Users,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  ShoppingCart,
  AlertTriangle,
  Key
} from 'lucide-react'
import { toast } from 'sonner'
import PasswordSettings from './PasswordSettings'

interface User {
  id: string
  name: string
  email: string
  company: string | null
  role: 'OWNER' | 'SELLER'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  company: string
  role: 'OWNER' | 'SELLER'
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    company: '',
    role: 'SELLER'
  })

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        toast.error(data.error || 'Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Créer un utilisateur
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Utilisateur créé avec succès')
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          email: '',
          password: '',
          company: '',
          role: 'SELLER'
        })
        fetchUsers()
      } else {
        toast.error(data.error || 'Erreur lors de la création de l\'utilisateur')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    }
  }

  // Mettre à jour un utilisateur
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser.id,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role,
          isActive: editingUser.isActive
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Utilisateur mis à jour avec succès')
        setIsEditDialogOpen(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour de l\'utilisateur')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    }
  }

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Utilisateur supprimé avec succès')
        fetchUsers()
      } else {
        toast.error(data.error || 'Erreur lors de la suppression de l\'utilisateur')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    }
  }

  // Basculer le statut actif/inactif
  const toggleUserStatus = async (user: User) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès`)
        fetchUsers()
      } else {
        toast.error(data.error || 'Erreur lors de la modification du statut')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    }
  }

  // Ouvrir le dialog d'édition
  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      company: user.company || '',
      role: user.role
    })
    setIsEditDialogOpen(true)
  }

  const getRoleIcon = (role: string) => {
    return role === 'OWNER' ? <Crown className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />
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

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Gérez les comptes utilisateurs de votre entreprise
              </p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un Nouvel Utilisateur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom complet de l'utilisateur"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="adresse@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mot de passe (min. 6 caractères)"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nom de l'entreprise (optionnel)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select value={formData.role} onValueChange={(value: 'OWNER' | 'SELLER') => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SELLER">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Vendeur
                        </div>
                      </SelectItem>
                      <SelectItem value="OWNER">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Propriétaire
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Créer l'Utilisateur
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {!user.isActive && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Inactif
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.company && (
                      <p className="text-xs text-gray-500">{user.company}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user)}
                  >
                    {user.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  <PasswordSettings
                    userId={user.id}
                    userName={user.name}
                    isAdminMode={true}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'Utilisateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom complet *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom complet de l'utilisateur"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="adresse@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-company">Entreprise</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nom de l'entreprise (optionnel)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Rôle *</Label>
                <Select value={formData.role} onValueChange={(value: 'OWNER' | 'SELLER') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SELLER">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Vendeur
                      </div>
                    </SelectItem>
                    <SelectItem value="OWNER">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Propriétaire
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Mettre à Jour
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
