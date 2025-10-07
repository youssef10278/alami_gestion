# 🐛 Guide de Débogage - Création de Factures

## 📅 Date : 2025-01-03

---

## 🚨 **Problème Identifié**

**Erreur** : `400 (Bad Request)` lors de la création de factures
**Message** : "Données invalides"

---

## 🔍 **Diagnostic Effectué**

### **1. Validation Côté Client ✅**
- ✅ Validation des champs requis
- ✅ Vérification des articles
- ✅ Gestion des états de chargement

### **2. Validation Côté Serveur ✅**
- ✅ Schéma Zod mis à jour
- ✅ Transformation des chaînes vides en `null`
- ✅ Messages d'erreur détaillés
- ✅ Logs de débogage ajoutés

### **3. Tests de Validation ✅**
- ✅ Test Zod réussi
- ✅ Test avec données problématiques
- ✅ Validation des champs requis

---

## 🛠️ **Solutions Implémentées**

### **1. Correction du Schéma de Validation**

**Fichier** : `app/api/invoices/route.ts`

```typescript
// Avant (problématique)
customerPhone: z.string().optional(),
customerEmail: z.string().optional().refine(...),

// Après (corrigé)
customerPhone: z.string().optional().nullable().transform(val => val === '' ? null : val),
customerEmail: z.string().optional().nullable().transform(val => val === '' ? null : val).refine(...),
```

**Améliorations :**
- ✅ Transformation des chaînes vides en `null`
- ✅ Messages d'erreur plus clairs
- ✅ Validation des types de données

### **2. Correction de la Gestion des États**

**Fichier** : `app/dashboard/invoices/new/page.tsx`

```typescript
// Avant (problématique)
if (!formData.customerName.trim()) {
  toast.error('Le nom du client est requis')
  return // ❌ Oublie de remettre setSaving(false)
}

// Après (corrigé)
if (!formData.customerName.trim()) {
  toast.error('Le nom du client est requis')
  setSaving(false) // ✅ Remet l'état de chargement
  return
}
```

### **3. Logs de Débogage Améliorés**

**Fichier** : `app/api/invoices/route.ts`

```typescript
console.log('=== INVOICE CREATION DEBUG ===')
console.log('Received invoice data:', JSON.stringify(body, null, 2))
console.log('Data types:')
console.log('- customerName:', typeof body.customerName, '=', body.customerName)
console.log('- items length:', Array.isArray(body.items) ? body.items.length : 'not array')
console.log('- subtotal:', typeof body.subtotal, '=', body.subtotal)
console.log('- total:', typeof body.total, '=', body.total)
```

---

## 🧪 **Tests de Validation**

### **Script de Test** : `scripts/test-invoice-creation.js`

```bash
node scripts/test-invoice-creation.js
```

**Résultats :**
- ✅ Validation Zod réussie
- ✅ Test avec données problématiques
- ✅ Messages d'erreur corrects

### **Script de Test API** : `scripts/test-api-request.js`

```bash
node scripts/test-api-request.js
```

**Note** : Nécessite que le serveur soit démarré (`npm run dev`)

---

## 🔧 **Étapes de Débogage**

### **1. Vérifier les Logs du Serveur**

Démarrez le serveur et regardez les logs :

```bash
npm run dev
```

Puis essayez de créer une facture et regardez les logs dans la console.

### **2. Vérifier les Données Envoyées**

Les logs afficheront :
- Les données reçues par l'API
- Les types de données
- Les erreurs de validation détaillées

### **3. Tester avec des Données Minimales**

```javascript
const minimalData = {
  type: 'INVOICE',
  customerName: 'Test Client',
  subtotal: 100,
  discountAmount: 0,
  taxRate: 20,
  taxAmount: 20,
  total: 120,
  items: [{
    productName: 'Test Product',
    quantity: 1,
    unitPrice: 100,
    discountAmount: 0,
    total: 100
  }]
}
```

---

## 🎯 **Causes Possibles**

### **1. Problème d'Authentification**
- ❌ Session utilisateur invalide
- ❌ Rôle utilisateur incorrect

### **2. Problème de Validation**
- ❌ Champs requis manquants
- ❌ Types de données incorrects
- ❌ Valeurs en dehors des limites

### **3. Problème de Base de Données**
- ❌ Contrainte de clé étrangère
- ❌ Contrainte d'unicité
- ❌ Connexion à la base de données

---

## 🚀 **Solutions Recommandées**

### **1. Vérifier l'Authentification**

Assurez-vous que l'utilisateur est connecté avec le rôle `OWNER` :

```typescript
const session = await getSession()
if (!session || session.role !== 'OWNER') {
  return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
}
```

### **2. Vérifier les Données du Formulaire**

Dans le composant de création de factures, ajoutez des logs :

```typescript
console.log('Form data:', formData)
console.log('Items:', items)
console.log('Calculated totals:', { subtotal, discountAmount, taxAmount, total })
```

### **3. Tester avec des Données Simples**

Commencez par créer une facture avec :
- Un seul article
- Des données minimales
- Pas de champs optionnels

---

## 📋 **Checklist de Débogage**

- [ ] ✅ Serveur démarré (`npm run dev`)
- [ ] ✅ Utilisateur connecté avec rôle `OWNER`
- [ ] ✅ Nom du client renseigné
- [ ] ✅ Au moins un article ajouté
- [ ] ✅ Quantité > 0
- [ ] ✅ Prix unitaire >= 0
- [ ] ✅ Total calculé correctement
- [ ] ✅ Logs du serveur consultés
- [ ] ✅ Erreurs de validation identifiées

---

## 🎉 **Résultat Attendu**

Après application des corrections :

1. **Validation côté client** : Messages d'erreur clairs
2. **Validation côté serveur** : Transformation des données
3. **Création de facture** : Succès avec numéro généré
4. **Redirection** : Vers la liste des factures
5. **Notification** : "Facture créée avec succès"

---

**Version** : 1.0.0  
**Date** : 2025-01-03  
**Status** : 🔧 En cours de débogage  
**Tests** : ✅ Validation réussie

