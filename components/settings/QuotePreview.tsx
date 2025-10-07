'use client'

import { Building2 } from 'lucide-react'

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

interface QuotePreviewProps {
  settings: QuoteDesignSettings
}

export default function QuotePreview({ settings }: QuotePreviewProps) {
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small': return 'text-xs'
      case 'large': return 'text-base'
      default: return 'text-sm'
    }
  }

  const getBorderRadiusClass = () => {
    switch (settings.borderRadius) {
      case 'none': return 'rounded-none'
      case 'small': return 'rounded-sm'
      case 'large': return 'rounded-lg'
      default: return 'rounded-md'
    }
  }

  const getLogoSizeClass = () => {
    switch (settings.logoSize) {
      case 'small': return 'w-12 h-12'
      case 'large': return 'w-20 h-20'
      default: return 'w-16 h-16'
    }
  }

  const getHeaderStyle = () => {
    const baseStyle = {
      color: settings.headerTextColor,
    }

    switch (settings.headerStyle) {
      case 'solid':
        return {
          ...baseStyle,
          backgroundColor: settings.primaryColor,
        }
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
        }
      case 'transparent':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: settings.textColor,
        }
      default:
        return baseStyle
    }
  }

  const sampleQuoteData = {
    quoteNumber: 'DEV-2024-001',
    date: '15/01/2024',
    validUntil: '14/02/2024',
    customer: {
      name: 'Entreprise ABC',
      address: '123 Rue de la Paix',
      city: '75001 Paris',
      email: 'contact@entreprise-abc.com'
    },
    items: [
      { description: 'Produit A', quantity: 2, price: 150.00, total: 300.00 },
      { description: 'Service B', quantity: 1, price: 250.00, total: 250.00 },
      { description: 'Produit C', quantity: 3, price: 75.00, total: 225.00 }
    ],
    subtotal: 775.00,
    tax: 155.00,
    total: 930.00
  }

  return (
    <div 
      className={`relative overflow-hidden ${getBorderRadiusClass()} shadow-lg`}
      style={{ 
        backgroundColor: settings.backgroundColor,
        color: settings.textColor,
        fontFamily: settings.fontFamily
      }}
    >
      {/* Filigrane */}
      {settings.showWatermark && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{ 
            fontSize: '4rem',
            color: settings.primaryColor + '10',
            transform: 'rotate(-45deg)',
            fontWeight: 'bold'
          }}
        >
          {settings.watermarkText}
        </div>
      )}

      {/* En-tête */}
      <div 
        className={`p-6 ${getBorderRadiusClass()}`}
        style={getHeaderStyle()}
      >
        <div className={`flex items-center ${settings.logoPosition === 'center' ? 'justify-center' : settings.logoPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center gap-4 ${settings.logoPosition === 'center' ? 'flex-col text-center' : ''}`}>
            <div 
              className={`${getLogoSizeClass()} ${getBorderRadiusClass()} flex items-center justify-center`}
              style={{ backgroundColor: settings.headerTextColor + '20' }}
            >
              <Building2 className="w-8 h-8" style={{ color: settings.headerTextColor }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Votre Entreprise</h1>
              <p className={`${getFontSizeClass()} opacity-90`}>123 Rue de l'Exemple, 75001 Paris</p>
            </div>
          </div>
        </div>
      </div>

      {/* Corps du devis */}
      <div className="p-6 space-y-6">
        {/* Informations du devis */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color: settings.sectionColor }}>
              DEVIS
            </h2>
            <div className={`space-y-1 ${getFontSizeClass()}`}>
              <p><strong>Numéro:</strong> {sampleQuoteData.quoteNumber}</p>
              <p><strong>Date:</strong> {sampleQuoteData.date}</p>
              <p><strong>Valable jusqu'au:</strong> {sampleQuoteData.validUntil}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: settings.sectionColor }}>
              Client
            </h3>
            <div className={`space-y-1 ${getFontSizeClass()}`}>
              <p className="font-medium">{sampleQuoteData.customer.name}</p>
              <p>{sampleQuoteData.customer.address}</p>
              <p>{sampleQuoteData.customer.city}</p>
              <p>{sampleQuoteData.customer.email}</p>
            </div>
          </div>
        </div>

        {/* Tableau des articles */}
        <div>
          <table className="w-full">
            <thead>
              <tr 
                className={`${getBorderRadiusClass()}`}
                style={{ backgroundColor: settings.tableHeaderColor, color: settings.sectionTextColor }}
              >
                <th className={`p-3 text-left ${getFontSizeClass()}`}>Description</th>
                <th className={`p-3 text-center ${getFontSizeClass()}`}>Qté</th>
                <th className={`p-3 text-right ${getFontSizeClass()}`}>Prix unit.</th>
                <th className={`p-3 text-right ${getFontSizeClass()}`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sampleQuoteData.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className={`p-3 ${getFontSizeClass()}`}>{item.description}</td>
                  <td className={`p-3 text-center ${getFontSizeClass()}`}>{item.quantity}</td>
                  <td className={`p-3 text-right ${getFontSizeClass()}`}>{item.price.toFixed(2)} DH</td>
                  <td className={`p-3 text-right ${getFontSizeClass()}`}>{item.total.toFixed(2)} DH</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className={`flex justify-between ${getFontSizeClass()}`}>
              <span>Sous-total:</span>
              <span>{sampleQuoteData.subtotal.toFixed(2)} DH</span>
            </div>
            <div className={`flex justify-between ${getFontSizeClass()}`}>
              <span>TVA (20%):</span>
              <span>{sampleQuoteData.tax.toFixed(2)} DH</span>
            </div>
            <div 
              className={`flex justify-between font-bold text-lg p-3 ${getBorderRadiusClass()}`}
              style={{ backgroundColor: settings.accentColor + '20', color: settings.accentColor }}
            >
              <span>Total:</span>
              <span>{sampleQuoteData.total.toFixed(2)} DH</span>
            </div>
          </div>
        </div>

        {/* Période de validité */}
        {settings.showValidityPeriod && (
          <div 
            className={`p-4 ${getBorderRadiusClass()}`}
            style={{ backgroundColor: settings.primaryColor + '10', borderLeft: `4px solid ${settings.primaryColor}` }}
          >
            <p className={`${getFontSizeClass()} font-medium`} style={{ color: settings.primaryColor }}>
              Validité du devis
            </p>
            <p className={`${getFontSizeClass()} mt-1`}>
              {settings.validityPeriodText}
            </p>
          </div>
        )}

        {/* Conditions générales */}
        {settings.showTermsAndConditions && (
          <div 
            className={`p-4 ${getBorderRadiusClass()}`}
            style={{ backgroundColor: settings.secondaryColor + '10', borderLeft: `4px solid ${settings.secondaryColor}` }}
          >
            <p className={`${getFontSizeClass()} font-medium`} style={{ color: settings.secondaryColor }}>
              Conditions générales
            </p>
            <p className={`${getFontSizeClass()} mt-1`}>
              {settings.termsAndConditionsText}
            </p>
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div 
        className={`p-4 text-center ${getFontSizeClass()}`}
        style={{ backgroundColor: settings.primaryColor + '10', color: settings.textColor }}
      >
        <p>Merci pour votre confiance !</p>
        <p className="text-xs mt-1 opacity-75">
          Ce devis a été généré automatiquement par votre système de gestion.
        </p>
      </div>
    </div>
  )
}
