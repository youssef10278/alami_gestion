'use client'

import { useState, useEffect } from 'react'
import { Palette, Eye, Save, RotateCcw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import InvoicePreview from './InvoicePreview'

interface InvoiceDesignSettings {
  invoiceTheme: string
  primaryColor: string
  secondaryColor: string
  tableHeaderColor: string
  sectionColor: string
  accentColor: string
  textColor: string
  headerTextColor: string
  sectionTextColor: string
  backgroundColor: string
  headerStyle: string
  logoPosition: string
  logoSize: string
  fontFamily: string
  fontSize: string
  borderRadius: string
  showWatermark: boolean
  watermarkText?: string
  customCSS?: string
}

const defaultSettings: InvoiceDesignSettings = {
  invoiceTheme: 'modern',
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  tableHeaderColor: '#10B981',
  sectionColor: '#10B981',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  headerTextColor: '#FFFFFF',
  sectionTextColor: '#FFFFFF',
  backgroundColor: '#FFFFFF',
  headerStyle: 'gradient',
  logoPosition: 'left',
  logoSize: 'medium',
  fontFamily: 'helvetica',
  fontSize: 'normal',
  borderRadius: 'rounded',
  showWatermark: false,
  watermarkText: '',
  customCSS: ''
}

const themes = [
  { value: 'modern', label: 'Moderne', description: 'Design épuré et contemporain' },
  { value: 'classic', label: 'Classique', description: 'Style traditionnel et professionnel' },
  { value: 'minimal', label: 'Minimal', description: 'Design simple et élégant' },
  { value: 'colorful', label: 'Coloré', description: 'Design vibrant et dynamique' }
]

const headerStyles = [
  { value: 'gradient', label: 'Dégradé' },
  { value: 'solid', label: 'Couleur unie' },
  { value: 'minimal', label: 'Minimal' }
]

const logoPositions = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' }
]

const logoSizes = [
  { value: 'small', label: 'Petit' },
  { value: 'medium', label: 'Moyen' },
  { value: 'large', label: 'Grand' }
]

const fontFamilies = [
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'courier', label: 'Courier' }
]

const fontSizes = [
  { value: 'small', label: 'Petit' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grand' }
]

const borderRadiusOptions = [
  { value: 'none', label: 'Aucun' },
  { value: 'rounded', label: 'Arrondi' },
  { value: 'full', label: 'Très arrondi' }
]

export default function InvoiceDesigner() {
  const [settings, setSettings] = useState<InvoiceDesignSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [companyName, setCompanyName] = useState('Votre Entreprise')

  useEffect(() => {
    fetchSettings()
    fetchCompanyName()
  }, [])

  const fetchCompanyName = async () => {
    try {
      const response = await fetch('/api/settings/company')
      if (response.ok) {
        const data = await response.json()
        setCompanyName(data.companyName || 'Votre Entreprise')
      }
    } catch (error) {
      console.error('Error fetching company name:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/invoice-design')
      if (response.ok) {
        const data = await response.json()
        // S'assurer que les valeurs null sont converties en chaînes vides
        const cleanedData = {
          ...data,
          watermarkText: data.watermarkText || '',
          customCSS: data.customCSS || ''
        }
        setSettings({ ...defaultSettings, ...cleanedData })
      }
    } catch (error) {
      console.error('Error fetching design settings:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: keyof InvoiceDesignSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Nettoyer les données avant envoi
      const cleanedSettings = {
        ...settings,
        watermarkText: settings.watermarkText || '',
        customCSS: settings.customCSS || ''
      }

      console.log('📤 Envoi des données:', JSON.stringify(cleanedSettings, null, 2))

      const response = await fetch('/api/settings/invoice-design', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedSettings),
      })

      if (response.ok) {
        toast.success('Design de facture sauvegardé avec succès')
      } else {
        const error = await response.json()
        console.error('❌ Erreur de sauvegarde:', error)
        toast.error(`Erreur: ${error.error || 'Erreur lors de la sauvegarde'}`)

        // Afficher les détails de l'erreur si disponibles
        if (error.details) {
          console.error('Détails de l\'erreur:', error.details)
          error.details.forEach((detail: any) => {
            console.error(`- ${detail.field}: ${detail.message} (reçu: ${detail.received})`)
          })
        }
      }
    } catch (error) {
      console.error('Error saving design settings:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    toast.info('Paramètres réinitialisés aux valeurs par défaut')
  }

  const handlePreview = async () => {
    try {
      const response = await fetch('/api/invoices/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ designSettings: settings }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      } else {
        toast.error('Erreur lors de la génération de l\'aperçu')
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      toast.error('Erreur lors de la génération de l\'aperçu')
    }
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
    <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8 prevent-overflow">
      {/* Header avec actions - Responsive */}
      <Card className="glass">
        <CardHeader className="pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Palette className="w-5 h-5 flex-shrink-0" />
              <CardTitle className="truncate">Designer de Facture</CardTitle>
            </div>

            {/* Actions sur desktop */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>

            {/* Actions sur mobile */}
            <div className="sm:hidden flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="flex-1 flex items-center justify-center gap-2 text-xs"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 text-xs"
                size="sm"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Layout principal avec aperçu - Responsive */}
      <div className="settings-grid gap-4 sm:gap-6">
        {/* Panneau de configuration */}
        <div className="space-y-4 sm:space-y-6 order-2 xl:order-1">

          {/* Onglets de configuration - Responsive */}
          <Card className="glass">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="theme" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
              <TabsTrigger value="theme" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
                <span className="hidden sm:inline">Thème</span>
                <span className="sm:hidden">Thème</span>
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
                <span className="hidden sm:inline">Couleurs</span>
                <span className="sm:hidden">Couleurs</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
                <span className="hidden sm:inline">Mise en page</span>
                <span className="sm:hidden">Layout</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
                <span className="hidden sm:inline">Avancé</span>
                <span className="sm:hidden">Avancé</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Thème */}
            <TabsContent value="theme" className="space-y-4">
              <div>
                <Label>Thème de facture</Label>
                <Select value={settings.invoiceTheme} onValueChange={(value) => updateSetting('invoiceTheme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(theme => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div>
                          <div className="font-medium">{theme.label}</div>
                          <div className="text-sm text-gray-500">{theme.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Style d'en-tête</Label>
                  <Select value={settings.headerStyle} onValueChange={(value) => updateSetting('headerStyle', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {headerStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Famille de police</Label>
                  <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Onglet Couleurs */}
            <TabsContent value="colors" className="space-y-6">
              {/* Couleurs principales */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Couleurs Principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Couleur principale</Label>
                    <p className="text-xs text-gray-500 mb-2">Logo, accents, éléments principaux</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tableHeaderColor">Couleur des en-têtes de tableau</Label>
                    <p className="text-xs text-gray-500 mb-2">"Désignation", "Ref", "Qté", "Prix Unit.", "Total"</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tableHeaderColor"
                        type="color"
                        value={settings.tableHeaderColor}
                        onChange={(e) => updateSetting('tableHeaderColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.tableHeaderColor}
                        onChange={(e) => updateSetting('tableHeaderColor', e.target.value)}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sectionColor">Couleur des sections</Label>
                    <p className="text-xs text-gray-500 mb-2">"FACTURÉ À", "TOTAL TTC", fonds colorés</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sectionColor"
                        type="color"
                        value={settings.sectionColor}
                        onChange={(e) => updateSetting('sectionColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.sectionColor}
                        onChange={(e) => updateSetting('sectionColor', e.target.value)}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Couleur d'accent</Label>
                    <p className="text-xs text-gray-500 mb-2">Highlights, boutons spéciaux</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Couleur de fond</Label>
                    <p className="text-xs text-gray-500 mb-2">Arrière-plan du document</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Couleurs du texte */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Couleurs du Texte</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="textColor">Texte principal</Label>
                    <p className="text-xs text-gray-500 mb-2">Contenu, descriptions, montants</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => updateSetting('textColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.textColor}
                        onChange={(e) => updateSetting('textColor', e.target.value)}
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="headerTextColor">Texte de l'en-tête</Label>
                    <p className="text-xs text-gray-500 mb-2">Nom entreprise, "FACTURE", infos en-tête</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="headerTextColor"
                        type="color"
                        value={settings.headerTextColor}
                        onChange={(e) => updateSetting('headerTextColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.headerTextColor}
                        onChange={(e) => updateSetting('headerTextColor', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sectionTextColor">Texte des sections</Label>
                    <p className="text-xs text-gray-500 mb-2">"FACTURÉ À", "Désignation", "Qté", "Total TTC"</p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sectionTextColor"
                        type="color"
                        value={settings.sectionTextColor}
                        onChange={(e) => updateSetting('sectionTextColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.sectionTextColor}
                        onChange={(e) => updateSetting('sectionTextColor', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Onglet Mise en page */}
            <TabsContent value="layout" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Position du logo</Label>
                  <Select value={settings.logoPosition} onValueChange={(value) => updateSetting('logoPosition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {logoPositions.map(pos => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Taille du logo</Label>
                  <Select value={settings.logoSize} onValueChange={(value) => updateSetting('logoSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {logoSizes.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Taille de police</Label>
                  <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bordures arrondies</Label>
                  <Select value={settings.borderRadius} onValueChange={(value) => updateSetting('borderRadius', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {borderRadiusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Onglet Avancé */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Filigrane</Label>
                    <p className="text-sm text-gray-500">Ajouter un filigrane sur les factures</p>
                  </div>
                  <Switch
                    checked={settings.showWatermark}
                    onCheckedChange={(checked) => updateSetting('showWatermark', checked)}
                  />
                </div>

                {settings.showWatermark && (
                  <div>
                    <Label htmlFor="watermarkText">Texte du filigrane</Label>
                    <Input
                      id="watermarkText"
                      value={settings.watermarkText || ''}
                      onChange={(e) => updateSetting('watermarkText', e.target.value)}
                      placeholder="CONFIDENTIEL"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="customCSS">CSS personnalisé</Label>
                  <Textarea
                    id="customCSS"
                    value={settings.customCSS || ''}
                    onChange={(e) => updateSetting('customCSS', e.target.value)}
                    placeholder="/* CSS personnalisé pour les factures */"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    CSS avancé pour personnaliser davantage l'apparence des factures
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        </div>

        {/* Panneau d'aperçu en temps réel - Responsive */}
        <div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
          <Card className="glass">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 flex-shrink-0" />
                <CardTitle className="text-base sm:text-lg">Aperçu en Temps Réel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="hidden sm:inline">Visualisez instantanément l'effet de vos modifications sur le design de la facture.</span>
                  <span className="sm:hidden">Aperçu de vos modifications en temps réel.</span>
                </p>

                {/* Aperçu de la facture - Responsive */}
                <div className="border rounded-lg p-2 sm:p-4 bg-gray-50 overflow-hidden">
                  <div className="transform scale-75 sm:scale-90 lg:scale-100 origin-top-left">
                    <InvoicePreview
                      settings={settings}
                      companyName={companyName}
                    />
                  </div>
                </div>

                {/* Informations sur l'aperçu - Responsive */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="hidden sm:block">• L'aperçu se met à jour automatiquement lors de vos modifications</p>
                  <p className="hidden sm:block">• Utilisez "Télécharger PDF" pour voir le rendu final</p>
                  <p className="hidden sm:block">• Les couleurs peuvent légèrement varier entre l'aperçu et le PDF</p>
                  <p className="sm:hidden">• Aperçu automatique • PDF pour rendu final</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raccourcis rapides - Responsive */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">
                <span className="hidden sm:inline">Raccourcis Rapides</span>
                <span className="sm:hidden">Raccourcis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettings(prev => ({ ...prev, invoiceTheme: 'modern', primaryColor: '#2563EB', tableHeaderColor: '#10B981', sectionColor: '#10B981' }))
                  }}
                  className="text-xs sm:text-sm py-2 px-3 h-auto"
                >
                  <span className="hidden sm:inline">Thème Moderne</span>
                  <span className="sm:hidden">Moderne</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettings(prev => ({ ...prev, invoiceTheme: 'classic', primaryColor: '#1F2937', tableHeaderColor: '#374151', sectionColor: '#374151' }))
                  }}
                  className="text-xs sm:text-sm py-2 px-3 h-auto"
                >
                  <span className="hidden sm:inline">Thème Classique</span>
                  <span className="sm:hidden">Classique</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettings(prev => ({ ...prev, invoiceTheme: 'minimal', primaryColor: '#6B7280', tableHeaderColor: '#9CA3AF', sectionColor: '#9CA3AF' }))
                  }}
                  className="text-xs sm:text-sm py-2 px-3 h-auto"
                >
                  <span className="hidden sm:inline">Thème Minimal</span>
                  <span className="sm:hidden">Minimal</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettings(prev => ({ ...prev, invoiceTheme: 'colorful', primaryColor: '#7C3AED', tableHeaderColor: '#EC4899', sectionColor: '#EC4899' }))
                  }}
                  className="text-xs sm:text-sm py-2 px-3 h-auto"
                >
                  <span className="hidden sm:inline">Thème Coloré</span>
                  <span className="sm:hidden">Coloré</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
