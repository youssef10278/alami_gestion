import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getCompanySettings } from '@/lib/company-settings'

// Types pour les paramètres de l'entreprise
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

// Fonction pour charger une image en base64 (VERSION SERVEUR CORRIGÉE)
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    console.log('🌐 Tentative de fetch de l\'image:', url)
    const response = await fetch(url)

    console.log('📡 Réponse fetch:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    })

    if (!response.ok) {
      console.error('❌ Réponse fetch non OK:', response.status, response.statusText)
      throw new Error(`HTTP ${response.status}`)
    }

    // ✅ CORRECTION: Utiliser Buffer (Node.js) au lieu de FileReader (navigateur)
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Déterminer le type MIME basé sur l'extension ou Content-Type
    const contentType = response.headers.get('content-type')
    let mimeType = 'image/png' // Par défaut

    if (contentType) {
      mimeType = contentType
    } else {
      // Fallback basé sur l'extension
      const ext = url.split('.').pop()?.toLowerCase()
      if (ext === 'jpg' || ext === 'jpeg') {
        mimeType = 'image/jpeg'
      } else if (ext === 'png') {
        mimeType = 'image/png'
      } else if (ext === 'gif') {
        mimeType = 'image/gif'
      } else if (ext === 'webp') {
        mimeType = 'image/webp'
      }
    }

    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log('✅ Image convertie en base64:', {
      mimeType,
      base64Length: base64.length,
      dataUrlLength: dataUrl.length,
      bufferSize: buffer.byteLength
    })

    return dataUrl

  } catch (error) {
    console.error('❌ Erreur lors du chargement de l\'image:', error)
    return null
  }
}

// Fonction améliorée pour ajouter le logo de l'entreprise avec validation complète
async function addEnhancedCompanyLogo(doc: jsPDF, company: CompanyInfo, x: number, y: number, size: number = 18): Promise<boolean> {
  console.log('🎯 === TRAITEMENT LOGO ENTREPRISE - VERSION AMÉLIORÉE ===')
  console.log('📊 Paramètres logo:', {
    hasCompanyData: !!company,
    companyName: company?.name,
    hasLogoUrl: !!company?.logo,
    logoUrl: company?.logo,
    position: { x, y },
    size
  })

  // Vérification préliminaire
  if (!company) {
    console.error('❌ Aucune donnée entreprise fournie')
    return await createFallbackLogo(doc, 'A', x, y, size)
  }

  if (!company.logo) {
    console.log('ℹ️ Aucun logo configuré dans les paramètres entreprise')
    const initial = company.name ? company.name.charAt(0).toUpperCase() : 'A'
    return await createFallbackLogo(doc, initial, x, y, size)
  }

  // Tentative de chargement du logo
  console.log('🔄 Tentative de chargement du logo depuis:', company.logo)

  try {
    // Validation de l'URL
    if (!isValidImageUrl(company.logo)) {
      console.warn('⚠️ URL du logo invalide:', company.logo)
      const initial = company.name ? company.name.charAt(0).toUpperCase() : 'A'
      return await createFallbackLogo(doc, initial, x, y, size)
    }

    // Chargement de l'image
    const logoBase64 = await loadImageAsBase64(company.logo)

    if (logoBase64) {
      console.log('✅ Logo chargé avec succès, ajout au PDF...')

      // Déterminer le format de l'image
      const imageFormat = getImageFormat(logoBase64)
      console.log('🎨 Format image détecté:', imageFormat)

      // Ajouter l'image au PDF avec gestion d'erreur
      try {
        doc.addImage(logoBase64, imageFormat, x - size/2, y - size/2, size, size)
        console.log('🎉 Logo ajouté au PDF avec succès!')
        return true
      } catch (pdfError) {
        console.error('❌ Erreur lors de l\'ajout au PDF:', pdfError)
        const initial = company.name ? company.name.charAt(0).toUpperCase() : 'A'
        return await createFallbackLogo(doc, initial, x, y, size)
      }
    } else {
      console.warn('⚠️ Échec du chargement du logo (base64 null)')
      const initial = company.name ? company.name.charAt(0).toUpperCase() : 'A'
      return await createFallbackLogo(doc, initial, x, y, size)
    }

  } catch (error) {
    console.error('❌ Erreur lors du traitement du logo:', error)
    const initial = company.name ? company.name.charAt(0).toUpperCase() : 'A'
    return await createFallbackLogo(doc, initial, x, y, size)
  }
}

// Fonction pour créer un logo de fallback élégant
async function createFallbackLogo(doc: jsPDF, initial: string, x: number, y: number, size: number): Promise<boolean> {
  console.log('🎨 Création du logo de fallback avec initiale:', initial)

  // Cercle de fond avec dégradé simulé
  doc.setFillColor(59, 130, 246) // Bleu principal
  doc.circle(x, y, size/2, 'F')

  // Cercle intérieur pour effet de profondeur
  doc.setFillColor(79, 150, 255) // Bleu plus clair
  doc.circle(x, y, size/2 - 1, 'F')

  // Texte de l'initiale
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(size * 0.6)
  doc.text(initial, x, y + size * 0.15, { align: 'center' })

  console.log('✅ Logo de fallback créé avec succès')
  return false
}

// Fonction pour valider l'URL de l'image
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const validProtocols = ['http:', 'https:', 'data:']
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']

    // Vérifier le protocole
    if (!validProtocols.includes(urlObj.protocol)) {
      return false
    }

    // Pour les URLs data:, vérifier le format
    if (urlObj.protocol === 'data:') {
      return url.startsWith('data:image/')
    }

    // Pour les URLs HTTP, vérifier l'extension ou accepter toutes
    const pathname = urlObj.pathname.toLowerCase()
    return validExtensions.some(ext => pathname.endsWith(ext)) || pathname.includes('image')

  } catch {
    return false
  }
}

// Fonction pour détecter le format de l'image depuis base64
function getImageFormat(base64: string): 'PNG' | 'JPEG' | 'GIF' | 'WEBP' {
  if (base64.startsWith('data:image/png')) return 'PNG'
  if (base64.startsWith('data:image/jpeg') || base64.startsWith('data:image/jpg')) return 'JPEG'
  if (base64.startsWith('data:image/gif')) return 'GIF'
  if (base64.startsWith('data:image/webp')) return 'WEBP'

  // Par défaut, essayer PNG
  return 'PNG'
}

// Fonction pour nettoyer le texte et éviter les erreurs d'encodage
function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/[^\x00-\x7F]/g, '') // Supprimer les caractères non-ASCII
    .replace(/[""]/g, '"')        // Remplacer les guillemets courbes
    .replace(/['']/g, "'")        // Remplacer les apostrophes courbes
    .replace(/[–—]/g, '-')        // Remplacer les tirets longs
    .replace(/…/g, '...')         // Remplacer les points de suspension
    .trim()
}

// Fonction pour convertir hex en RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [59, 130, 246] // Bleu par défaut
}

interface DeliveryNoteData {
  saleNumber: string
  customerName: string
  customerAddress?: string
  customerPhone?: string
  sellerName: string
  items: Array<{
    productName: string
    productSku?: string
    quantity: number
    unitPrice?: number
    total?: number
    description?: string
  }>
  notes?: string
  createdAt: Date
  companySettings?: {
    name: string
    address?: string
    phone?: string
    email?: string
    logo?: string
    primaryColor?: string
  }
}

export async function generateDeliveryNotePDF(data: DeliveryNoteData): Promise<Uint8Array> {
  try {
    console.log('🚀 === GÉNÉRATION BON DE LIVRAISON - VERSION AMÉLIORÉE ===')
    console.log('📊 Données reçues:', {
      saleNumber: data.saleNumber,
      customerName: data.customerName,
      itemsCount: data.items?.length || 0,
      sellerName: data.sellerName
    })

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let currentY = 20

    // === ÉTAPE 1: RÉCUPÉRATION SÉCURISÉE DES PARAMÈTRES ENTREPRISE ===
    console.log('🏢 Étape 1: Récupération des paramètres de l\'entreprise...')
    let company: CompanyInfo
    let logoLoaded = false

    try {
      const settings = await getCompanySettings()
      console.log('✅ Paramètres entreprise récupérés avec succès')
      console.log('📋 Détails des paramètres:', {
        companyName: settings.companyName,
        companyLogo: settings.companyLogo ? '✅ Configuré' : '❌ Non configuré',
        logoUrl: settings.companyLogo,
        companyAddress: settings.companyAddress ? '✅ Configurée' : '❌ Non configurée',
        companyPhone: settings.companyPhone ? '✅ Configuré' : '❌ Non configuré',
        companyEmail: settings.companyEmail ? '✅ Configuré' : '❌ Non configuré'
      })

      // Mapping sécurisé des données entreprise
      company = {
        name: settings.companyName || 'Alami Gestion',
        address: settings.companyAddress || undefined,
        phone: settings.companyPhone || undefined,
        email: settings.companyEmail || undefined,
        ice: settings.companyICE || undefined,
        taxId: settings.companyTaxId || undefined,
        website: settings.companyWebsite || undefined,
        logo: settings.companyLogo || undefined
      }

      console.log('🎯 Informations entreprise mappées pour PDF:', {
        name: company.name,
        hasLogo: !!company.logo,
        logoUrl: company.logo,
        hasAddress: !!company.address,
        hasPhone: !!company.phone,
        hasEmail: !!company.email
      })

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres:', error)
      company = {
        name: 'Alami Gestion'
      }
      console.log('🔄 Utilisation des paramètres par défaut')
    }

    // === ÉTAPE 2: PRÉPARATION DU DOCUMENT PDF ===
    console.log('📄 Étape 2: Initialisation du document PDF...')

    // Couleurs du thème
    const primaryColor: [number, number, number] = [59, 130, 246]  // Bleu
    const darkGray: [number, number, number] = [64, 64, 64]
    const lightGray: [number, number, number] = [156, 163, 175]
    const successColor: [number, number, number] = [34, 197, 94]   // Vert

    // === ÉTAPE 3: AJOUT DU LOGO ENTREPRISE ===
    console.log('🖼️ Étape 3: Traitement du logo de l\'entreprise...')
    logoLoaded = await addEnhancedCompanyLogo(doc, company, 25, 25, 18)

    if (logoLoaded) {
      console.log('✅ Logo entreprise ajouté avec succès')
    } else {
      console.log('🔄 Logo de fallback utilisé')
    }

    // === ÉTAPE 4: EN-TÊTE DU DOCUMENT ===
    console.log('📋 Étape 4: Création de l\'en-tête du document...')

    // Titre "BON DE LIVRAISON" à droite avec style amélioré
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('BON DE LIVRAISON', pageWidth - 20, 25, { align: 'right' })

    // Ligne décorative sous le titre (NOIR au lieu de bleu)
    doc.setDrawColor(...darkGray)
    doc.setLineWidth(2)
    doc.line(pageWidth - 120, 30, pageWidth - 20, 30)

    // Numéro et date avec style amélioré
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...darkGray)
    doc.text(`N° ${data.saleNumber}`, pageWidth - 20, 40, { align: 'right' })
    doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString('fr-FR')}`, pageWidth - 20, 48, { align: 'right' })

    currentY = 65

    // === INFORMATIONS ENTREPRISE (gauche) ===
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(cleanText(company.name), 15, currentY)
    
    currentY += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    if (company.address) {
      doc.text(cleanText(`Adresse: ${company.address}`), 15, currentY)
      currentY += 4
    }

    if (company.phone) {
      doc.text(cleanText(`Tél: ${company.phone}`), 15, currentY)
      currentY += 4
    }

    if (company.email) {
      doc.text(cleanText(`Email: ${company.email}`), 15, currentY)
      currentY += 4
    }

    // Ligne de séparation
    currentY += 10
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.5)
    doc.line(15, currentY, pageWidth - 15, currentY)

    currentY += 15

    // === SECTION INFORMATIONS GÉNÉRALES ET CLIENT ===
    const leftColumnX = 15
    const rightColumnX = 110

    // Informations générales (gauche)
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Informations générales', leftColumnX, currentY)

    let leftY = currentY + 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Type:', leftColumnX, leftY)
    doc.setFont('helvetica', 'normal')
    doc.text('Sortie', leftColumnX + 20, leftY)
    leftY += 6

    doc.setFont('helvetica', 'bold')
    doc.text('Date:', leftColumnX, leftY)
    doc.setFont('helvetica', 'normal')
    doc.text(data.createdAt.toLocaleDateString('fr-FR'), leftColumnX + 20, leftY)
    leftY += 6

    doc.setFont('helvetica', 'bold')
    doc.text('Statut:', leftColumnX, leftY)
    doc.setFont('helvetica', 'normal')
    doc.text('Confirmé', leftColumnX + 20, leftY)

    // Client (droite)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Client', rightColumnX, currentY)

    let rightY = currentY + 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(cleanText(data.customerName), rightColumnX, rightY)
    
    if (data.customerAddress) {
      rightY += 6
      doc.text(cleanText(data.customerAddress), rightColumnX, rightY)
    }
    
    if (data.customerPhone) {
      rightY += 6
      doc.text(cleanText(data.customerPhone), rightColumnX, rightY)
    }

    currentY += 50

    // === TABLEAU ARTICLES ===
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Articles', 15, currentY)
    currentY += 10

    // Préparer les données du tableau
    const tableData = data.items.map(item => [
      cleanText(item.productName),
      item.quantity.toString(),
      item.unitPrice ? `${item.unitPrice.toFixed(2)} MAD` : '0.00 MAD',
      item.total ? `${item.total.toFixed(2)} MAD` : '0.00 MAD'
    ])

    // Ajouter ligne TOTAL
    const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = data.items.reduce((sum, item) => sum + (item.total || 0), 0)
    
    tableData.push([
      'TOTAL',
      totalQuantity.toString(),
      '',
      `${totalAmount.toFixed(2)} MAD`
    ])

    // Générer le tableau
    autoTable(doc, {
      startY: currentY,
      head: [['Produit', 'Quantité', 'Prix Unit.', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [64, 64, 64],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [64, 64, 64]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    })

    // Position après le tableau
    currentY = (doc as any).lastAutoTable.finalY + 20

    // === NOTES ===
    if (data.notes) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Notes', 15, currentY)
      currentY += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const notesLines = doc.splitTextToSize(cleanText(data.notes), pageWidth - 30)
      doc.text(notesLines, 15, currentY)
      currentY += notesLines.length * 5 + 10
    } else {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Notes', 15, currentY)
      currentY += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Livraison urgente', 15, currentY)
      currentY += 20
    }

    // === SIGNATURES ===
    const signatureY = Math.max(currentY, pageHeight - 60)
    
    // Signature Client
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Signature Client', 40, signatureY)
    
    // Signature Responsable
    doc.text('Signature Responsable', 140, signatureY)

    // === FOOTER ===
    const footerY = pageHeight - 20
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 
             pageWidth / 2, footerY, { align: 'center' })

    console.log('✅ PDF généré avec succès')
    const pdfArrayBuffer = doc.output('arraybuffer')
    return new Uint8Array(pdfArrayBuffer)

  } catch (error) {
    console.error('❌ Erreur génération PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    throw new Error(`Erreur génération PDF: ${errorMessage}`)
  }
}
