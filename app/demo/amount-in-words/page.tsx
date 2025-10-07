'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatAmountInWords } from '@/lib/number-to-words'

export default function AmountInWordsDemo() {
  const [amount, setAmount] = useState<number>(1234.56)
  const [inputValue, setInputValue] = useState<string>('1234.56')

  const handleAmountChange = (value: string) => {
    setInputValue(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(numValue)
    }
  }

  const presetAmounts = [
    { label: '1 234,56 DH', value: 1234.56 },
    { label: '5 000 DH', value: 5000 },
    { label: '10 000,75 DH', value: 10000.75 },
    { label: '71 DH', value: 71 },
    { label: '80 DH', value: 80 },
    { label: '81 DH', value: 81 },
    { label: '91 DH', value: 91 },
    { label: '100 DH', value: 100 },
    { label: '200 DH', value: 200 },
    { label: '1 000 DH', value: 1000 },
    { label: '1 000 000 DH', value: 1000000 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 Démonstration : Montant en Lettres
          </h1>
          <p className="text-lg text-gray-600">
            Conversion automatique des montants en lettres pour les factures marocaines
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔢 Saisie du Montant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Montant en dirhams</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={inputValue}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Entrez un montant..."
                className="text-lg"
              />
            </div>
            
            <div>
              <Label>Montants prédéfinis</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAmount(preset.value)
                      setInputValue(preset.value.toString())
                    }}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Conversion Simple */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Conversion Simple
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Montant numérique</Label>
                  <div className="text-2xl font-bold text-blue-600">
                    {amount.toFixed(2)} DH
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Montant en lettres</Label>
                  <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded border italic">
                    {formatAmountInWords(amount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Facture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📄 Format Facture Officielle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Format standard marocain</Label>
                  <div className="text-sm text-gray-800 bg-gray-50 p-4 rounded border italic leading-relaxed">
                    {formatAmountInWords(amount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Facture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧾 Aperçu dans une Facture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
              {/* En-tête facture simulée */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">FACTURE</h2>
                <p className="text-gray-600">N° FAC-000123</p>
              </div>

              {/* Tableau simulé */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-2 text-left">Désignation</th>
                      <th className="border border-gray-300 p-2 text-center">Qté</th>
                      <th className="border border-gray-300 p-2 text-right">Prix Unit.</th>
                      <th className="border border-gray-300 p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Produit exemple</td>
                      <td className="border border-gray-300 p-2 text-center">1</td>
                      <td className="border border-gray-300 p-2 text-right">{amount.toFixed(2)} DH</td>
                      <td className="border border-gray-300 p-2 text-right">{amount.toFixed(2)} DH</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="flex justify-end mb-4">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b">
                    <span>Sous-total HT:</span>
                    <span>{amount.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>TVA (20%):</span>
                    <span>{(amount * 0.2).toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-lg bg-blue-50 px-3 rounded">
                    <span>TOTAL TTC:</span>
                    <span>{(amount * 1.2).toFixed(2)} DH</span>
                  </div>
                </div>
              </div>

              {/* Montant en lettres - NOUVELLE FONCTIONNALITÉ */}
              <div className="mt-4 p-3 bg-gray-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm italic text-gray-700">
                  {formatAmountInWords(amount * 1.2)}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Merci pour votre confiance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ℹ️ Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">✅ Fonctionnalités</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Conversion automatique en lettres françaises</li>
                  <li>• Support des décimales (centimes)</li>
                  <li>• Gestion des cas spéciaux (70-79, 80-89, 90-99)</li>
                  <li>• Pluriels automatiques</li>
                  <li>• Format standard marocain</li>
                  <li>• Intégration dans tous les PDF</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Avantages</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Conformité légale marocaine</li>
                  <li>• Prévention des fraudes</li>
                  <li>• Professionnalisme des documents</li>
                  <li>• Clarté juridique</li>
                  <li>• Automatisation complète</li>
                  <li>• Aucune configuration requise</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
