'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatAmountInWords } from '@/lib/number-to-words'

interface DesignSettings {
  invoiceTheme?: string
  primaryColor?: string
  secondaryColor?: string
  tableHeaderColor?: string
  sectionColor?: string
  accentColor?: string
  textColor?: string
  headerTextColor?: string
  sectionTextColor?: string
  backgroundColor?: string
  headerStyle?: string
  logoPosition?: string
  logoSize?: string
  fontFamily?: string
  fontSize?: string
  borderRadius?: string
  showWatermark?: boolean
  watermarkText?: string
}

interface InvoicePreviewProps {
  settings: DesignSettings
  companyName?: string
}

export default function InvoicePreview({ settings, companyName = "Votre Entreprise" }: InvoicePreviewProps) {
  const {
    primaryColor = '#2563EB',
    secondaryColor = '#10B981',
    tableHeaderColor = '#10B981',
    sectionColor = '#10B981',
    accentColor = '#F59E0B',
    textColor = '#1F2937',
    headerTextColor = '#FFFFFF',
    sectionTextColor = '#FFFFFF',
    backgroundColor = '#FFFFFF',
    headerStyle = 'gradient',
    logoPosition = 'left',
    logoSize = 'medium',
    fontFamily = 'helvetica',
    fontSize = 'normal',
    borderRadius = 'rounded',
    showWatermark = false,
    watermarkText = ''
  } = settings

  // Styles dynamiques basés sur les paramètres
  const getHeaderStyle = () => {
    const baseStyle = {
      padding: '1.5rem',
      color: 'white',
      borderRadius: borderRadius === 'none' ? '0' : borderRadius === 'full' ? '1rem' : '0.5rem 0.5rem 0 0'
    }

    switch (headerStyle) {
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }
      case 'solid':
        return {
          ...baseStyle,
          backgroundColor: primaryColor
        }
      case 'minimal':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: headerTextColor,
          borderBottom: `2px solid ${primaryColor}`,
          padding: '1rem 1.5rem'
        }
      default:
        return baseStyle
    }
  }

  const getLogoSize = () => {
    switch (logoSize) {
      case 'small': return '2rem'
      case 'large': return '4rem'
      default: return '3rem'
    }
  }

  const getFontSize = () => {
    switch (fontSize) {
      case 'small': return { base: '0.75rem', title: '1.25rem', header: '1rem' }
      case 'large': return { base: '1rem', title: '2rem', header: '1.25rem' }
      default: return { base: '0.875rem', title: '1.5rem', header: '1.125rem' }
    }
  }

  const getFontFamily = () => {
    switch (fontFamily) {
      case 'times': return 'Times, serif'
      case 'courier': return 'Courier, monospace'
      default: return 'Arial, sans-serif'
    }
  }

  const fontSizes = getFontSize()
  const logoSizeValue = getLogoSize()

  return (
    <div className="relative">
      <Card 
        className="w-full max-w-2xl mx-auto shadow-lg overflow-hidden"
        style={{ 
          backgroundColor,
          fontFamily: getFontFamily(),
          borderRadius: borderRadius === 'none' ? '0' : borderRadius === 'full' ? '1rem' : '0.5rem'
        }}
      >
        {/* En-tête */}
        <div style={getHeaderStyle()}>
          <div className="flex items-center justify-between">
            {/* Logo et informations entreprise */}
            <div className={`flex items-center gap-4 ${logoPosition === 'center' ? 'mx-auto' : logoPosition === 'right' ? 'ml-auto' : ''}`}>
              {/* Logo simulé */}
              <div 
                className="rounded-full flex items-center justify-center font-bold text-white"
                style={{ 
                  width: logoSizeValue, 
                  height: logoSizeValue,
                  backgroundColor: headerStyle === 'minimal' ? primaryColor : 'rgba(255,255,255,0.2)',
                  fontSize: `calc(${logoSizeValue} * 0.4)`
                }}
              >
                {companyName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              
              <div>
                <h1
                  className="font-bold"
                  style={{
                    fontSize: fontSizes.header,
                    color: headerTextColor
                  }}
                >
                  {companyName}
                </h1>
                <p
                  className="opacity-90"
                  style={{
                    fontSize: fontSizes.base,
                    color: headerTextColor
                  }}
                >
                  123 Avenue Mohammed V, Casablanca
                </p>
              </div>
            </div>

            {/* Titre FACTURE */}
            <div className="text-right">
              <h2
                className="font-bold"
                style={{
                  fontSize: fontSizes.title,
                  color: headerTextColor
                }}
              >
                FACTURE
              </h2>
              <p
                style={{
                  fontSize: fontSizes.base,
                  color: headerTextColor
                }}
              >
                N° FACT-2025-001
              </p>
              <p
                style={{
                  fontSize: fontSizes.base,
                  color: headerTextColor
                }}
              >
                Date: {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu de la facture */}
        <CardContent className="p-6" style={{ color: textColor }}>
          {/* Section FACTURÉ À */}
          <div className="mb-6">
            <div
              className="px-3 py-2 text-sm font-semibold mb-2"
              style={{
                backgroundColor: sectionColor,
                color: sectionTextColor,
                borderRadius: borderRadius === 'none' ? '0' : '0.25rem'
              }}
            >
              FACTURÉ À
            </div>
            <div className="pl-3">
              <p className="font-semibold" style={{ fontSize: fontSizes.base }}>Client Exemple SARL</p>
              <p style={{ fontSize: fontSizes.base }}>123 Boulevard Hassan II</p>
              <p style={{ fontSize: fontSizes.base }}>Rabat 10000, Maroc</p>
            </div>
          </div>

          {/* Tableau des articles */}
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr
                  className="text-sm"
                  style={{
                    backgroundColor: tableHeaderColor,
                    color: sectionTextColor
                  }}
                >
                  <th className="text-left p-3" style={{ fontSize: fontSizes.base }}>Désignation</th>
                  <th className="text-center p-3" style={{ fontSize: fontSizes.base }}>Qté</th>
                  <th className="text-right p-3" style={{ fontSize: fontSizes.base }}>Prix Unit.</th>
                  <th className="text-right p-3" style={{ fontSize: fontSizes.base }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3" style={{ fontSize: fontSizes.base }}>Produit Exemple</td>
                  <td className="text-center p-3" style={{ fontSize: fontSizes.base }}>2</td>
                  <td className="text-right p-3" style={{ fontSize: fontSizes.base }}>1 500,00 MAD</td>
                  <td className="text-right p-3 font-semibold" style={{ fontSize: fontSizes.base }}>3 000,00 MAD</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3" style={{ fontSize: fontSizes.base }}>Service Consultation</td>
                  <td className="text-center p-3" style={{ fontSize: fontSizes.base }}>1</td>
                  <td className="text-right p-3" style={{ fontSize: fontSizes.base }}>800,00 MAD</td>
                  <td className="text-right p-3 font-semibold" style={{ fontSize: fontSizes.base }}>800,00 MAD</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2" style={{ fontSize: fontSizes.base }}>
                <span>Sous-total HT</span>
                <span>3 800,00 MAD</span>
              </div>
              <div className="flex justify-between py-2" style={{ fontSize: fontSizes.base }}>
                <span>TVA (20%)</span>
                <span>760,00 MAD</span>
              </div>
              <div
                className="flex justify-between py-3 px-3 font-bold"
                style={{
                  backgroundColor: sectionColor,
                  color: sectionTextColor,
                  fontSize: fontSizes.base,
                  borderRadius: borderRadius === 'none' ? '0' : '0.25rem'
                }}
              >
                <span>TOTAL TTC</span>
                <span>4 560,00 MAD</span>
              </div>
            </div>
          </div>

          {/* Montant en lettres */}
          <div className="mt-4 p-3 bg-gray-50 border rounded" style={{ borderColor: primaryColor }}>
            <p className="text-sm italic" style={{ color: textColor, fontSize: fontSizes.small }}>
              {formatAmountInWords(4560)}
            </p>
          </div>

          {/* Notes */}
          <div className="mt-6 p-3 border rounded" style={{ borderColor: primaryColor }}>
            <p style={{ fontSize: fontSizes.base }}>
              Merci pour votre confiance ! Ceci est un aperçu de votre design personnalisé.
            </p>
          </div>
        </CardContent>

        {/* Filigrane */}
        {showWatermark && watermarkText && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: 'rotate(-45deg)',
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'rgba(0,0,0,0.1)',
              zIndex: 1
            }}
          >
            {watermarkText}
          </div>
        )}
      </Card>

      {/* Indicateur de mise à jour */}
      <div className="absolute top-2 right-2">
        <div 
          className="px-2 py-1 rounded text-xs text-white"
          style={{ backgroundColor: accentColor }}
        >
          Aperçu en temps réel
        </div>
      </div>
    </div>
  )
}
