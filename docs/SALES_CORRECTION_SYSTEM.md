# 🔧 Système de Correction des Ventes

## Vue d'ensemble

Le système de correction des ventes permet aux utilisateurs de modifier ou supprimer les ventes en cas d'erreur humaine, tout en maintenant l'intégrité des données et la traçabilité des opérations.

## 🎯 Objectifs

- ✅ **Corriger les erreurs humaines** rapidement et facilement
- ✅ **Maintenir l'intégrité des données** avec des contrôles stricts
- ✅ **Traçabilité complète** de toutes les modifications
- ✅ **Permissions basées sur les rôles** et délais
- ✅ **Restauration automatique** du stock et crédit

---

## 🔐 Système de Permissions

### **Propriétaire (OWNER)**
- ✅ **Modification** : Illimitée dans le temps
- ✅ **Suppression** : Illimitée dans le temps
- ✅ **Toutes les ventes** : Peut modifier/supprimer n'importe quelle vente

### **Vendeur (SELLER)**
- ⏰ **Modification** : Seulement ses propres ventes, dans les **24 heures**
- ⏰ **Suppression** : Seulement ses propres ventes, dans les **2 heures**
- 🚫 **Restrictions** : Ne peut pas toucher aux ventes d'autres vendeurs

---

## 🚫 Restrictions de Sécurité

### **Ventes NON Modifiables**
1. **Ventes avec paiements de crédit** enregistrés
2. **Ventes avec documents générés** (factures, bons de livraison)
3. **Ventes hors délai** pour les vendeurs

### **Validation Obligatoire**
- **Raison de modification** (minimum 5 caractères)
- **Raison de suppression** (minimum 5 caractères)
- **Confirmation explicite** pour les suppressions

---

## 🔄 Processus de Modification

### **1. Vérifications Préalables**
```typescript
// Vérifier les permissions
const canModify = 
  session.role === 'OWNER' || 
  (session.role === 'SELLER' && existingSale.sellerId === session.userId)

// Vérifier les délais (vendeurs uniquement)
const timeSinceCreation = Date.now() - new Date(existingSale.createdAt).getTime()
const maxEditTime = 24 * 60 * 60 * 1000 // 24 heures

if (session.role === 'SELLER' && timeSinceCreation > maxEditTime) {
  throw new Error('Délai de modification dépassé')
}
```

### **2. Transaction de Modification**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Restaurer le stock des anciens items
  // 2. Restaurer le crédit client si nécessaire
  // 3. Supprimer les anciens items
  // 4. Mettre à jour la vente
  // 5. Décrémenter le stock pour les nouveaux items
  // 6. Mettre à jour le crédit du nouveau client
  // 7. Créer un log de modification
})
```

### **3. Traçabilité**
- **Mouvements de stock** : Restauration + Nouvelle sortie
- **Log de modification** : Raison + Utilisateur + Timestamp
- **Référence unique** : `CORRECTION-{saleId}-{timestamp}`

---

## 🗑️ Processus de Suppression

### **1. Vérifications Préalables**
```typescript
// Vérifier les délais (vendeurs uniquement)
const maxDeleteTime = 2 * 60 * 60 * 1000 // 2 heures

// Vérifier l'absence de paiements de crédit
if (existingSale.creditPayments.length > 0) {
  throw new Error('Vente avec paiements de crédit')
}

// Vérifier l'absence de documents
if (existingSale.documents.length > 0) {
  throw new Error('Vente avec documents générés')
}
```

### **2. Transaction de Suppression**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Restaurer le stock
  // 2. Restaurer le crédit client
  // 3. Supprimer les items de vente
  // 4. Supprimer la vente
  // 5. Créer un log de suppression
})
```

---

## 🎨 Interface Utilisateur

### **Boutons d'Action**
- **👁️ Voir** : Toujours visible
- **✏️ Modifier** : Visible si autorisé (icône bleue)
- **🗑️ Supprimer** : Visible dans le dialog de modification
- **🖨️ Imprimer** : Toujours visible

### **Indicateurs Visuels**
```tsx
// Alerte de délai pour vendeurs
{editTimeLeft > 0 ? (
  <div className="text-orange-600 bg-orange-50">
    ⏰ Modification autorisée pendant encore {hours}h
  </div>
) : (
  <div className="text-red-600 bg-red-50">
    ⚠️ Délai de modification dépassé (24h)
  </div>
)}
```

### **Dialog de Modification**
- **Formulaire complet** : Client, produits, paiement
- **Calculs automatiques** : Total, payé, reste
- **Validation en temps réel** : Stock, prix, quantités
- **Champ obligatoire** : Raison de modification

---

## 📊 Logs et Traçabilité

### **Types de Mouvements de Stock**
```typescript
enum StockMovementType {
  'OUT' = 'Sortie normale',
  'IN' = 'Entrée/Restauration', 
  'CORRECTION' = 'Log de modification',
  'DELETION' = 'Log de suppression'
}
```

### **Format des Références**
- **Modification** : `CORRECTION-{saleId}`
- **Suppression** : `DELETE-{saleId}`
- **Log** : `EDIT-{saleId}-{timestamp}`

### **Exemple de Log**
```json
{
  "type": "CORRECTION",
  "reason": "Modification vente par Propriétaire: Erreur de quantité produit A",
  "reference": "EDIT-clx123-1704123456789",
  "timestamp": "2025-01-09T10:30:00Z"
}
```

---

## 🔧 APIs Disponibles

### **GET /api/sales/[id]**
```typescript
// Récupérer une vente spécifique
const sale = await fetch(`/api/sales/${saleId}`)
```

### **PUT /api/sales/[id]**
```typescript
// Modifier une vente
const response = await fetch(`/api/sales/${saleId}`, {
  method: 'PUT',
  body: JSON.stringify({
    customerId: 'customer-id',
    items: [{ productId, quantity, customPrice }],
    paymentMethod: 'CASH',
    amountPaid: 1000,
    notes: 'Notes mises à jour',
    reason: 'Raison de la modification'
  })
})
```

### **DELETE /api/sales/[id]**
```typescript
// Supprimer une vente
const response = await fetch(`/api/sales/${saleId}?reason=${reason}`, {
  method: 'DELETE'
})
```

---

## 🚨 Gestion d'Erreurs

### **Erreurs Communes**
```typescript
// Permissions insuffisantes
{ error: 'Accès non autorisé', status: 403 }

// Délai dépassé
{ error: 'Délai de modification dépassé', status: 403 }

// Vente avec contraintes
{ error: 'Vente avec paiements de crédit', status: 400 }

// Stock insuffisant
{ error: 'Stock insuffisant pour Produit X', status: 400 }

// Raison manquante
{ error: 'Raison de modification requise', status: 400 }
```

### **Gestion Côté Client**
```typescript
try {
  const response = await fetch('/api/sales/123', { method: 'PUT', ... })
  if (!response.ok) {
    const error = await response.json()
    toast.error(error.error)
    return
  }
  toast.success('Vente modifiée avec succès')
} catch (error) {
  toast.error('Erreur réseau')
}
```

---

## 📈 Bonnes Pratiques

### **Pour les Développeurs**
1. **Toujours utiliser des transactions** pour les modifications
2. **Valider côté client ET serveur** 
3. **Logger toutes les opérations** sensibles
4. **Tester les cas limites** (délais, permissions)
5. **Gérer les erreurs gracieusement**

### **Pour les Utilisateurs**
1. **Corriger rapidement** les erreurs (dans les délais)
2. **Fournir des raisons claires** pour les modifications
3. **Vérifier les calculs** avant validation
4. **Contacter le propriétaire** si délai dépassé
5. **Éviter les modifications** sur ventes avec paiements

---

## 🔮 Évolutions Futures

### **Améliorations Prévues**
- [ ] **Historique des modifications** avec diff visuel
- [ ] **Notifications** aux propriétaires pour modifications importantes
- [ ] **Approbation** requise pour certaines modifications
- [ ] **Sauvegarde automatique** avant modification
- [ ] **Restauration** de versions antérieures

### **Métriques à Suivre**
- Nombre de modifications par utilisateur
- Délai moyen entre vente et modification
- Types d'erreurs les plus fréquents
- Taux de succès des corrections

---

## 🎯 Résumé

Le système de correction des ventes offre une solution équilibrée entre **flexibilité** et **sécurité** :

- ✅ **Correction rapide** des erreurs humaines
- ✅ **Contrôles stricts** pour éviter les abus
- ✅ **Traçabilité complète** de toutes les opérations
- ✅ **Interface intuitive** avec indicateurs visuels
- ✅ **Permissions granulaires** basées sur les rôles

**Version** : 1.0.0  
**Date** : 2025-01-09  
**Auteur** : Équipe Alami Gestion
