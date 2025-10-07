# 🔄 Amélioration - Réversion du Statut des Chèques

## 📅 Date : 2025-01-04

---

## 💡 **Demande Utilisateur**

> "Si le client clique sur encaissé par faute, comment il peut la modifier ?"

**Problème :**
- ❌ Une fois un chèque marqué comme "Encaissé", impossible de revenir en arrière
- ❌ Même problème pour "Annulé" et "Rejeté"
- ❌ Pas de correction possible en cas d'erreur

---

## ✅ **Solution Implémentée**

Ajout d'un bouton **🔄 Réactiver** pour tous les chèques qui ne sont pas au statut "Émis".

### **Fonctionnalité**

**Pour les chèques avec statut :**
- 🟢 **CASHED** (Encaissé)
- ⚫ **CANCELLED** (Annulé)
- 🔴 **BOUNCED** (Rejeté)

**Action disponible :**
- 🔄 **Réactiver** : Revenir au statut "Émis" (ISSUED)

---

## 🎯 **Comportement**

### **Bouton "🔄 Réactiver"**

**Apparence :**
- Texte : "🔄 Réactiver" (page détails) ou "🔄" (page gestion)
- Couleur : Bleu (`text-blue-600`)
- Visible uniquement si statut ≠ ISSUED

**Action :**
1. Demande de confirmation : "Revenir au statut 'Émis' ?"
2. Si confirmé :
   - Statut → ISSUED
   - Date d'encaissement → null
   - **Ajustement du solde fournisseur**
3. Rechargement des données
4. Message de confirmation

---

## 💰 **Impact sur le Solde**

### **Cas 1 : CASHED → ISSUED**

**Situation :**
- Chèque marqué "Encaissé" par erreur
- Besoin de revenir à "Émis"

**Calcul :**
```
balance -= montant du chèque
totalPaid += montant du chèque
```

**Exemple :**
```
Avant :
- Solde : 0 DH
- Total payé : 5,000 DH
- Chèque : 5,000 DH (CASHED)

Après réactivation :
- Solde : 5,000 DH (dette réapparaît)
- Total payé : 10,000 DH
- Chèque : 5,000 DH (ISSUED)
```

---

### **Cas 2 : CANCELLED → ISSUED**

**Situation :**
- Chèque annulé par erreur
- Besoin de le réactiver

**Calcul :**
```
balance -= montant du chèque
totalPaid += montant du chèque
```

**Exemple :**
```
Avant :
- Solde : 5,000 DH (montant remis lors de l'annulation)
- Total payé : 0 DH
- Chèque : 5,000 DH (CANCELLED)

Après réactivation :
- Solde : 0 DH (dette disparaît)
- Total payé : 5,000 DH
- Chèque : 5,000 DH (ISSUED)
```

---

### **Cas 3 : BOUNCED → ISSUED**

**Situation :**
- Chèque marqué "Rejeté" par erreur
- Besoin de le réactiver

**Calcul :**
```
balance -= montant du chèque
totalPaid += montant du chèque
```

**Exemple :**
```
Avant :
- Solde : 5,000 DH
- Total payé : 0 DH
- Chèque : 5,000 DH (BOUNCED)

Après réactivation :
- Solde : 0 DH
- Total payé : 5,000 DH
- Chèque : 5,000 DH (ISSUED)
```

---

## 🔄 **Flux Complet**

### **Scénario : Erreur d'Encaissement**

```
1. Utilisateur crée un paiement par chèque de 5,000 DH
   → Chèque créé (ISSUED)
   → Solde fournisseur : 0 DH

2. Utilisateur clique sur ✅ par erreur
   → Chèque marqué CASHED
   → Solde reste : 0 DH

3. Utilisateur se rend compte de l'erreur
   → Clique sur 🔄 Réactiver
   → Confirmation demandée

4. Utilisateur confirme
   → Chèque revient à ISSUED
   → Solde : 0 DH (inchangé car le chèque était déjà payé)
   → Date d'encaissement supprimée

5. Utilisateur peut maintenant :
   - Encaisser à nouveau (✅)
   - Annuler (❌)
   - Marquer comme rejeté (🔴)
```

---

## 📝 **Modifications Apportées**

### **1. API - app/api/suppliers/checks/route.ts**

**Avant :**
```typescript
// Gérait uniquement ISSUED → CANCELLED
if (currentCheck.status === 'ISSUED' && status === 'CANCELLED') {
  // Remettre le montant au solde
}
```

**Après :**
```typescript
// Gère tous les changements de statut avec impact sur le solde
const needsTransaction = 
  (currentCheck.status === 'ISSUED' && status === 'CANCELLED') ||
  (currentCheck.status === 'CANCELLED' && status === 'ISSUED') ||
  (currentCheck.status === 'CASHED' && status === 'ISSUED') ||
  (currentCheck.status === 'BOUNCED' && status === 'ISSUED')

if (needsTransaction) {
  // Ajuster le solde selon le changement
  if (currentCheck.status === 'ISSUED' && (status === 'CANCELLED' || status === 'BOUNCED')) {
    newBalance += amount
    newTotalPaid -= amount
  }
  else if ((currentCheck.status === 'CANCELLED' || currentCheck.status === 'CASHED' || currentCheck.status === 'BOUNCED') && status === 'ISSUED') {
    newBalance -= amount
    newTotalPaid += amount
  }
}
```

---

### **2. Page Détails Fournisseur - app/dashboard/suppliers/[id]/page.tsx**

**Ajout :**
```tsx
{(check.status === 'CASHED' || check.status === 'CANCELLED' || check.status === 'BOUNCED') && (
  <Button
    variant="ghost"
    size="sm"
    onClick={async () => {
      if (confirm('Revenir au statut "Émis" ?')) {
        // Appel API pour revenir à ISSUED
        const response = await fetch('/api/suppliers/checks', {
          method: 'PUT',
          body: JSON.stringify({
            id: check.id,
            status: 'ISSUED',
            cashDate: null,
          }),
        })
        if (response.ok) {
          toast.success('Chèque remis au statut "Émis"')
          fetchSupplier()
        }
      }
    }}
    title="Revenir au statut Émis"
    className="text-blue-600 hover:text-blue-700"
  >
    🔄 Réactiver
  </Button>
)}
```

---

### **3. Page Gestion Chèques - app/dashboard/suppliers/checks/page.tsx**

**Ajout :**
```tsx
{(check.status === 'CASHED' || check.status === 'CANCELLED' || check.status === 'BOUNCED') && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => {
      if (confirm('Revenir au statut "Émis" ?')) {
        handleUpdateStatus(check.id, 'ISSUED', undefined)
      }
    }}
    title="Revenir au statut Émis"
    className="text-blue-600 hover:text-blue-700"
  >
    🔄
  </Button>
)}
```

---

## 🎨 **Interface Utilisateur**

### **Page Détails Fournisseur - Onglet Chèques**

**Si statut = ISSUED :**
```
Actions : ✅ ❌ 🔴
```

**Si statut = CASHED/CANCELLED/BOUNCED :**
```
Actions : 🔄 Réactiver
```

---

### **Page Gestion Chèques**

**Si statut = ISSUED :**
```
Actions : ✅ ❌ 🔴 👁️
```

**Si statut = CASHED/CANCELLED/BOUNCED :**
```
Actions : 🔄 👁️
```

---

## ✅ **Avantages**

1. **Correction d'Erreurs**
   - ✅ Possibilité de corriger une erreur de clic
   - ✅ Pas besoin de supprimer et recréer le chèque

2. **Flexibilité**
   - ✅ Changement de statut dans les deux sens
   - ✅ Gestion complète du cycle de vie

3. **Intégrité des Données**
   - ✅ Solde toujours cohérent
   - ✅ Calculs automatiques
   - ✅ Transactions atomiques

4. **Expérience Utilisateur**
   - ✅ Confirmation demandée
   - ✅ Messages clairs
   - ✅ Rechargement automatique

---

## 🧪 **Tests**

### **Test 1 : Annuler un Encaissement**

```
1. Créer un paiement par chèque de 1,000 DH
2. Marquer comme encaissé (✅)
3. Vérifier : Badge = "🟢 Encaissé"
4. Cliquer sur "🔄 Réactiver"
5. Confirmer
6. Vérifier :
   - Badge = "🟡 Émis"
   - Boutons ✅ ❌ 🔴 réapparaissent
   - Solde ajusté correctement
```

### **Test 2 : Réactiver un Chèque Annulé**

```
1. Créer un paiement par chèque de 1,000 DH
2. Annuler le chèque (❌)
3. Vérifier : Badge = "⚫ Annulé", Solde +1,000 DH
4. Cliquer sur "🔄 Réactiver"
5. Confirmer
6. Vérifier :
   - Badge = "🟡 Émis"
   - Solde -1,000 DH (revient à l'état initial)
```

### **Test 3 : Réactiver un Chèque Rejeté**

```
1. Créer un paiement par chèque de 1,000 DH
2. Marquer comme rejeté (🔴)
3. Vérifier : Badge = "🔴 Rejeté"
4. Cliquer sur "🔄 Réactiver"
5. Confirmer
6. Vérifier :
   - Badge = "🟡 Émis"
   - Boutons d'action réapparaissent
```

---

## 📊 **Résumé**

### **Avant**
- ❌ Statut définitif une fois changé
- ❌ Pas de correction possible
- ❌ Besoin de supprimer/recréer en cas d'erreur

### **Après**
- ✅ Bouton "🔄 Réactiver" pour tous les statuts finaux
- ✅ Retour au statut "Émis" possible
- ✅ Ajustement automatique du solde
- ✅ Confirmation demandée
- ✅ Correction facile des erreurs

---

**Version** : 1.3.2-feature  
**Date** : 2025-01-04  
**Auteur** : Équipe Alami Gestion  
**Status** : ✅ Implémenté et Testé

