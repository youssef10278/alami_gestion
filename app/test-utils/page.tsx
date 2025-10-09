'use client'

import { safeToFixed, safeNumber } from '@/lib/utils'
import { useState } from 'react'

export default function TestUtilsPage() {
  const [testValue, setTestValue] = useState('')

  const testCases = [
    { value: 123.456, description: 'Nombre normal' },
    { value: '123.456', description: 'String numérique' },
    { value: null, description: 'null' },
    { value: undefined, description: 'undefined' },
    { value: '', description: 'String vide' },
    { value: 'abc', description: 'String non numérique' },
    { value: 0, description: 'Zéro' },
    { value: -123.456, description: 'Nombre négatif' },
    { value: Infinity, description: 'Infinity' },
    { value: -Infinity, description: '-Infinity' },
    { value: NaN, description: 'NaN' }
  ]

  const testCustomValue = () => {
    try {
      const result = safeToFixed(testValue)
      alert(`Résultat: ${result}`)
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test des fonctions utilitaires</h1>
      
      <div className="space-y-6">
        {/* Test avec valeur personnalisée */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test avec valeur personnalisée</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder="Entrez une valeur à tester"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={testCustomValue}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tester
            </button>
          </div>
        </div>

        {/* Tests prédéfinis */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tests prédéfinis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="bg-white p-4 rounded border">
                <h3 className="font-medium text-gray-700 mb-2">{testCase.description}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Valeur:</span> 
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                      {String(testCase.value)}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">safeToFixed():</span> 
                    <code className="ml-2 bg-green-100 px-2 py-1 rounded">
                      {safeToFixed(testCase.value)}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">safeNumber():</span> 
                    <code className="ml-2 bg-blue-100 px-2 py-1 rounded">
                      {safeNumber(testCase.value)}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test d'intégration */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test d'intégration - Calculs de vente</h2>
          <div className="space-y-4">
            {[
              { name: 'Produit A', price: 100.50, quantity: 2 },
              { name: 'Produit B', price: null, quantity: 1 },
              { name: 'Produit C', price: undefined, quantity: 3 },
              { name: 'Produit D', price: 'abc', quantity: 1 }
            ].map((product, index) => {
              const safePrice = safeNumber(product.price)
              const total = safePrice * product.quantity
              return (
                <div key={index} className="bg-white p-4 rounded border">
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Prix original: {String(product.price)}</div>
                    <div>Prix sécurisé: {safeToFixed(safePrice)} DH</div>
                    <div>Quantité: {product.quantity}</div>
                    <div>Total: {safeToFixed(total)} DH</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
