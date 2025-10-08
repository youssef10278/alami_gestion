'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Key,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface AdminPasswordFormData {
  newPassword: string
  confirmPassword: string
}

interface PasswordSettingsProps {
  userId?: string
  userName?: string
  isAdminMode?: boolean
}

export default function PasswordSettings({ userId, userName, isAdminMode = false }: PasswordSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [adminFormData, setAdminFormData] = useState<AdminPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  })

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setAdminFormData({
      newPassword: '',
      confirmPassword: ''
    })
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  // Validation côté client
  const validateForm = () => {
    if (isAdminMode) {
      if (!adminFormData.newPassword || !adminFormData.confirmPassword) {
        toast.error('Veuillez remplir tous les champs')
        return false
      }

      if (adminFormData.newPassword.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères')
        return false
      }

      if (adminFormData.newPassword !== adminFormData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas')
        return false
      }
    } else {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        toast.error('Veuillez remplir tous les champs')
        return false
      }

      if (formData.newPassword.length < 6) {
        toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
        return false
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Les nouveaux mots de passe ne correspondent pas')
        return false
      }

      if (formData.currentPassword === formData.newPassword) {
        toast.error('Le nouveau mot de passe doit être différent de l\'ancien')
        return false
      }
    }

    return true
  }

  // Changer le mot de passe
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const url = '/api/auth/change-password'
      const method = isAdminMode ? 'PUT' : 'POST'
      const body = isAdminMode 
        ? {
            userId,
            newPassword: adminFormData.newPassword,
            confirmPassword: adminFormData.confirmPassword
          }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Mot de passe modifié avec succès')
        setIsDialogOpen(false)
        resetForm()
      } else {
        toast.error(data.error || 'Erreur lors de la modification du mot de passe')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const dialogTitle = isAdminMode 
    ? `Modifier le mot de passe de ${userName}`
    : 'Modifier mon mot de passe'

  const buttonText = isAdminMode 
    ? 'Modifier le mot de passe'
    : 'Changer mon mot de passe'

  return (
    <>
      {!isAdminMode && (
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Sécurité du Compte</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Modifiez votre mot de passe pour sécuriser votre compte
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Recommandations de sécurité</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Utilisez un mot de passe fort avec au moins 6 caractères, incluant des lettres, chiffres et symboles.
                  </p>
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Key className="w-4 h-4 mr-2" />
                    {buttonText}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      {dialogTitle}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Mot de passe actuel */}
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de passe actuel *</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          placeholder="Votre mot de passe actuel"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Nouveau mot de passe */}
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe *</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="Nouveau mot de passe (min. 6 caractères)"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmation nouveau mot de passe */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe *</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirmez le nouveau mot de passe"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Indicateur de force du mot de passe */}
                    {formData.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {formData.newPassword.length >= 6 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          <span className={formData.newPassword.length >= 6 ? 'text-green-600' : 'text-orange-500'}>
                            {formData.newPassword.length >= 6 ? 'Longueur suffisante' : 'Au moins 6 caractères requis'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {formData.newPassword === formData.confirmPassword && formData.confirmPassword ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          <span className={formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : 'text-orange-500'}>
                            {formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'Mots de passe identiques' : 'Les mots de passe doivent être identiques'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={loading}
                      >
                        {loading ? 'Modification...' : 'Modifier le mot de passe'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        disabled={loading}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdminMode && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Key className="w-4 h-4 mr-2" />
              Changer mot de passe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {dialogTitle}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="admin-new-password">Nouveau mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="admin-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={adminFormData.newPassword}
                    onChange={(e) => setAdminFormData({ ...adminFormData, newPassword: e.target.value })}
                    placeholder="Nouveau mot de passe (min. 6 caractères)"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmation nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="admin-confirm-password">Confirmer le nouveau mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="admin-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={adminFormData.confirmPassword}
                    onChange={(e) => setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })}
                    placeholder="Confirmez le nouveau mot de passe"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading}
                >
                  {loading ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
