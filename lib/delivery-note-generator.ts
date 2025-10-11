import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getCompanySettings } from '@/lib/company-settings'
import { DeliveryNoteData } from '@/types/delivery-note'

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

// Fonction pour charger une image en base64
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
      return null
    }

    const blob = await response.blob()
    console.log('📦 Blob créé:', {
      size: blob.size,
      type: blob.type
    })

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        console.log('✅ Image convertie en base64, taille:', result.length, 'caractères')
        resolve(result)
      }
      reader.onerror = (error) => {
        console.error('❌ Erreur FileReader:', error)
        resolve(null)
      }
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('❌ Erreur lors du chargement de l\'image:', error)
    return null
  }
}

// Fonction pour ajouter le logo de l'entreprise
async function addCompanyLogo(doc: jsPDF, company: CompanyInfo, x: number, y: number, size: number = 16) {
  console.log('🖼️ Tentative d\'ajout du logo:', {
    hasLogo: !!company.logo,
    logoUrl: company.logo,
    position: { x, y },
    size
  })

  if (company.logo) {
    try {
      console.log('📥 Chargement du logo depuis:', company.logo)
      const logoBase64 = await loadImageAsBase64(company.logo)

      if (logoBase64) {
        console.log('✅ Logo chargé avec succès, ajout au PDF...')
        // Ajouter l'image au PDF
        doc.addImage(logoBase64, 'PNG', x - size/2, y - size/2, size, size)
        console.log('✅ Logo ajouté au PDF avec succès')
        return true
      } else {
        console.warn('⚠️ Échec du chargement du logo (base64 null)')
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du logo au PDF:', error)
    }
  } else {
    console.log('ℹ️ Aucun logo configuré, utilisation du fallback')
  }

  // Fallback : cercle avec initiale
  console.log('🔄 Utilisation du fallback (cercle avec initiale)')
  doc.setFillColor(59, 130, 246) // Bleu
  doc.circle(x, y, size/2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(size * 0.6)
  const initial = company.name ? company.name.charAt(0).toUpperCase() : 'D'
  doc.text(initial, x, y + size * 0.15, { align: 'center' })
  console.log('✅ Fallback appliqué avec initiale:', initial)
  return false
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
    console.log('📄 Début génération PDF bon de livraison - Design Simple')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let currentY = 20

    // Récupérer les paramètres de l'entreprise
    let company: CompanyInfo
    
    // Priorité aux paramètres passés dans data.companySettings
    if (data.companySettings) {
      console.log('📋 Utilisation des paramètres passés dans data.companySettings:', data.companySettings)
      company = {
        name: data.companySettings.name || 'Alami Gestion',
        address: data.companySettings.address || undefined,
        phone: data.companySettings.phone || undefined,
        email: data.companySettings.email || undefined,
        logo: data.companySettings.logo || undefined
      }
    } else {
      // Fallback vers getCompanySettings() si pas de paramètres passés
      try {
        const settings = await getCompanySettings()
        console.log('📋 Paramètres récupérés depuis getCompanySettings:', {
          name: settings.companyName,
          logo: settings.companyLogo,
          address: settings.companyAddress,
          phone: settings.companyPhone,
          email: settings.companyEmail
        })

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
      } catch (error) {
        console.error('Error fetching company settings:', error)
        company = {
          name: 'Alami Gestion'
        }
      }
    }

    console.log('🏢 Informations entreprise finales:', company)

    // Couleurs simples
    const blueColor: [number, number, number] = [59, 130, 246]
    const darkGray: [number, number, number] = [64, 64, 64]
    const lightGray: [number, number, number] = [156, 163, 175]

    // === LOGO ET EN-TÊTE ===
    // Logo de l'entreprise à gauche
    await addCompanyLogo(doc, company, 25, 25, 16)

    // Titre "BON DE LIVRAISON" à droite
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('BON DE LIVRAISON', pageWidth - 15, 20, { align: 'right' })
    
    // Numéro du bon
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(cleanText(data.saleNumber), pageWidth - 15, 28, { align: 'right' })
    
    // Date
    doc.text(`Date: ${data.createdAt.toLocaleDateString('fr-FR')}`, pageWidth - 15, 35, { align: 'right' })

    currentY = 50

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
    throw new Error(`Erreur génération PDF: ${error.message}`)
  }
}
