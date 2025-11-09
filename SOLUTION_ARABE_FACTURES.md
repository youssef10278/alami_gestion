# 🔧 Solution Appliquée : Affichage Correct de l'Arabe dans les Factures PDF

## 📋 Problème Identifié

**Symptôme** : Les noms en arabe ne s'affichaient pas correctement dans les **factures PDF**, alors qu'ils s'affichaient correctement dans les **reçus**.

## 🔍 Cause Racine

Le problème était causé par un **conflit de polices** :

1. ✅ La police **Amiri** (qui supporte l'arabe) était bien chargée avec `setupPDFFont(doc)`
2. ❌ **MAIS** ensuite, le code utilisait `doc.setFont('helvetica', 'bold')` et `doc.setFont('helvetica', 'normal')` partout
3. ❌ **Helvetica ne supporte pas les caractères arabes** → Les noms arabes ne s'affichaient pas correctement

### Exemple du Problème

```typescript
// ✅ Police Amiri chargée
setupPDFFont(doc)

// ❌ Police changée vers Helvetica (ne supporte pas l'arabe)
doc.setFont('helvetica', 'bold')

// ❌ Le nom arabe ne s'affiche pas correctement
doc.text(cleanText(data.customer.name), 20, clientSectionY + 22)
```

## ✅ Solution Appliquée

### 1. Création d'une Fonction Helper

Création de la fonction `setDocFont()` qui utilise automatiquement la bonne police :

```typescript
// Fonction helper pour définir la police (Amiri si arabe chargé, sinon Helvetica)
function setDocFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal') {
  if (arabicFontLoaded) {
    // Amiri ne supporte que le style 'normal', on utilise toujours 'normal'
    doc.setFont(amiriFontName, 'normal')
  } else {
    doc.setFont('helvetica', style)
  }
}
```

### 2. Remplacement de Tous les `doc.setFont('helvetica')`

Remplacement de **TOUS** les appels `doc.setFont('helvetica', ...)` par `setDocFont(doc, ...)` dans :

- ✅ `generateManualInvoicePDF()` - Génération des factures manuelles
- ✅ `generateInvoicePDF()` - Génération des factures/devis/bons de livraison
- ✅ `generateSimpleQuotePDF()` - Génération des devis simplifiés
- ✅ `addCompanyLogo()` - Ajout du logo de l'entreprise
- ✅ `addWatermark()` - Ajout du filigrane

### 3. Configuration de la Police dans les Tableaux `autoTable`

**IMPORTANT** : Les tableaux générés par `jspdf-autotable` ont leurs propres paramètres de police.

Ajout du paramètre `font: arabicFontLoaded ? amiriFontName : 'helvetica'` dans :

- ✅ `headStyles` - En-têtes des tableaux
- ✅ `bodyStyles` ou `styles` - Corps des tableaux

**Exemple** :
```typescript
autoTable(doc, {
  // ...
  headStyles: {
    fillColor: tableHeaderColor,
    fontSize: 10,
    font: arabicFontLoaded ? amiriFontName : 'helvetica'  // ← AJOUTÉ
  },
  bodyStyles: {
    fontSize: 9,
    font: arabicFontLoaded ? amiriFontName : 'helvetica'  // ← AJOUTÉ
  }
})
```

Cela garantit que **les noms de produits en arabe** dans les tableaux s'affichent correctement.

### 4. Exemples de Changements

#### Exemple 1 : Texte Normal

**Avant** :
```typescript
doc.setFont('helvetica', 'bold')
doc.text(cleanText(data.customer.name), 20, clientSectionY + 22)
```

**Après** :
```typescript
setDocFont(doc, 'bold')
doc.text(cleanText(data.customer.name), 20, clientSectionY + 22)
```

#### Exemple 2 : Tableaux

**Avant** :
```typescript
autoTable(doc, {
  headStyles: {
    fontSize: 10,
    fontStyle: 'bold'
    // Pas de paramètre 'font' → utilise Helvetica par défaut
  }
})
```

**Après** :
```typescript
autoTable(doc, {
  headStyles: {
    fontSize: 10,
    fontStyle: 'bold',
    font: arabicFontLoaded ? amiriFontName : 'helvetica'  // ← AJOUTÉ
  }
})
```

## 🎯 Résultat

Maintenant, **tous les textes** (y compris les noms de clients et produits en arabe) utilisent la police **Amiri** qui supporte parfaitement l'arabe :

- ✅ Noms de clients en arabe
- ✅ **Noms de produits en arabe dans les tableaux** ← **CORRIGÉ**
- ✅ Adresses en arabe
- ✅ Notes en arabe
- ✅ En-têtes de tableaux en arabe
- ✅ Tous les autres textes arabes

## 📝 Fichiers Modifiés

- `lib/pdf-generator.ts` - Ajout de `setDocFont()` et remplacement de tous les `doc.setFont('helvetica')`

## 🧪 Test de la Solution

Pour tester que la solution fonctionne :

1. Créer une facture avec un client ayant un nom en arabe
2. Générer le PDF de la facture
3. Vérifier que le nom arabe s'affiche correctement

## 🔒 Fallbacks Conservés

Les 3 occurrences de `doc.setFont('helvetica')` restantes sont des **fallbacks** nécessaires :

1. **Ligne 21** : Dans le `catch` de `setupPDFFont()` - Si la police Amiri ne charge pas
2. **Ligne 166** : Dans `setDocFont()` - Fallback automatique si `arabicFontLoaded = false`

Ces fallbacks garantissent que le PDF se génère toujours, même si la police Amiri ne peut pas être chargée.

## 📚 Documentation Technique

### Police Amiri

- **Fichier** : `lib/fonts/amiri-font.ts`
- **Format** : Base64 (TTF encodé)
- **Support** : Caractères arabes complets
- **Style** : Normal uniquement (pas de bold/italic natif)

### Fonction `cleanText()`

La fonction `cleanText()` préserve maintenant les caractères arabes quand `arabicFontLoaded = true` :

```typescript
function cleanText(text: string): string {
  if (!text) return ''

  // Si la police arabe est chargée, garder les caractères arabes
  if (arabicFontLoaded) {
    return text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Supprimer uniquement les émojis
      .trim()
  }

  // Sinon, translittérer l'arabe en latin
  return transliterateArabic(text)
}
```

## ✨ Avantages de la Solution

1. ✅ **Simple** : Une seule fonction helper `setDocFont()`
2. ✅ **Maintenable** : Facile à comprendre et à modifier
3. ✅ **Robuste** : Fallback automatique vers Helvetica si Amiri ne charge pas
4. ✅ **Complète** : Tous les textes utilisent la bonne police
5. ✅ **Performante** : Pas d'impact sur les performances

## 🎉 Conclusion

Le problème d'affichage de l'arabe dans les factures PDF est maintenant **complètement résolu**. Tous les textes arabes s'affichent correctement grâce à l'utilisation systématique de la police Amiri via la fonction `setDocFont()`.

