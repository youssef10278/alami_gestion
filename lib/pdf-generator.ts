import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface CompanyInfo {
  name: string
  address?: string
  phone?: string
  email?: string
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

const COMPANY_INFO: CompanyInfo = {
  name: 'Alami Gestion',
  address: 'Casablanca, Maroc',
  phone: '+212 6XX XXX XXX',
  email: 'contact@alami-gestion.ma',
}

export function generateInvoicePDF(data: InvoiceData, type: 'invoice' | 'quote' | 'delivery' = 'invoice') {
  const doc = new jsPDF()

  // Titre du document
  const title = type === 'invoice' ? 'FACTURE' : type === 'quote' ? 'DEVIS' : 'BON DE LIVRAISON'
  
  // En-tête - Logo et informations entreprise
  doc.setFillColor(77, 166, 255) // Bleu #4DA6FF
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY_INFO.name, 15, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (COMPANY_INFO.address) doc.text(COMPANY_INFO.address, 15, 27)
  if (COMPANY_INFO.phone) doc.text(`Tél: ${COMPANY_INFO.phone}`, 15, 32)
  if (COMPANY_INFO.email) doc.text(`Email: ${COMPANY_INFO.email}`, 15, 37)

  // Titre du document
  doc.setTextColor(77, 166, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 150, 20)
  
  // Numéro et date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`N°: ${data.documentNumber}`, 150, 27)
  doc.text(`Date: ${data.date.toLocaleDateString('fr-FR')}`, 150, 32)

  // Informations client
  doc.setFillColor(240, 240, 240)
  doc.rect(15, 50, 180, 30, 'F')
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('CLIENT', 20, 58)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let yPos = 65
  doc.text(data.customer.name, 20, yPos)
  if (data.customer.company) {
    yPos += 5
    doc.text(data.customer.company, 20, yPos)
  }
  if (data.customer.address) {
    yPos += 5
    doc.text(data.customer.address, 20, yPos)
  }
  if (data.customer.phone) {
    yPos += 5
    doc.text(`Tél: ${data.customer.phone}`, 20, yPos)
  }

  // Tableau des articles
  const tableData = data.items.map((item) => [
    item.sku,
    item.name,
    item.quantity.toString(),
    `${item.unitPrice.toFixed(2)} DH`,
    `${item.total.toFixed(2)} DH`,
  ])

  autoTable(doc, {
    startY: 90,
    head: [['SKU', 'Désignation', 'Qté', 'Prix Unit.', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [77, 166, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  })

  // Totaux
  const finalY = (doc as any).lastAutoTable.finalY || 90
  const totalsY = finalY + 10

  doc.setFillColor(240, 240, 240)
  doc.rect(120, totalsY, 75, 30, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Total:', 125, totalsY + 7)
  doc.text(`${data.totalAmount.toFixed(2)} DH`, 185, totalsY + 7, { align: 'right' })

  if (type === 'invoice') {
    doc.text('Payé:', 125, totalsY + 14)
    doc.text(`${data.paidAmount.toFixed(2)} DH`, 185, totalsY + 14, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.text('Reste à payer:', 125, totalsY + 21)
    doc.text(`${data.creditAmount.toFixed(2)} DH`, 185, totalsY + 21, { align: 'right' })
  }

  // Méthode de paiement
  if (type === 'invoice') {
    const paymentY = totalsY + 35
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const paymentMethodLabel = getPaymentMethodLabel(data.paymentMethod)
    doc.text(`Mode de paiement: ${paymentMethodLabel}`, 15, paymentY)
  }

  // Notes
  if (data.notes) {
    const notesY = totalsY + 45
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text('Notes:', 15, notesY)
    doc.setFont('helvetica', 'normal')
    const splitNotes = doc.splitTextToSize(data.notes, 180)
    doc.text(splitNotes, 15, notesY + 5)
  }

  // Pied de page
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Merci pour votre confiance !', 105, 280, { align: 'center' })
  doc.text(`${COMPANY_INFO.name} - ${COMPANY_INFO.email}`, 105, 285, { align: 'center' })

  return doc
}

function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'CASH':
      return 'Espèces'
    case 'CARD':
      return 'Carte bancaire'
    case 'TRANSFER':
      return 'Virement'
    case 'CREDIT':
      return 'Crédit'
    default:
      return method
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

