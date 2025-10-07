# 🐛 Débogage - Impression de Reçus

## 📅 Date : 2025-01-03

---

## 🔍 **Problème Rapporté**

**Symptôme :**
- Après validation d'une vente
- Aucun dialogue ne s'affiche
- Impossible d'imprimer le reçu

---

## ✅ **Corrections Appliquées**

### **1. API - Retour des Données**

**Problème :**
L'API retournait directement l'objet `sale` au lieu de `{ sale }`

**Avant :**
```tsx
return NextResponse.json(sale, { status: 201 })
```

**Après :**
```tsx
// Récupérer la vente complète avec toutes les relations
const completeSale = await prisma.sale.findUnique({
  where: { id: sale.id },
  include: {
    items: {
      include: {
        product: true,
      },
    },
    customer: true,
    seller: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
})

return NextResponse.json({ sale: completeSale }, { status: 201 })
```

**Avantage :**
- ✅ Données complètes pour l'impression
- ✅ Inclut les relations (items, customer, seller)
- ✅ Format cohérent avec le frontend

---

### **2. Frontend - Logs de Débogage**

**Ajout de logs pour tracer le flux :**

```tsx
// Après réception de la réponse API
console.log('🔍 Réponse API:', { ok: response.ok, status: response.status, data })

// Sauvegarde de la vente
console.log('💾 Sauvegarde de la vente:', data.sale)
setLastSale(data.sale)

// Affichage du dialogue
console.log('📋 Affichage du dialogue d\'impression')
setShowReceiptDialog(true)

// État du dialogue (dans le render)
console.log('🔍 État du dialogue:', { showReceiptDialog, hasLastSale: !!lastSale })
```

---

## 🧪 **Tests à Effectuer**

### **Test 1 : Vérifier la Console**

1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet "Console"
3. Faire une vente
4. Vérifier les logs suivants :

**Logs attendus :**
```
🔍 Réponse API: { ok: true, status: 201, data: { sale: {...} } }
💾 Sauvegarde de la vente: { id: "...", saleNumber: "VNT-000001", ... }
📋 Affichage du dialogue d'impression
🔍 État du dialogue: { showReceiptDialog: true, hasLastSale: true }
```

---

### **Test 2 : Vérifier les Données de la Vente**

**Dans la console, vérifier que `data.sale` contient :**
```javascript
{
  id: "...",
  saleNumber: "VNT-000001",
  totalAmount: 1250.00,
  paidAmount: 1250.00,
  creditAmount: 0,
  paymentMethod: "CASH",
  status: "COMPLETED",
  createdAt: "2025-01-03T14:30:00.000Z",
  customer: {
    id: "...",
    name: "Ahmed Ben Ali",
    ...
  },
  seller: {
    id: "...",
    name: "Youssef",
    email: "..."
  },
  items: [
    {
      id: "...",
      quantity: 2,
      unitPrice: 125.00,
      total: 250.00,
      product: {
        id: "...",
        name: "Produit A",
        ...
      }
    }
  ]
}
```

---

### **Test 3 : Vérifier l'Affichage du Dialogue**

**Si le dialogue ne s'affiche pas, vérifier :**

1. **État `showReceiptDialog` :**
   - Doit être `true` après la vente
   - Log : `🔍 État du dialogue: { showReceiptDialog: true, ... }`

2. **État `lastSale` :**
   - Doit contenir l'objet de la vente
   - Log : `💾 Sauvegarde de la vente: { ... }`

3. **Condition de rendu :**
   ```tsx
   {showReceiptDialog && lastSale && (
     // Le dialogue devrait s'afficher ici
   )}
   ```

---

## 🔧 **Solutions Possibles**

### **Problème 1 : Dialogue ne s'affiche pas**

**Cause possible :** État non mis à jour

**Solution :**
```tsx
// Vérifier que setShowReceiptDialog(true) est bien appelé
// Vérifier que setLastSale(data.sale) est bien appelé
// Vérifier que data.sale n'est pas undefined
```

---

### **Problème 2 : Erreur dans la console**

**Erreur possible :** `Cannot read property 'saleNumber' of undefined`

**Cause :** `lastSale` est undefined

**Solution :**
```tsx
// Vérifier que l'API retourne bien { sale: {...} }
// Vérifier que data.sale existe avant de l'utiliser
if (data.sale) {
  setLastSale(data.sale)
  setShowReceiptDialog(true)
}
```

---

### **Problème 3 : Dialogue s'affiche puis disparaît**

**Cause possible :** Réinitialisation du formulaire trop rapide

**Solution actuelle :**
```tsx
// Le dialogue est affiché AVANT la réinitialisation
setShowReceiptDialog(true)

// Réinitialisation après
setCart([])
setSelectedCustomer(null)
// ...
```

---

## 📋 **Checklist de Vérification**

### **Backend (API)**
- [ ] L'API retourne `{ sale: {...} }` et non juste `sale`
- [ ] La vente inclut `items`, `customer`, `seller`
- [ ] Le statut HTTP est 201
- [ ] Pas d'erreur dans les logs du serveur

### **Frontend**
- [ ] `data.sale` existe et contient les bonnes données
- [ ] `setLastSale(data.sale)` est appelé
- [ ] `setShowReceiptDialog(true)` est appelé
- [ ] Les logs s'affichent dans la console
- [ ] Pas d'erreur JavaScript dans la console

### **Dialogue**
- [ ] La condition `{showReceiptDialog && lastSale && (` est vraie
- [ ] Le dialogue est bien dans le DOM (vérifier avec l'inspecteur)
- [ ] Le z-index est suffisant (z-50)
- [ ] Pas de CSS qui cache le dialogue

---

## 🚀 **Prochaines Étapes**

1. **Rafraîchir la page** (Ctrl+F5)
2. **Ouvrir la console** (F12)
3. **Faire une vente de test**
4. **Vérifier les logs**
5. **Envoyer les logs si le problème persiste**

---

## 📝 **Logs à Envoyer en Cas de Problème**

**Copier et envoyer :**
1. Tous les logs commençant par 🔍, 💾, 📋
2. Toute erreur en rouge dans la console
3. Le contenu de `data.sale` (si disponible)
4. L'état du dialogue : `{ showReceiptDialog, hasLastSale }`

---

## ✅ **Vérification Finale**

**Le dialogue devrait s'afficher si :**
- ✅ `showReceiptDialog === true`
- ✅ `lastSale !== null`
- ✅ `lastSale.saleNumber` existe
- ✅ `lastSale.items` est un tableau
- ✅ Pas d'erreur JavaScript

**Si toutes ces conditions sont remplies et que le dialogue ne s'affiche toujours pas, il peut y avoir un problème de CSS ou de z-index.**

---

**Version** : 1.2.3-debug  
**Date** : 2025-01-03  
**Auteur** : Équipe Alami Gestion  
**Status** : 🔍 Débogage en cours

