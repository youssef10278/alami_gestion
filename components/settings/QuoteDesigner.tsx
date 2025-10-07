'use client'

import { useState, useEffect } from 'react'
import { FileText, Eye, Save, RotateCcw, Download, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import QuotePreview from './QuotePreview'

interface QuoteDesignSettings {
  quoteTheme: string
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
  showValidityPeriod: boolean
  validityPeriodText: string
  showTermsAndConditions: boolean
  termsAndConditionsText: string
}

const defaultSettings: QuoteDesignSettings = {
  quoteTheme: 'modern',
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
  fontFamily: 'Inter',
  fontSize: 'medium',
  borderRadius: 'medium',
  showWatermark: false,
  watermarkText: 'DEVIS',
  customCSS: '',
  showValidityPeriod: true,
  validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
  showTermsAndConditions: true,
  termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
}

export default function QuoteDesigner() {
  const [settings, setSettings] = useState<QuoteDesignSettings>(defaultSettings)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/quote-design')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/quote-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Paramètres de design du devis sauvegardés')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const resetToDefault = () => {
    setSettings(defaultSettings)
    toast.info('Paramètres remis par défaut')
  }

  const updateSetting = (key: keyof QuoteDesignSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Designer de Devis</h2>
            <p className="text-sm text-gray-600">Personnalisez l'apparence de vos devis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Masquer' : 'Aperçu'}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panneau de configuration */}
        <div className="space-y-6">
          <Tabs defaultValue="theme" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theme">Thème</TabsTrigger>
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="layout">Mise en page</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
            </TabsList>

            {/* Onglet Thème */}
            <TabsContent value="theme" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Thème et Style
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Thème du devis</Label>
                    <Select
                      value={settings.quoteTheme}
                      onValueChange={(value) => updateSetting('quoteTheme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Moderne</SelectItem>
                        <SelectItem value="classic">Classique</SelectItem>
                        <SelectItem value="minimal">Minimaliste</SelectItem>
                        <SelectItem value="professional">Professionnel</SelectItem>
                        <SelectItem value="creative">Créatif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Police de caractères</Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => updateSetting('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Taille de police</Label>
                    <Select
                      value={settings.fontSize}
                      onValueChange={(value) => updateSetting('fontSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petite</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Bordures arrondies</Label>
                    <Select
                      value={settings.borderRadius}
                      onValueChange={(value) => updateSetting('borderRadius', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="small">Petites</SelectItem>
                        <SelectItem value="medium">Moyennes</SelectItem>
                        <SelectItem value="large">Grandes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Couleurs */}
            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Palette de couleurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Couleur principale</Label>
                      <Input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Couleur secondaire</Label>
                      <Input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Couleur d'accent</Label>
                      <Input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Couleur de fond</Label>
                      <Input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Mise en page */}
            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration de la mise en page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Position du logo</Label>
                    <Select
                      value={settings.logoPosition}
                      onValueChange={(value) => updateSetting('logoPosition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Gauche</SelectItem>
                        <SelectItem value="center">Centre</SelectItem>
                        <SelectItem value="right">Droite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Taille du logo</Label>
                    <Select
                      value={settings.logoSize}
                      onValueChange={(value) => updateSetting('logoSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petit</SelectItem>
                        <SelectItem value="medium">Moyen</SelectItem>
                        <SelectItem value="large">Grand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Style d'en-tête</Label>
                    <Select
                      value={settings.headerStyle}
                      onValueChange={(value) => updateSetting('headerStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Couleur unie</SelectItem>
                        <SelectItem value="gradient">Dégradé</SelectItem>
                        <SelectItem value="transparent">Transparent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Contenu */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu du devis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Afficher la période de validité</Label>
                    <Switch
                      checked={settings.showValidityPeriod}
                      onCheckedChange={(checked) => updateSetting('showValidityPeriod', checked)}
                    />
                  </div>

                  {settings.showValidityPeriod && (
                    <div>
                      <Label>Texte de validité</Label>
                      <Textarea
                        value={settings.validityPeriodText}
                        onChange={(e) => updateSetting('validityPeriodText', e.target.value)}
                        placeholder="Ce devis est valable..."
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label>Afficher les conditions générales</Label>
                    <Switch
                      checked={settings.showTermsAndConditions}
                      onCheckedChange={(checked) => updateSetting('showTermsAndConditions', checked)}
                    />
                  </div>

                  {settings.showTermsAndConditions && (
                    <div>
                      <Label>Conditions générales</Label>
                      <Textarea
                        value={settings.termsAndConditionsText}
                        onChange={(e) => updateSetting('termsAndConditionsText', e.target.value)}
                        placeholder="Conditions générales..."
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label>Afficher le filigrane</Label>
                    <Switch
                      checked={settings.showWatermark}
                      onCheckedChange={(checked) => updateSetting('showWatermark', checked)}
                    />
                  </div>

                  {settings.showWatermark && (
                    <div>
                      <Label>Texte du filigrane</Label>
                      <Input
                        value={settings.watermarkText}
                        onChange={(e) => updateSetting('watermarkText', e.target.value)}
                        placeholder="DEVIS"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Aperçu */}
        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Aperçu du devis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuotePreview settings={settings} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
