import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Fonction pour nettoyer le texte (caractères spéciaux)
function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/[^\x00-\x7F]/g, '') // Supprimer les caractères non-ASCII
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ÿ]/g, 'y')
    .replace(/[À-ÿ]/g, '') // Supprimer tout autre caractère accentué restant
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
    console.log('📄 Début génération PDF bon de livraison')
    console.log('📊 Données reçues:', {
      saleNumber: data.saleNumber,
      customerName: data.customerName,
      sellerName: data.sellerName,
      itemsCount: data.items?.length || 0,
      hasCompanySettings: !!data.companySettings
    })

    const doc = new jsPDF()

    // === CONFIGURATION COULEURS BUSINESS MODERNE ===
    const primaryColor = data.companySettings?.primaryColor || '#1E40AF' // Bleu professionnel Business Moderne
    const primaryColorRGB = hexToRgb(primaryColor)
    const darkGray = [31, 41, 55] // Gris anthracite Business Moderne
    const lightGray = [156, 163, 175] // Gris clair Business Moderne
    const successGreen = [5, 150, 105] // Vert succès Business Moderne
    const backgroundGray = [249, 250, 251] // Gris très clair Business Moderne

    let currentY = 20

  // === EN-TÊTE ===
  doc.setFillColor(...primaryColorRGB)
  doc.rect(0, 0, 210, 40, 'F')
  
  // Logo et nom de l'entreprise
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text(cleanText(data.companySettings?.name || 'ALAMI GESTION'), 15, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (data.companySettings?.address) {
    doc.text(cleanText(data.companySettings.address), 15, 32)
  }
  
  // Titre "BON DE LIVRAISON"
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('BON DE LIVRAISON', 140, 25)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`N° ${data.saleNumber}`, 140, 32)
  
  currentY = 50

  // === INFORMATIONS CLIENT ===
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('DESTINATAIRE', 15, currentY)
  
  currentY += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  // Cadre client
  doc.setDrawColor(...primaryColorRGB)
  doc.setLineWidth(1)
  doc.rect(15, currentY - 5, 90, 25)
  
  doc.text(cleanText(data.customerName), 20, currentY + 3)
  if (data.customerAddress) {
    doc.text(cleanText(data.customerAddress), 20, currentY + 10)
  }
  if (data.customerPhone) {
    doc.text(`Tél: ${data.customerPhone}`, 20, currentY + 17)
  }

  // === INFORMATIONS LIVRAISON ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('INFORMATIONS LIVRAISON', 120, currentY - 5)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  // Cadre livraison
  doc.rect(120, currentY - 5, 75, 25)
  
  doc.text(`Date: ${data.createdAt.toLocaleDateString('fr-FR')}`, 125, currentY + 3)
  doc.text(`Vendeur: ${cleanText(data.sellerName)}`, 125, currentY + 10)
  doc.text(`Statut: A livrer`, 125, currentY + 17)

  currentY += 35

  // === TABLEAU DES ARTICLES ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('ARTICLES A LIVRER', 15, currentY)
  
  currentY += 10

  // Préparer les données du tableau
  console.log('📋 Préparation du tableau des articles...')
  const tableData = data.items?.map(item => [
    cleanText(item.productName || 'Produit inconnu'),
    item.productSku || '-',
    (item.quantity || 0).toString(),
    cleanText(item.description || '-')
  ]) || []

  console.log('📋 Tableau préparé avec', tableData.length, 'lignes')

  // Générer le tableau
  autoTable(doc, {
    startY: currentY,
    head: [['Article', 'SKU', 'Quantité', 'Description']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColorRGB,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkGray
    },
    columnStyles: {
      0: { cellWidth: 60 }, // Article
      1: { cellWidth: 30 }, // SKU
      2: { cellWidth: 20, halign: 'center' }, // Quantité
      3: { cellWidth: 75 } // Description
    },
    margin: { left: 15, right: 15 }
  })

  // Position après le tableau
  currentY = (doc as any).lastAutoTable.finalY + 15

  // === RÉSUMÉ BUSINESS MODERNE ===
  doc.setFillColor(...backgroundGray) // Gris très clair Business Moderne
  doc.setDrawColor(...successGreen) // Bordure verte pour le succès
  doc.setLineWidth(1)
  doc.rect(15, currentY, 180, 20, 'FD')

  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`TOTAL ARTICLES: ${data.items.length}`, 20, currentY + 8)
  doc.text(`TOTAL QUANTITÉ: ${data.items.reduce((sum, item) => sum + item.quantity, 0)}`, 20, currentY + 15)

  currentY += 30

  // === NOTES ===
  if (data.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('NOTES:', 15, currentY)
    
    currentY += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const notesLines = doc.splitTextToSize(cleanText(data.notes), 180)
    doc.text(notesLines, 15, currentY)
    currentY += notesLines.length * 5 + 10
  }

  // === SIGNATURES ===
  currentY = Math.max(currentY, 220) // Position minimale pour les signatures
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  
  // Signature expéditeur
  doc.text('SIGNATURE EXPEDITEUR', 30, currentY)
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.5)
  doc.line(15, currentY + 20, 85, currentY + 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Date et signature', 15, currentY + 25)

  // Signature destinataire
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('SIGNATURE DESTINATAIRE', 130, currentY)
  doc.line(115, currentY + 20, 185, currentY + 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Date et signature', 115, currentY + 25)

  // === PIED DE PAGE ===
  doc.setTextColor(...lightGray)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('Ce bon de livraison fait foi de la réception des marchandises.', 15, 280)
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 15, 285)

  console.log('📄 Génération du buffer PDF...')
  const pdfArrayBuffer = doc.output('arraybuffer')
  const pdfBuffer = new Uint8Array(pdfArrayBuffer)
  console.log('✅ PDF généré avec succès, taille:', pdfBuffer.length, 'bytes')

  return pdfBuffer

  } catch (error) {
    console.error('❌ Erreur dans generateDeliveryNotePDF:', error)
    throw new Error(`Erreur génération PDF: ${error.message}`)
  }
}

// Fonction utilitaire pour convertir hex en RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [30, 64, 175] // Bleu professionnel Business Moderne par défaut (#1E40AF)
}
