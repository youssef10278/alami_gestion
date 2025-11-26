'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, Download, Check, Printer, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeliveryNoteButtonProps {
  saleId: string
  saleNumber: string
  isGenerated?: boolean
  onGenerated?: () => void
  className?: string
  customerPhone?: string | null
  customerName?: string | null
}

export default function DeliveryNoteButton({
  saleId,
  saleNumber,
  isGenerated = false,
  onGenerated,
  className,
  customerPhone,
  customerName
}: DeliveryNoteButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(isGenerated)

  const handleGenerateDeliveryNote = async () => {
    try {
      setIsGenerating(true)
      
      // Générer et télécharger le PDF
      const response = await fetch(`/api/sales/${saleId}/delivery-note`)
      
      if (!response.ok) {
        let errorMessage = 'Erreur lors de la génération'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          // Si la réponse n'est pas du JSON, utiliser le texte brut
          const text = await response.text()
          if (text.includes('Non authentifié')) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.'
          } else if (text.includes('Internal Server Error')) {
            errorMessage = 'Erreur serveur. Veuillez réessayer.'
          } else {
            errorMessage = `Erreur ${response.status}: ${text.substring(0, 100)}`
          }
        }
        throw new Error(errorMessage)
      }

      // Télécharger le fichier PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bon-livraison-${saleNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Marquer comme généré
      setGenerated(true)
      onGenerated?.()
      
      toast.success('Bon de livraison généré et téléchargé avec succès!')

    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrintDeliveryNote = async () => {
    try {
      setIsGenerating(true)

      // Générer le PDF pour impression
      const response = await fetch(`/api/sales/${saleId}/delivery-note`)

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la génération'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          // Si la réponse n'est pas du JSON, utiliser le texte brut
          const text = await response.text()
          if (text.includes('Non authentifié')) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.'
          } else if (text.includes('Internal Server Error')) {
            errorMessage = 'Erreur serveur. Veuillez réessayer.'
          } else {
            errorMessage = `Erreur ${response.status}: ${text.substring(0, 100)}`
          }
        }
        throw new Error(errorMessage)
      }

      // Ouvrir le PDF dans un nouvel onglet pour impression
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }

      // Marquer comme généré
      setGenerated(true)
      onGenerated?.()

      toast.success('Bon de livraison ouvert pour impression!')

    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShareWhatsApp = async () => {
    try {
      // Vérifier si le client a un numéro de téléphone
      if (!customerPhone) {
        toast.error('Aucun numéro de téléphone pour ce client')
        return
      }

      setIsGenerating(true)

      // Générer le PDF
      const response = await fetch(`/api/sales/${saleId}/delivery-note`)

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF')
      }

      // Télécharger le fichier PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bon-livraison-${saleNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Marquer comme généré
      setGenerated(true)
      onGenerated?.()

      // Nettoyer le numéro de téléphone (enlever espaces, tirets, etc.)
      const cleanPhone = customerPhone.replace(/[\s\-\(\)]/g, '')

      // Créer le message WhatsApp
      const message = `Bonjour ${customerName || 'cher client'},\n\nVoici votre bon de livraison N° ${saleNumber}.\n\nLe fichier PDF a été téléchargé sur votre appareil. Veuillez le joindre à ce message.\n\nMerci pour votre confiance !`

      // Encoder le message pour l'URL
      const encodedMessage = encodeURIComponent(message)

      // Créer le lien WhatsApp
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`

      // Ouvrir WhatsApp
      window.open(whatsappUrl, '_blank')

      toast.success('PDF téléchargé ! WhatsApp ouvert - veuillez joindre le fichier manuellement')

    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors du partage')
    } finally {
      setIsGenerating(false)
    }
  }

  if (generated) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateDeliveryNote}
          disabled={isGenerating}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger BL
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrintDeliveryNote}
          disabled={isGenerating}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimer BL
        </Button>

        {customerPhone && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareWhatsApp}
            disabled={isGenerating}
            className="text-green-600 border-green-200 hover:bg-green-50"
            title="Partager sur WhatsApp"
          >
            <Share2 className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        )}

        <div className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
          <Check className="w-4 h-4 mr-1" />
          BL généré
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleGenerateDeliveryNote}
        disabled={isGenerating}
        className="bg-orange-500 hover:bg-orange-600 text-white"
        size="sm"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Génération...
          </>
        ) : (
          <>
            <Truck className="w-4 h-4 mr-2" />
            Générer Bon de Livraison
          </>
        )}
      </Button>

      <Button
        onClick={handlePrintDeliveryNote}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className="text-orange-600 border-orange-200 hover:bg-orange-50"
      >
        <Printer className="w-4 h-4 mr-2" />
        Imprimer BL
      </Button>

      {customerPhone && (
        <Button
          onClick={handleShareWhatsApp}
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-200 hover:bg-green-50"
          title="Partager sur WhatsApp"
        >
          <Share2 className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      )}
    </div>
  )
}
