import { prisma } from './prisma'

export interface CompanySettings {
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
  createdAt: Date
  updatedAt: Date
}

/**
 * Récupère les paramètres de l'entreprise depuis la base de données
 * @returns Les paramètres de l'entreprise ou des valeurs par défaut
 */
export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    let settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      // Créer des paramètres par défaut si aucun n'existe
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'Mon Entreprise',
          invoicePrefix: 'FAC',
          creditNotePrefix: 'FAV',
          defaultTaxRate: 20,
        }
      })
    }

    return settings
  } catch (error) {
    console.error('Error fetching company settings:', error)
    
    // Retourner des paramètres par défaut en cas d'erreur
    return {
      id: 'default',
      companyName: 'Mon Entreprise',
      invoicePrefix: 'FAC',
      creditNotePrefix: 'FAV',
      defaultTaxRate: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
}

/**
 * Convertit les paramètres de l'entreprise en format compatible avec le générateur PDF
 */
export function formatCompanySettingsForPDF(settings: CompanySettings) {
  return {
    name: settings.companyName,
    address: settings.companyAddress,
    phone: settings.companyPhone,
    email: settings.companyEmail,
    ice: settings.companyICE,
    taxId: settings.companyTaxId,
    website: settings.companyWebsite,
    logo: settings.companyLogo,
  }
}

