'use client'

import { useState, useEffect } from 'react'
import { Building2, Save, Mail, Phone, MapPin, Globe, CreditCard, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import LogoUpload from '@/components/ui/logo-upload'

interface CompanySettings {
  id: string
  companyName: string
  companyLogo?: string
  companyICE?: string
  companyEmail?: string
  companyPhone?: string
  companyAddress?: string
  companyWebsite?: string
  companyTaxId?: string
  invoicePrefix: string
  creditNotePrefix: string
  defaultTaxRate: number
  bankName?: string
  bankAccount?: string
  bankRIB?: string
  legalMentions?: string
}

export default function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // États du formulaire
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    companyICE: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    companyWebsite: '',
    companyTaxId: '',
    invoicePrefix: 'FAC',
    creditNotePrefix: 'FAV',
    defaultTaxRate: 20,
    bankName: '',
    bankAccount: '',
    bankRIB: '',
    legalMentions: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/company')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setFormData({
          companyName: data.companyName || '',
          companyLogo: data.companyLogo || '',
          companyICE: data.companyICE || '',
          companyEmail: data.companyEmail || '',
          companyPhone: data.companyPhone || '',
          companyAddress: data.companyAddress || '',
          companyWebsite: data.companyWebsite || '',
          companyTaxId: data.companyTaxId || '',
          invoicePrefix: data.invoicePrefix || 'FAC',
          creditNotePrefix: data.creditNotePrefix || 'FAV',
          defaultTaxRate: Number(data.defaultTaxRate) || 20,
          bankName: data.bankName || '',
          bankAccount: data.bankAccount || '',
          bankRIB: data.bankRIB || '',
          legalMentions: data.legalMentions || '',
        })
      } else {
        toast.error('Erreur lors du chargement des paramètres')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast.success('Paramètres sauvegardés avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      {/* Informations générales */}
      <Card className="glass">
        <CardHeader className="pt-6">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informations de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Nom de l'Entreprise *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="companyICE">ICE (Identifiant Commun de l'Entreprise)</Label>
              <Input
                id="companyICE"
                value={formData.companyICE}
                onChange={(e) => updateFormData('companyICE', e.target.value)}
                placeholder="000000000000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyEmail">Email de l'Entreprise</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => updateFormData('companyEmail', e.target.value)}
                  className="pl-10"
                  placeholder="contact@entreprise.ma"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="companyPhone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="companyPhone"
                  value={formData.companyPhone}
                  onChange={(e) => updateFormData('companyPhone', e.target.value)}
                  className="pl-10"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyWebsite">Site Web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="companyWebsite"
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) => updateFormData('companyWebsite', e.target.value)}
                  className="pl-10"
                  placeholder="https://www.entreprise.ma"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="companyTaxId">Numéro Fiscal</Label>
              <Input
                id="companyTaxId"
                value={formData.companyTaxId}
                onChange={(e) => updateFormData('companyTaxId', e.target.value)}
                placeholder="12345678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="companyAddress">Adresse Complète</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea
                id="companyAddress"
                value={formData.companyAddress}
                onChange={(e) => updateFormData('companyAddress', e.target.value)}
                className="pl-10"
                rows={3}
                placeholder="Adresse complète de l'entreprise"
              />
            </div>
          </div>

          <div>
            <LogoUpload
              value={formData.companyLogo}
              onChange={(url) => updateFormData('companyLogo', url)}
              label="Logo de l'Entreprise"
              placeholder="https://exemple.com/logo.png"
            />
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de facturation */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paramètres de Facturation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoicePrefix">Préfixe Factures</Label>
              <Input
                id="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={(e) => updateFormData('invoicePrefix', e.target.value)}
                placeholder="FAC"
                required
              />
            </div>
            <div>
              <Label htmlFor="creditNotePrefix">Préfixe Factures d'Avoir</Label>
              <Input
                id="creditNotePrefix"
                value={formData.creditNotePrefix}
                onChange={(e) => updateFormData('creditNotePrefix', e.target.value)}
                placeholder="FAV"
                required
              />
            </div>
            <div>
              <Label htmlFor="defaultTaxRate">Taux de TVA par Défaut (%)</Label>
              <Input
                id="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.defaultTaxRate}
                onChange={(e) => updateFormData('defaultTaxRate', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations bancaires */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Informations Bancaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Nom de la Banque</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => updateFormData('bankName', e.target.value)}
                placeholder="Banque Populaire"
              />
            </div>
            <div>
              <Label htmlFor="bankAccount">Numéro de Compte</Label>
              <Input
                id="bankAccount"
                value={formData.bankAccount}
                onChange={(e) => updateFormData('bankAccount', e.target.value)}
                placeholder="1234567890123456"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bankRIB">RIB Complet</Label>
            <Input
              id="bankRIB"
              value={formData.bankRIB}
              onChange={(e) => updateFormData('bankRIB', e.target.value)}
              placeholder="123 456 789012345678901234 56"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mentions légales */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Mentions Légales</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="legalMentions">Mentions Légales (apparaîtront sur les factures)</Label>
            <Textarea
              id="legalMentions"
              value={formData.legalMentions}
              onChange={(e) => updateFormData('legalMentions', e.target.value)}
              rows={4}
              placeholder="Mentions légales, conditions de paiement, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="min-w-32">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  )
}
