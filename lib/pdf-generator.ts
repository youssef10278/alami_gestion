import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getCompanySettings, formatCompanySettingsForPDF } from './company-settings'
import { formatAmountInWords } from './number-to-words'

// Configuration pour le support UTF-8
function setupPDFFont(doc: jsPDF) {
  // Utiliser une police qui supporte l'UTF-8
  try {
    // Essayer d'utiliser une police système qui supporte l'UTF-8
    doc.setFont('helvetica', 'normal')
    // Forcer l'encodage UTF-8
    doc.setCharSpace(0)
  } catch (error) {
    console.warn('Font setup warning:', error)
    // Fallback vers la police par défaut
    doc.setFont('helvetica', 'normal')
  }
}

/**
 * Charge une image depuis une URL et la convertit en base64 pour jsPDF
 */
async function loadImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    // Si l'URL est relative, la convertir en URL absolue
    let fullUrl = imageUrl
    if (imageUrl.startsWith('/')) {
      // En développement ou production, construire l'URL complète
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      fullUrl = `${baseUrl}${imageUrl}`
    }

    const response = await fetch(fullUrl)
    if (!response.ok) {
      console.warn(`Failed to load image: ${response.status} ${response.statusText}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    // Déterminer le type MIME
    const contentType = response.headers.get('content-type') || 'image/png'

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.warn('Error loading image:', error)
    return null
  }
}

/**
 * Ajoute le logo de l'entreprise au PDF
 */
async function addCompanyLogo(doc: jsPDF, company: CompanyInfo, x: number, y: number, size: number = 24, textColor: [number, number, number] = [255, 255, 255]) {
  if (company.logo) {
    try {
      const logoBase64 = await loadImageAsBase64(company.logo)
      if (logoBase64) {
        // Ajouter l'image au PDF
        doc.addImage(logoBase64, 'PNG', x - size/2, y - size/2, size, size)
        return true
      }
    } catch (error) {
      console.warn('Error adding logo to PDF:', error)
    }
  }

  // Fallback: cercle avec initiales (couleur plus claire comme l'aperçu)
  const logoColor = [135, 206, 235] // Couleur bleu clair comme l'aperçu
  doc.setFillColor(...logoColor)
  doc.circle(x, y, size/2, 'F')

  // Initiales avec couleur du texte d'en-tête
  doc.setTextColor(...textColor)
  doc.setFontSize(size/2)
  doc.setFont('helvetica', 'bold')
  const initials = company.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
  doc.text(cleanText(initials), x, y + size/8, { align: 'center' })

  return false
}

// Fonction pour nettoyer et encoder correctement le texte
function cleanText(text: string): string {
  if (!text) return ''

  // Remplacer les caractères problématiques
  return text
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Mapping des caractères spéciaux courants
      const charMap: { [key: string]: string } = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n', 'œ': 'oe', 'æ': 'ae',
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'Ç': 'C', 'Ñ': 'N', 'Œ': 'OE', 'Æ': 'AE',
        // Caractères arabes courants - translittération
        'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h',
        'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's',
        'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
        'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm',
        'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'a', 'ء': 'a',
        'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ؤ': 'ou', 'ئ': 'i',
        // Autres caractères spéciaux
        '€': 'EUR', '£': 'GBP', '$': 'USD',
        '°': 'deg', '©': '(c)', '®': '(r)', '™': '(tm)',
        '"': '"', '"': '"', "'": "'", "'": "'",
        '–': '-', '—': '-', '…': '...'
      }

      return charMap[char] || char
    })
    .trim()
}

interface CompanyInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  ice?: string
  taxId?: string
  website?: string
  logo?: string
}

interface CustomerInfo {
  name: string
  company?: string
  address?: string
  phone?: string
  email?: string
}

interface InvoiceItem {
  name: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceData {
  documentNumber: string
  date: Date
  customer: CustomerInfo
  items: InvoiceItem[]
  totalAmount: number
  paidAmount: number
  creditAmount: number
  paymentMethod: string
  notes?: string
}

interface ManualInvoiceItem {
  productName: string
  productSku?: string
  description?: string
  quantity: number
  unitPrice: number
  discountAmount: number
  total: number
}

interface ManualInvoiceData {
  invoiceNumber: string
  type: 'INVOICE' | 'CREDIT_NOTE'
  date: Date
  dueDate?: Date
  customer: {
    name: string
    phone?: string
    email?: string
    address?: string
    taxId?: string
  }
  items: ManualInvoiceItem[]
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  terms?: string
  originalInvoice?: {
    invoiceNumber: string
  }
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Alami Gestion',
  address: 'Casablanca, Maroc',
  phone: '+212 6XX XXX XXX',
  email: 'contact@alami-gestion.ma',
}

interface DesignSettings {
  invoiceTheme?: string
  primaryColor?: string
  secondaryColor?: string
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
  customCSS?: string
}

export async function generateManualInvoicePDF(data: ManualInvoiceData, companyInfo?: CompanyInfo, designSettings?: DesignSettings) {
  const doc = new jsPDF()

  // Debug des paramètres reçus
  console.log('🎨 generateManualInvoicePDF - Paramètres de design reçus:', designSettings ? 'OUI' : 'NON')
  if (designSettings) {
    console.log('🎨 Couleurs reçues:', {
      primary: designSettings.primaryColor,
      secondary: designSettings.secondaryColor,
      headerText: designSettings.headerTextColor,
      sectionText: designSettings.sectionTextColor
    })
  }

  // Configurer la police pour le support UTF-8
  setupPDFFont(doc)

  // Récupérer les paramètres de l'entreprise depuis la base de données
  let company: CompanyInfo
  if (companyInfo) {
    company = companyInfo
  } else {
    try {
      const settings = await getCompanySettings()
      company = formatCompanySettingsForPDF(settings)
    } catch (error) {
      console.error('Error fetching company settings:', error)
      company = DEFAULT_COMPANY_INFO
    }
  }

  // Nettoyer les données de l'entreprise
  company = {
    name: cleanText(company.name),
    address: company.address ? cleanText(company.address) : undefined,
    phone: company.phone ? cleanText(company.phone) : undefined,
    email: company.email ? cleanText(company.email) : undefined,
    ice: company.ice ? cleanText(company.ice) : undefined,
    taxId: company.taxId ? cleanText(company.taxId) : undefined,
    website: company.website ? cleanText(company.website) : undefined,
    logo: company.logo
  }

  // Couleurs personnalisables selon les paramètres de design
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [41, 128, 185] // Fallback bleu par défaut
  }

  const primaryColor = hexToRgb(designSettings?.primaryColor || '#2563EB')
  const secondaryColor = hexToRgb(designSettings?.secondaryColor || '#10B981')
  const accentColor = hexToRgb(designSettings?.accentColor || '#F59E0B')
  const textColor = hexToRgb(designSettings?.textColor || '#1F2937')
  const headerTextColor = hexToRgb(designSettings?.headerTextColor || '#FFFFFF')
  const sectionTextColor = hexToRgb(designSettings?.sectionTextColor || '#FFFFFF')
  const backgroundColor = hexToRgb(designSettings?.backgroundColor || '#FFFFFF')
  const tableHeaderColor = hexToRgb(designSettings?.tableHeaderColor || designSettings?.secondaryColor || '#10B981')
  const sectionColor = hexToRgb(designSettings?.sectionColor || designSettings?.secondaryColor || '#10B981')

  // Debug des couleurs appliquées
  console.log('🎨 Couleurs appliquées dans le PDF:', {
    primaryColor: `${designSettings?.primaryColor || '#2563EB'} → RGB(${primaryColor.join(', ')})`,
    secondaryColor: `${designSettings?.secondaryColor || '#10B981'} → RGB(${secondaryColor.join(', ')})`,
    headerTextColor: `${designSettings?.headerTextColor || '#FFFFFF'} → RGB(${headerTextColor.join(', ')})`,
    sectionTextColor: `${designSettings?.sectionTextColor || '#FFFFFF'} → RGB(${sectionTextColor.join(', ')})`
  })

  // Couleurs dérivées pour la compatibilité
  const primaryBlue = primaryColor
  const greenHeader = secondaryColor
  const lightGray = [245, 245, 245] // Gris clair pour les fonds
  const darkGray = textColor
  const lightBlue = [227, 242, 253] // Bleu clair pour les sections

  // === EN-TÊTE AVEC STYLE PERSONNALISÉ ===
  const headerStyle = designSettings?.headerStyle || 'gradient'
  const logoPosition = designSettings?.logoPosition || 'left'
  const logoSize = designSettings?.logoSize || 'medium'
  
  // Calculer la taille du logo
  const logoSizeValue = logoSize === 'small' ? 20 : logoSize === 'large' ? 32 : 24
  
  // Appliquer le style d'en-tête selon les paramètres
  if (headerStyle === 'gradient') {
    // En-tête avec dégradé horizontal (comme l'aperçu)
    // Créer un dégradé en dessinant plusieurs rectangles avec des couleurs interpolées
    const steps = 20
    const stepWidth = 210 / steps
    
    for (let i = 0; i < steps; i++) {
      // Interpolation des couleurs de primaryColor vers secondaryColor
      const ratio = i / (steps - 1)
      const r = Math.round(primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * ratio)
      const g = Math.round(primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * ratio)
      const b = Math.round(primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * ratio)
      
      doc.setFillColor(r, g, b)
      doc.rect(i * stepWidth, 0, stepWidth + 1, 50, 'F')
    }
  } else if (headerStyle === 'solid') {
    // En-tête avec couleur unie
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 50, 'F')
  } else {
    // Style minimal - pas de fond, juste une bordure
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(2)
    doc.line(0, 50, 210, 50)
  }

  // === LOGO DE L'ENTREPRISE ===
  const logoX = logoPosition === 'center' ? 105 : logoPosition === 'right' ? 185 : 25
  await addCompanyLogo(doc, company, logoX, 25, logoSizeValue, headerTextColor)

  // === TITRE FACTURE ===
  doc.setTextColor(...(headerStyle === 'minimal' ? darkGray : headerTextColor))
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  const title = data.type === 'CREDIT_NOTE' ? 'FACTURE D\'AVOIR' : 'FACTURE'
  doc.text(cleanText(title), 150, 20)

  // Numéro de facture
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(cleanText(`N° ${data.invoiceNumber}`), 150, 30)

  // Date
  doc.text(cleanText(`Date: ${data.date.toLocaleDateString('fr-FR')}`), 150, 37)

  // === INFORMATIONS ENTREPRISE ===
  // Nom de l'entreprise à côté du logo
  doc.setTextColor(...(headerStyle === 'minimal' ? darkGray : headerTextColor))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText(company.name), 50, 20)

  // Informations de contact sous le nom
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...(headerStyle === 'minimal' ? darkGray : headerTextColor))
  let yPos = 26

  if (company.address) {
    const addressLines = company.address.split('\n')
    addressLines.forEach((line: string) => {
      doc.text(cleanText(line), 50, yPos)
      yPos += 4
    })
  }

  // Contact sur une ligne
  const contactInfo = []
  if (company.phone) contactInfo.push(`Tel: ${company.phone}`)
  if (company.email) contactInfo.push(`Email: ${company.email}`)
  if (contactInfo.length > 0) {
    doc.text(cleanText(contactInfo.join(' - ')), 50, yPos)
    yPos += 4
  }

  if (company.ice) {
    doc.text(cleanText(`ICE: ${company.ice}`), 50, yPos)
  }

  // === SECTION FACTURÉ À ===
  const clientSectionY = 60

  // Fond pour "FACTURÉ À" avec couleur secondaire
  doc.setFillColor(...sectionColor)
  doc.rect(15, clientSectionY, 180, 12, 'F')

  // Texte "FACTURÉ À"
  doc.setTextColor(...sectionTextColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText('FACTURE A'), 20, clientSectionY + 8)

  // Informations client
  doc.setFillColor(255, 255, 255)
  doc.rect(15, clientSectionY + 12, 180, 25, 'F')

  doc.setTextColor(...darkGray)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText(data.customer.name), 20, clientSectionY + 22)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  let clientY = clientSectionY + 28

  if (data.customer.address) {
    const addressLines = data.customer.address.split('\n')
    addressLines.forEach((line, index) => {
      if (index < 2) { // Limiter à 2 lignes
        doc.text(cleanText(line), 20, clientY)
        clientY += 4
      }
    })
  }

  // === TABLEAU DES ARTICLES ===
  const tableStartY = clientSectionY + 45

  // Préparation des données - Style simple et propre
  const tableData = data.items.map(item => [
    cleanText(item.productName),
    cleanText(item.productSku || '-'),
    item.quantity.toString(),
    `${item.unitPrice.toFixed(0)}MAD`,
    `${item.total.toFixed(0)}MAD`
  ])

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      cleanText('Designation'),
      cleanText('Ref'),
      cleanText('Qte'),
      cleanText('Prix Unit.'),
      cleanText('Total')
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: tableHeaderColor,
      textColor: sectionTextColor,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 6
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkGray,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.5
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: {
      0: { cellWidth: 70, halign: 'left' }, // Designation
      1: { cellWidth: 30, halign: 'center' }, // Ref
      2: { cellWidth: 20, halign: 'center' }, // Qté
      3: { cellWidth: 35, halign: 'center', fontSize: 8 }, // Prix Unit. - CENTRÉ + police plus petite
      4: { cellWidth: 35, halign: 'center', fontStyle: 'bold', fontSize: 8 } // Total - CENTRÉ + police plus petite
    },
    margin: { left: 15, right: 15 },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    }
  })

  // === SECTION TOTAUX - Style moderne ===
  const finalY = (doc as any).lastAutoTable.finalY + 10

  // Totaux alignés à droite
  const totalsX = 120
  let currentY = finalY

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkGray)

  // Sous-total HT
  doc.text(cleanText('Sous-total HT'), totalsX, currentY)
  doc.setFontSize(9)
  doc.text(`${data.subtotal.toFixed(0)}MAD`, 195, currentY, { align: 'right' })
  currentY += 8

  // TVA
  doc.setFontSize(10)
  doc.text(cleanText(`TVA (${data.taxRate}%)`), totalsX, currentY)
  doc.setFontSize(9)
  doc.text(`${data.taxAmount.toFixed(0)}MAD`, 195, currentY, { align: 'right' })
  currentY += 10

  // Total TTC avec fond de couleur secondaire
  doc.setFillColor(...sectionColor)
  doc.rect(totalsX - 5, currentY - 5, 85, 12, 'F')

  doc.setTextColor(...sectionTextColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const totalLabel = data.type === 'CREDIT_NOTE' ? 'Total a rembourser:' : 'TOTAL TTC'
  doc.text(cleanText(totalLabel), totalsX, currentY + 3)

  // Calculer le total correct
  const calculatedTotal = data.subtotal - data.discountAmount + data.taxAmount
  const displayTotal = data.type === 'CREDIT_NOTE' ? -calculatedTotal : calculatedTotal
  doc.setFontSize(9)
  doc.text(`${displayTotal.toFixed(0)}MAD`, 195, currentY + 3, { align: 'right' })

  // === MONTANT EN LETTRES ===
  currentY += 20

  // Cadre pour le montant en lettres
  doc.setFillColor(245, 245, 245) // Gris très clair
  doc.setDrawColor(...sectionColor)
  doc.setLineWidth(1)
  doc.rect(15, currentY - 5, 180, 15, 'FD')

  // Texte du montant en lettres
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  const amountInWords = formatAmountInWords(Math.abs(displayTotal))
  const wordsLines = doc.splitTextToSize(cleanText(amountInWords), 170)
  doc.text(wordsLines, 20, currentY + 3)

  // === NOTES - Style simple ===
  let notesY = currentY + 25

  if (data.notes) {
    // Cadre simple pour les notes
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.rect(15, notesY, 180, 20, 'S')

    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const noteLines = doc.splitTextToSize(cleanText(data.notes), 170)
    doc.text(noteLines, 20, notesY + 8)
    notesY += 25
  }

  // === PIED DE PAGE SIMPLE ===
  const pageHeight = doc.internal.pageSize.height

  // Ligne de séparation avec couleur secondaire
  doc.setDrawColor(...sectionColor)
  doc.setLineWidth(2)
  doc.line(15, pageHeight - 40, 195, pageHeight - 40)

  // Informations légales centrées
  doc.setTextColor(...darkGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(cleanText('Siret pour votre confiance'), 105, pageHeight - 30, { align: 'center' })
  doc.text(cleanText('Conditions de paiement: 30 jours'), 105, pageHeight - 25, { align: 'center' })

  // Contact en bas
  const contactLine = `${company.name} - ${company.phone || ''} - ${company.email || ''}`
  doc.text(cleanText(contactLine), 105, pageHeight - 15, { align: 'center' })

  // Ajouter le filigrane si activé
  if (designSettings?.showWatermark && designSettings?.watermarkText) {
    addWatermark(doc, designSettings.watermarkText)
  }

  return doc
}

/**
 * Ajoute un filigrane au PDF
 */
function addWatermark(doc: jsPDF, watermarkText: string) {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  // Sauvegarder l'état actuel
  doc.saveGraphicsState()

  // Configurer le filigrane
  doc.setTextColor(200, 200, 200, 0.3) // Gris très clair avec transparence
  doc.setFontSize(60)
  doc.setFont('helvetica', 'bold')

  // Rotation de 45 degrés
  const angle = -45 * Math.PI / 180
  const centerX = pageWidth / 2
  const centerY = pageHeight / 2

  // Appliquer la rotation
  doc.text(
    cleanText(watermarkText),
    centerX,
    centerY,
    {
      align: 'center',
      angle: angle
    }
  )

  // Restaurer l'état
  doc.restoreGraphicsState()
}

export async function generateInvoicePDF(data: InvoiceData, type: 'invoice' | 'quote' | 'delivery' = 'invoice', designSettings?: DesignSettings) {
  const doc = new jsPDF()

  // Configurer la police pour le support UTF-8
  setupPDFFont(doc)

  // Récupérer les paramètres de l'entreprise
  let company: CompanyInfo
  try {
    const settings = await getCompanySettings()
    company = formatCompanySettingsForPDF(settings)
  } catch (error) {
    console.error('Error fetching company settings:', error)
    company = DEFAULT_COMPANY_INFO
  }

  // Couleurs personnalisables selon les paramètres de design
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [41, 128, 185] // Fallback bleu par défaut
  }

  const primaryColor = hexToRgb(designSettings?.primaryColor || '#2563EB')
  const secondaryColor = hexToRgb(designSettings?.secondaryColor || '#10B981')
  const accentColor = hexToRgb(designSettings?.accentColor || '#F59E0B')
  const textColor = hexToRgb(designSettings?.textColor || '#1F2937')
  const headerTextColor = hexToRgb(designSettings?.headerTextColor || '#FFFFFF')
  const sectionTextColor = hexToRgb(designSettings?.sectionTextColor || '#FFFFFF')
  const backgroundColor = hexToRgb(designSettings?.backgroundColor || '#FFFFFF')
  const tableHeaderColor = hexToRgb(designSettings?.tableHeaderColor || designSettings?.secondaryColor || '#10B981')
  const sectionColor = hexToRgb(designSettings?.sectionColor || designSettings?.secondaryColor || '#10B981')

  // Couleurs supplémentaires
  const darkGray = textColor
  const lightGray: [number, number, number] = [245, 245, 245]

  // Nettoyer les données de l'entreprise
  company = {
    name: cleanText(company.name),
    address: company.address ? cleanText(company.address) : undefined,
    phone: company.phone ? cleanText(company.phone) : undefined,
    email: company.email ? cleanText(company.email) : undefined,
    ice: company.ice ? cleanText(company.ice) : undefined,
    taxId: company.taxId ? cleanText(company.taxId) : undefined,
    website: company.website ? cleanText(company.website) : undefined,
    logo: company.logo
  }

  // Titre du document
  const title = type === 'invoice' ? 'FACTURE' : type === 'quote' ? 'DEVIS' : 'BON DE LIVRAISON'

  // En-tête - Logo et informations entreprise avec style personnalisé
  const headerStyle = designSettings?.headerStyle || 'gradient'
  
  if (headerStyle === 'gradient') {
    // En-tête avec dégradé horizontal (comme l'aperçu)
    const steps = 20
    const stepWidth = 210 / steps
    
    for (let i = 0; i < steps; i++) {
      // Interpolation des couleurs de primaryColor vers secondaryColor
      const ratio = i / (steps - 1)
      const r = Math.round(primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * ratio)
      const g = Math.round(primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * ratio)
      const b = Math.round(primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * ratio)
      
      doc.setFillColor(r, g, b)
      doc.rect(i * stepWidth, 0, stepWidth + 1, 40, 'F')
    }
  } else if (headerStyle === 'solid') {
    // En-tête avec couleur unie
    doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  } else {
    // Style minimal - pas de fond, juste une bordure
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(2)
    doc.line(0, 40, 210, 40)
  }

  // Ajouter le logo en haut à gauche
  await addCompanyLogo(doc, company, 20, 25, 20, headerTextColor)

  doc.setTextColor(...(headerStyle === 'minimal' ? textColor : headerTextColor))
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText(company.name), 45, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (company.address) doc.text(cleanText(company.address), 45, 27)
  if (company.phone) doc.text(cleanText(`Tel: ${company.phone}`), 45, 32)
  if (company.email) doc.text(cleanText(`Email: ${company.email}`), 45, 37)

  // Titre du document
  doc.setTextColor(...(headerStyle === 'minimal' ? primaryColor : headerTextColor))
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText(title), 150, 20)

  // Numéro et date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...(headerStyle === 'minimal' ? textColor : headerTextColor))
  doc.text(cleanText(`N°: ${data.documentNumber}`), 150, 27)
  doc.text(cleanText(`Date: ${data.date.toLocaleDateString('fr-FR')}`), 150, 32)

  // Informations client
  doc.setFillColor(...secondaryColor)
  doc.rect(15, 50, 180, 30, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...sectionTextColor)
  doc.text(cleanText('CLIENT'), 20, 58)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let yPos = 65
  doc.text(cleanText(data.customer.name), 20, yPos)
  if (data.customer.company) {
    yPos += 5
    doc.text(cleanText(data.customer.company), 20, yPos)
  }
  if (data.customer.address) {
    yPos += 5
    doc.text(cleanText(data.customer.address), 20, yPos)
  }
  if (data.customer.phone) {
    yPos += 5
    doc.text(cleanText(`Tel: ${data.customer.phone}`), 20, yPos)
  }

  // Tableau des articles
  const tableData = data.items.map((item) => [
    cleanText(item.sku),
    cleanText(item.name),
    item.quantity.toString(),
    `${item.unitPrice.toFixed(0)}DH`,
    `${item.total.toFixed(0)}DH`,
  ])

  autoTable(doc, {
    startY: 90,
    head: [[
      cleanText('SKU'),
      cleanText('Designation'),
      cleanText('Qte'),
      cleanText('Prix Unit.'),
      cleanText('Total')
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: tableHeaderColor,
      textColor: sectionTextColor,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 30 }, // SKU
      1: { cellWidth: 70 }, // Designation
      2: { cellWidth: 20, halign: 'center' }, // Qté
      3: { cellWidth: 30, halign: 'center', fontSize: 8 }, // Prix Unit. - CENTRÉ + police plus petite
      4: { cellWidth: 30, halign: 'center', fontSize: 8 }, // Total - CENTRÉ + police plus petite
    },
  })

  // Totaux
  const finalY = (doc as any).lastAutoTable.finalY || 90
  const totalsY = finalY + 10

  doc.setFillColor(...sectionColor)
  doc.rect(120, totalsY, 85, 30, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...sectionTextColor)
  doc.text(cleanText('Total:'), 125, totalsY + 7)
  doc.setFontSize(9)
  doc.text(`${data.totalAmount.toFixed(0)}DH`, 195, totalsY + 7, { align: 'right' })

  if (type === 'invoice') {
    doc.setFontSize(10)
    doc.text(cleanText('Paye:'), 125, totalsY + 14)
    doc.setFontSize(9)
    doc.text(`${data.paidAmount.toFixed(0)}DH`, 195, totalsY + 14, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(cleanText('Reste a payer:'), 125, totalsY + 21)
    doc.setFontSize(9)
    doc.text(`${data.creditAmount.toFixed(0)}DH`, 195, totalsY + 21, { align: 'right' })
  }

  // === MONTANT EN LETTRES ===
  const amountInWordsY = totalsY + 35

  // Cadre pour le montant en lettres
  doc.setFillColor(245, 245, 245) // Gris très clair
  doc.setDrawColor(...sectionColor)
  doc.setLineWidth(1)
  doc.rect(15, amountInWordsY - 5, 180, 15, 'FD')

  // Texte du montant en lettres
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  const amountInWords = formatAmountInWords(data.totalAmount)
  const wordsLines = doc.splitTextToSize(cleanText(amountInWords), 170)
  doc.text(wordsLines, 20, amountInWordsY + 3)

  // Méthode de paiement
  if (type === 'invoice') {
    const paymentY = amountInWordsY + 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const paymentMethodLabel = getPaymentMethodLabel(data.paymentMethod)
    doc.text(cleanText(`Mode de paiement: ${paymentMethodLabel}`), 15, paymentY)
  }

  // Notes
  let currentY = amountInWordsY + 25
  if (data.notes) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...textColor)
    doc.text(cleanText('Notes:'), 15, currentY)
    doc.setFont('helvetica', 'normal')
    const splitNotes = doc.splitTextToSize(cleanText(data.notes), 180)
    doc.text(splitNotes, 15, currentY + 5)
    currentY += 5 + (splitNotes.length * 5)
  }

  // Paramètres spécifiques aux devis
  if (type === 'quote') {
    // Période de validité
    if (designSettings?.showValidityPeriod && designSettings?.validityPeriodText) {
      currentY += 5
      doc.setFillColor(...sectionColor)
      doc.rect(15, currentY - 3, 180, 12, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...sectionTextColor)
      doc.text(cleanText('Validite du devis'), 20, currentY + 3)

      doc.setFont('helvetica', 'normal')
      const splitValidity = doc.splitTextToSize(cleanText(designSettings.validityPeriodText), 170)
      doc.text(splitValidity, 20, currentY + 8)
      currentY += 12 + (splitValidity.length * 4)
    }

    // Conditions générales
    if (designSettings?.showTermsAndConditions && designSettings?.termsAndConditionsText) {
      currentY += 5
      doc.setFillColor(...accentColor)
      doc.rect(15, currentY - 3, 180, 12, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...headerTextColor)
      doc.text(cleanText('Conditions generales'), 20, currentY + 3)

      doc.setFont('helvetica', 'normal')
      const splitTerms = doc.splitTextToSize(cleanText(designSettings.termsAndConditionsText), 170)
      doc.text(splitTerms, 20, currentY + 8)
      currentY += 12 + (splitTerms.length * 4)
    }
  }

  // Pied de page
  doc.setFontSize(8)
  doc.setTextColor(...textColor)
  doc.text(cleanText('Merci pour votre confiance !'), 105, 280, { align: 'center' })
  const footerInfo = [company.name, company.email].filter(Boolean).join(' - ')
  doc.text(cleanText(footerInfo), 105, 285, { align: 'center' })

  return doc
}

function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'CASH':
      return 'Especes'
    case 'CARD':
      return 'Carte bancaire'
    case 'TRANSFER':
      return 'Virement'
    case 'CREDIT':
      return 'Credit'
    default:
      return cleanText(method)
  }
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}

export function openPDFInNewTab(doc: jsPDF) {
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
}

