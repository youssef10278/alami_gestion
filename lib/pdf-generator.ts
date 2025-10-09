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

// Fonction pour nettoyer le texte (GARDE LES ACCENTS, supprime uniquement les émojis)
function cleanText(text: string): string {
  if (!text) return ''

  // Supprimer uniquement les émojis et caractères problématiques
  // GARDER les accents français (é, è, à, ç, etc.)
  return text
    // Supprimer les émojis
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Émojis divers
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Symboles
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    // Remplacer les guillemets typographiques
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Remplacer les tirets longs
    .replace(/[–—]/g, '-')
    // Remplacer les points de suspension
    .replace(/…/g, '...')
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

  // === DESIGN SIMPLIFIÉ POUR LES DEVIS (comme l'aperçu) ===
  if (type === 'quote') {
    return generateSimpleQuotePDF(doc, data, company, designSettings, {
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      headerTextColor,
      sectionTextColor,
      tableHeaderColor,
      sectionColor,
      darkGray,
      lightGray
    })
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

  // Titre du document
  const title = type === 'invoice' ? 'FACTURE' : type === 'quote' ? 'DEVIS' : 'BON DE LIVRAISON'

  // === EN-TÊTE PROFESSIONNEL ===
  const headerStyle = designSettings?.headerStyle || 'gradient'

  if (headerStyle === 'gradient') {
    // En-tête avec dégradé élégant
    const steps = 30
    const stepWidth = 210 / steps

    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1)
      const r = Math.round(primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * ratio)
      const g = Math.round(primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * ratio)
      const b = Math.round(primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * ratio)

      doc.setFillColor(r, g, b)
      doc.rect(i * stepWidth, 0, stepWidth + 1, 50, 'F')
    }

    // Ligne décorative en bas de l'en-tête
    doc.setDrawColor(...accentColor)
    doc.setLineWidth(1.5)
    doc.line(0, 50, 210, 50)
  } else if (headerStyle === 'solid') {
    // En-tête avec couleur unie + ombre
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 50, 'F')

    // Ligne d'accent
    doc.setFillColor(...accentColor)
    doc.rect(0, 48, 210, 2, 'F')
  } else {
    // Style minimal élégant
    doc.setFillColor(250, 250, 250)
    doc.rect(0, 0, 210, 50, 'F')

    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(3)
    doc.line(0, 50, 210, 50)
  }

  // === LOGO ET INFORMATIONS ENTREPRISE ===
  const logoSize = designSettings?.logoSize === 'large' ? 25 : designSettings?.logoSize === 'small' ? 15 : 20
  await addCompanyLogo(doc, company, 15, 30, logoSize, headerTextColor)

  // Nom de l'entreprise
  doc.setTextColor(...(headerStyle === 'minimal' ? primaryColor : headerTextColor))
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText(company.name), 45, 18)

  // Informations de contact
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...(headerStyle === 'minimal' ? textColor : headerTextColor))
  let contactY = 25
  if (company.address) {
    doc.text(cleanText(company.address), 45, contactY)
    contactY += 4
  }
  if (company.phone) {
    doc.text(cleanText(`Tel: ${company.phone}`), 45, contactY)
    contactY += 4
  }
  if (company.email) {
    doc.text(cleanText(`Email: ${company.email}`), 45, contactY)
    contactY += 4
  }
  if (company.website) {
    doc.text(cleanText(`Web: ${company.website}`), 45, contactY)
  }

  // === TITRE DU DOCUMENT (Côté droit) ===
  // Badge pour le type de document
  const badgeX = 155
  const badgeY = 15
  const badgeWidth = 40
  const badgeHeight = 12

  // Fond du badge
  doc.setFillColor(...(type === 'quote' ? accentColor : primaryColor))
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F')

  // Texte du badge
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText(title), badgeX + badgeWidth / 2, badgeY + 8, { align: 'center' })

  // Numéro et date dans un encadré élégant
  const infoBoxY = 32
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...sectionColor)
  doc.setLineWidth(0.5)
  doc.roundedRect(155, infoBoxY, 40, 15, 1, 1, 'FD')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(cleanText('N°'), 158, infoBoxY + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  doc.text(cleanText(data.documentNumber), 165, infoBoxY + 5)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(cleanText('Date'), 158, infoBoxY + 11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  doc.text(cleanText(data.date.toLocaleDateString('fr-FR')), 165, infoBoxY + 11)

  // === SECTION CLIENT PROFESSIONNELLE ===
  const clientY = 60

  // Fond avec dégradé subtil
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(15, clientY, 90, 35, 2, 2, 'F')

  // Bordure gauche colorée
  doc.setFillColor(...primaryColor)
  doc.rect(15, clientY, 3, 35, 'F')

  // Titre "CLIENT"
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(cleanText('INFORMATIONS CLIENT'), 22, clientY + 7)

  // Ligne de séparation
  doc.setDrawColor(...sectionColor)
  doc.setLineWidth(0.3)
  doc.line(22, clientY + 9, 102, clientY + 9)

  // Informations du client
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...textColor)
  let yPos = clientY + 15
  doc.text(cleanText(data.customer.name), 22, yPos)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)

  if (data.customer.company) {
    yPos += 5
    doc.text(cleanText(data.customer.company), 22, yPos)
  }
  if (data.customer.phone) {
    yPos += 5
    doc.text(cleanText(`Tel: ${data.customer.phone}`), 22, yPos)
  }
  if (data.customer.email) {
    yPos += 5
    doc.text(cleanText(`Email: ${data.customer.email}`), 22, yPos)
  }
  if (data.customer.address) {
    yPos += 5
    const addressLines = doc.splitTextToSize(cleanText(data.customer.address), 75)
    doc.text(addressLines, 22, yPos)
  }

  // === INFORMATIONS SUPPLÉMENTAIRES (Devis uniquement) ===
  // Note: La validité du devis est affichée en bas du document (section contrôlable)

  // === TABLEAU DES ARTICLES PROFESSIONNEL ===
  const tableStartY = 105

  // Titre de la section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(cleanText('DÉTAIL DES PRESTATIONS'), 15, tableStartY - 5)

  const tableData = data.items.map((item) => [
    cleanText(item.sku || '-'),
    cleanText(item.name),
    item.quantity.toString(),
    `${item.unitPrice.toFixed(2)} DH`,
    `${item.total.toFixed(2)} DH`,
  ])

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      cleanText('RÉF.'),
      cleanText('DÉSIGNATION'),
      cleanText('QTÉ'),
      cleanText('PRIX UNIT.'),
      cleanText('TOTAL HT')
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: tableHeaderColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 4,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center', textColor: [100, 100, 100], fontSize: 8 },
      1: { cellWidth: 80, halign: 'left', fontStyle: 'bold' },
      2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 33, halign: 'right', fontStyle: 'bold', textColor: primaryColor },
    },
    margin: { left: 15, right: 15 }
  })

  // === SECTION TOTAUX PROFESSIONNELLE ===
  const finalY = (doc as any).lastAutoTable.finalY || 105
  const totalsY = finalY + 12

  // Encadré élégant pour les totaux
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.roundedRect(120, totalsY - 5, 75, type === 'invoice' ? 35 : 20, 2, 2, 'FD')

  // Bande de couleur en haut
  doc.setFillColor(...primaryColor)
  doc.roundedRect(120, totalsY - 5, 75, 6, 2, 2, 'F')

  // Titre "MONTANTS"
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(cleanText('MONTANTS'), 157.5, totalsY - 1, { align: 'center' })

  // Total HT
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  doc.text(cleanText('Total HT'), 125, totalsY + 7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(`${data.totalAmount.toFixed(2)} DH`, 190, totalsY + 7, { align: 'right' })

  if (type === 'invoice') {
    // Payé
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...textColor)
    doc.text(cleanText('Payé'), 125, totalsY + 14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(16, 185, 129) // Vert
    doc.text(`${data.paidAmount.toFixed(2)} DH`, 190, totalsY + 14, { align: 'right' })

    // Reste à payer (en grand)
    doc.setFillColor(255, 250, 240)
    doc.roundedRect(120, totalsY + 18, 75, 10, 1, 1, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...accentColor)
    doc.text(cleanText('RESTE À PAYER'), 125, totalsY + 24)
    doc.setFontSize(11)
    doc.text(`${data.creditAmount.toFixed(2)} DH`, 190, totalsY + 24, { align: 'right' })
  }

  // === MONTANT EN LETTRES (Élégant) ===
  const amountInWordsY = totalsY + (type === 'invoice' ? 45 : 30)

  // Encadré avec icône
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, amountInWordsY - 5, 180, 18, 2, 2, 'FD')

  // Titre
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(cleanText('MONTANT EN LETTRES'), 20, amountInWordsY + 1)

  // Montant en lettres
  doc.setTextColor(...textColor)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  const amountInWords = formatAmountInWords(data.totalAmount)
  const wordsLines = doc.splitTextToSize(cleanText(amountInWords), 170)
  doc.text(wordsLines, 20, amountInWordsY + 7)

  // Méthode de paiement (factures uniquement)
  if (type === 'invoice') {
    const paymentY = amountInWordsY + 22
    doc.setFillColor(255, 250, 240)
    doc.roundedRect(15, paymentY - 3, 85, 10, 1, 1, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...accentColor)
    doc.text(cleanText('MODE DE PAIEMENT'), 20, paymentY + 2)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...textColor)
    const paymentMethodLabel = getPaymentMethodLabel(data.paymentMethod)
    doc.text(cleanText(paymentMethodLabel), 20, paymentY + 6)
  }

  // Notes
  let currentY = amountInWordsY + (type === 'invoice' ? 35 : 25)
  if (data.notes) {
    doc.setFillColor(255, 255, 240)
    doc.roundedRect(15, currentY - 3, 180, 15, 2, 2, 'F')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...accentColor)
    doc.text(cleanText('NOTES'), 20, currentY + 2)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...textColor)
    doc.setFontSize(8)
    const splitNotes = doc.splitTextToSize(cleanText(data.notes), 170)
    doc.text(splitNotes, 20, currentY + 7)
    currentY += 15 + (splitNotes.length * 3)
  }

  // === SECTIONS SPÉCIFIQUES AUX DEVIS (Design Professionnel) ===
  if (type === 'quote') {
    // Période de validité
    if (designSettings?.showValidityPeriod && designSettings?.validityPeriodText) {
      currentY += 8

      // Encadré avec bordure colorée
      doc.setFillColor(240, 253, 244) // Vert très clair
      doc.setDrawColor(...sectionColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(15, currentY - 3, 180, 18, 2, 2, 'FD')

      // Barre latérale colorée
      doc.setFillColor(...sectionColor)
      doc.rect(15, currentY - 3, 4, 18, 'F')

      // Titre
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...sectionColor)
      doc.text(cleanText('VALIDITÉ DU DEVIS'), 23, currentY + 3)

      // Texte de validité
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...textColor)
      const splitValidity = doc.splitTextToSize(cleanText(designSettings.validityPeriodText), 165)
      doc.text(splitValidity, 23, currentY + 9)
      currentY += 18 + (splitValidity.length * 2)
    }

    // Conditions générales
    if (designSettings?.showTermsAndConditions && designSettings?.termsAndConditionsText) {
      currentY += 5

      // Encadré avec bordure colorée
      doc.setFillColor(255, 247, 237) // Orange très clair
      doc.setDrawColor(...accentColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(15, currentY - 3, 180, 18, 2, 2, 'FD')

      // Barre latérale colorée
      doc.setFillColor(...accentColor)
      doc.rect(15, currentY - 3, 4, 18, 'F')

      // Titre
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...accentColor)
      doc.text(cleanText('CONDITIONS GÉNÉRALES'), 23, currentY + 3)

      // Texte des conditions
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...textColor)
      const splitTerms = doc.splitTextToSize(cleanText(designSettings.termsAndConditionsText), 165)
      doc.text(splitTerms, 23, currentY + 9)
      currentY += 18 + (splitTerms.length * 2)
    }
  }

  // === PIED DE PAGE PROFESSIONNEL ===
  const pageHeight = doc.internal.pageSize.height
  const footerY = pageHeight - 20

  // Ligne de séparation élégante
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(15, footerY - 5, 195, footerY - 5)

  // Message de remerciement
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(cleanText('Merci pour votre confiance !'), 105, footerY, { align: 'center' })

  // Informations de contact
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const footerParts = []
  if (company.name) footerParts.push(company.name)
  if (company.phone) footerParts.push(`Tel: ${company.phone}`)
  if (company.email) footerParts.push(`Email: ${company.email}`)
  if (company.website) footerParts.push(company.website)

  const footerInfo = footerParts.join(' • ')
  doc.text(cleanText(footerInfo), 105, footerY + 5, { align: 'center' })

  // Informations légales
  if (company.ice || company.taxId) {
    doc.setFontSize(6)
    const legalInfo = []
    if (company.ice) legalInfo.push(`ICE: ${company.ice}`)
    if (company.taxId) legalInfo.push(`IF: ${company.taxId}`)
    doc.text(cleanText(legalInfo.join(' • ')), 105, footerY + 9, { align: 'center' })
  }

  // Numéro de page (si multi-pages)
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text(cleanText(`Page 1`), 195, footerY + 9, { align: 'right' })

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

// === FONCTION POUR GÉNÉRER UN DEVIS PROFESSIONNEL (design moderne) ===

// Helper pour créer une couleur transparente (mélange avec du blanc)
function getTransparentColor(color: [number, number, number], opacity: number): [number, number, number] {
  const r = Math.round(color[0] + (255 - color[0]) * (1 - opacity))
  const g = Math.round(color[1] + (255 - color[1]) * (1 - opacity))
  const b = Math.round(color[2] + (255 - color[2]) * (1 - opacity))
  return [r, g, b]
}

function generateSimpleQuotePDF(
  doc: jsPDF,
  data: InvoiceData,
  company: CompanyInfo,
  designSettings: DesignSettings | undefined,
  colors: any
): jsPDF {
  const { primaryColor, secondaryColor, accentColor, textColor } = colors

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // === EN-TÊTE ===
  let yPos = 20

  // Logo (cercle bleu avec initiale)
  if (company.logo) {
    try {
      doc.addImage(company.logo, 'PNG', margin, yPos - 5, 15, 15)
    } catch (error) {
      // Si pas de logo, dessiner un cercle avec initiale
      doc.setFillColor(...primaryColor)
      doc.circle(margin + 7.5, yPos + 2.5, 7.5, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      const initial = company.name ? company.name.charAt(0).toUpperCase() : 'D'
      doc.text(initial, margin + 7.5, yPos + 4.5, { align: 'center' })
    }
  } else {
    // Cercle bleu avec initiale
    doc.setFillColor(...primaryColor)
    doc.circle(margin + 7.5, yPos + 2.5, 7.5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const initial = company.name ? company.name.charAt(0).toUpperCase() : 'D'
    doc.text(initial, margin + 7.5, yPos + 4.5, { align: 'center' })
  }

  // Nom de l'entreprise en bleu
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(cleanText(company.name || 'Société de test'), margin + 20, yPos)

  // Informations entreprise en gris
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  yPos += 5
  if (company.address) {
    const addressLines = company.address.split('\n')
    doc.text(cleanText(addressLines[0] || ''), margin + 20, yPos)
    yPos += 3
  }
  if (company.ice) {
    doc.text(cleanText(`ICE: ${company.ice}`), margin + 20, yPos)
    yPos += 3
  }
  if (company.email) {
    doc.text(cleanText(`Email: ${company.email}`), margin + 20, yPos)
  }

  // "DEVIS" en gros à droite
  doc.setTextColor(...primaryColor)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('DEVIS', pageWidth - margin, 20, { align: 'right' })

  // Numéro de devis encadré
  const quoteNumber = data.invoiceNumber || 'DEV-20251007-0001'
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const quoteNumWidth = doc.getTextWidth(quoteNumber) + 8
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.rect(pageWidth - margin - quoteNumWidth, 28, quoteNumWidth, 8)
  doc.text(quoteNumber, pageWidth - margin - 4, 33, { align: 'right' })

  // === LIGNE DE SÉPARATION BLEUE ===
  yPos = 45
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1)
  doc.line(margin, yPos, pageWidth - margin, yPos)

  // === DEUX COLONNES (Client et Informations) ===
  yPos += 8
  const colWidth = (pageWidth - 2 * margin - 5) / 2

  // Fond bleu clair pour les deux colonnes
  const lightBlue = getTransparentColor(primaryColor, 0.1)
  doc.setFillColor(...lightBlue)
  doc.rect(margin, yPos - 3, colWidth, 25, 'F')
  doc.rect(margin + colWidth + 5, yPos - 3, colWidth, 25, 'F')

  // Colonne Client
  doc.setTextColor(...primaryColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Client:', margin + 3, yPos)

  doc.setTextColor(...textColor)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  yPos += 5
  doc.text(cleanText(data.customer.name || 'Ahmed'), margin + 3, yPos)

  // Colonne Informations
  let infoY = yPos - 5
  doc.setTextColor(...primaryColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Informations:', margin + colWidth + 8, infoY)

  doc.setTextColor(...textColor)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  infoY += 5

  const quoteDate = data.date ? new Date(data.date).toLocaleDateString('fr-FR') : '07/10/2025'
  doc.text(`Date: ${quoteDate}`, margin + colWidth + 8, infoY)
  infoY += 4

  const validityDate = data.dueDate ? new Date(data.dueDate).toLocaleDateString('fr-FR') : '06/11/2025'
  doc.text(cleanText(`Validité: ${validityDate}`), margin + colWidth + 8, infoY)
  infoY += 4

  doc.text(cleanText(`Statut: ${data.status || 'En cours'}`), margin + colWidth + 8, infoY)

  // === TABLEAU DES ARTICLES ===
  yPos = 85

  // Tableau avec 6 colonnes comme l'image
  autoTable(doc, {
    startY: yPos,
    head: [[
      cleanText('Désignation'),
      cleanText('Qté'),
      cleanText('Prix Unit.'),
      cleanText('Total'),
      cleanText('TVA (20%)'),
      cleanText('Montant TTC')
    ]],
    body: data.items.map((item) => {
      const total = item.total || (item.quantity * item.unitPrice)
      const tva = total * 0.20
      const ttc = total + tva
      return [
        cleanText(item.name || item.productName || ''),
        item.quantity.toString(),
        `${item.unitPrice.toFixed(2)} MAD`,
        `${total.toFixed(2)} MAD`,
        '-',
        `${total.toFixed(2)} MAD`
      ]
    }),
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: textColor,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [200, 200, 200]
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textColor,
      lineWidth: 0.5,
      lineColor: [200, 200, 200]
    },
    columnStyles: {
      0: { cellWidth: 60, halign: 'left' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  })

  // === TOTAUX (encadré vert à droite) ===
  const finalY = (doc as any).lastAutoTable.finalY || yPos
  yPos = finalY + 10

  // Encadré vert pour les totaux
  const totalBoxX = pageWidth - margin - 60
  const totalBoxY = yPos
  const totalBoxWidth = 60
  const totalBoxHeight = 20

  // Fond vert clair
  const lightGreen = getTransparentColor(secondaryColor, 0.15)
  doc.setFillColor(...lightGreen)
  doc.setDrawColor(...secondaryColor)
  doc.setLineWidth(1)
  doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 'FD')

  // Sous-total
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  doc.text('Sous-total', totalBoxX + 3, totalBoxY + 6)
  doc.text(`${data.totalAmount.toFixed(2)} MAD`, totalBoxX + totalBoxWidth - 3, totalBoxY + 6, { align: 'right' })

  // TOTAL en gras
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...secondaryColor)
  doc.text('TOTAL', totalBoxX + 3, totalBoxY + 14)
  doc.text(`${data.totalAmount.toFixed(2)} MAD`, totalBoxX + totalBoxWidth - 3, totalBoxY + 14, { align: 'right' })

  // === CONDITIONS DE VENTE ===
  yPos = totalBoxY + totalBoxHeight + 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Conditions de vente:', margin, yPos)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  yPos += 5

  const conditions = designSettings?.termsAndConditionsText ||
    '• Devis valable 30 jours • Prix exprimés en MAD TTC • Règlement à la commande • Livraison sous réserve de disponibilité'
  const conditionsLines = doc.splitTextToSize(cleanText(conditions), pageWidth - 2 * margin)
  doc.text(conditionsLines, margin, yPos)

  yPos += conditionsLines.length * 4 + 5

  // === LIGNE DE SÉPARATION ===
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1)
  doc.line(margin, yPos, pageWidth - margin, yPos)

  // === BANDEAU JAUNE - VALIDITÉ ===
  yPos += 8

  const validityEndDate = data.dueDate ? new Date(data.dueDate).toLocaleDateString('fr-FR') : '06/11/2025'
  const validityText = `Ce devis est valable jusqu'au ${validityEndDate}`

  // Fond jaune
  doc.setFillColor(255, 243, 205) // Jaune clair
  doc.setDrawColor(255, 193, 7) // Bordure jaune
  doc.setLineWidth(0.5)
  doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 10, 'FD')

  // Icône warning
  doc.setTextColor(255, 152, 0) // Orange
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('⚠', margin + 3, yPos + 3)

  // Texte de validité
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(cleanText(validityText), margin + 10, yPos + 3)

  // === SIGNATURES ===
  yPos += 18

  const signatureY = yPos
  const signatureWidth = (pageWidth - 2 * margin - 10) / 2

  // Signature du client
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Signature du client:', margin, signatureY)

  // Ligne pour signature
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, signatureY + 15, margin + signatureWidth, signatureY + 15)

  doc.setFontSize(7)
  doc.text('Date: ___________', margin, signatureY + 20)

  // Pour l'entreprise
  doc.setFontSize(8)
  doc.text('Pour l\'entreprise:', margin + signatureWidth + 10, signatureY)

  // Ligne pour signature
  doc.line(margin + signatureWidth + 10, signatureY + 15, pageWidth - margin, signatureY + 15)

  doc.setFontSize(7)
  doc.text('(signature et cachet)', margin + signatureWidth + 10, signatureY + 20)

  // === FOOTER FIXÉ EN BAS DE PAGE ===
  const footerY = pageHeight - 20 // Position fixe en bas de page

  // Ligne de séparation du footer
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

  // Texte du footer
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')

  // Nom de l'entreprise à gauche
  doc.text(cleanText(company.name || 'Alami Gestion'), margin, footerY)

  // Date de génération à droite
  const currentDate = new Date().toLocaleDateString('fr-FR')
  const footerText = `Document généré le ${currentDate}`
  doc.text(cleanText(footerText), pageWidth - margin, footerY, { align: 'right' })

  return doc
}

