# 📱 Partage WhatsApp - Bon de Livraison

## 🎯 Fonctionnalité Ajoutée

Ajout de la possibilité de **partager le bon de livraison directement sur WhatsApp** depuis l'application.

---

## ✨ Fonctionnement

### 1. **Bouton WhatsApp**

Un nouveau bouton **"WhatsApp"** apparaît dans le composant `DeliveryNoteButton` :

- ✅ **Visible uniquement** si le client a un numéro de téléphone
- ✅ **Disponible** après la génération du bon de livraison
- ✅ **Icône** : `Share2` (Lucide React)
- ✅ **Couleur** : Vert (style WhatsApp)

### 2. **Processus de Partage**

Lorsque l'utilisateur clique sur le bouton WhatsApp :

1. **Vérification** : Le système vérifie que le client a un numéro de téléphone
2. **Génération** : Le bon de livraison PDF est généré
3. **Téléchargement** : Le PDF est téléchargé automatiquement sur l'appareil
4. **Nettoyage** : Le numéro de téléphone est nettoyé (espaces, tirets, parenthèses supprimés)
5. **Message** : Un message pré-rempli est créé avec :
   - Salutation personnalisée avec le nom du client
   - Numéro du bon de livraison
   - Instructions pour joindre le fichier
   - Message de remerciement
6. **Ouverture** : WhatsApp s'ouvre automatiquement avec le message pré-rempli
7. **Action manuelle** : L'utilisateur doit joindre manuellement le fichier PDF téléchargé

---

## 📝 Modifications Apportées

### **Fichier 1 : `components/sales/DeliveryNoteButton.tsx`**

#### **Imports**
```typescript
import { Share2 } from 'lucide-react'
```

#### **Props**
```typescript
interface DeliveryNoteButtonProps {
  saleId: string
  saleNumber: string
  isGenerated?: boolean
  onGenerated?: () => void
  className?: string
  customerPhone?: string | null      // ✅ NOUVEAU
  customerName?: string | null       // ✅ NOUVEAU
}
```

#### **Nouvelle Fonction : `handleShareWhatsApp()`**

```typescript
const handleShareWhatsApp = async () => {
  // 1. Vérifier le numéro de téléphone
  if (!customerPhone) {
    toast.error('Aucun numéro de téléphone pour ce client')
    return
  }

  // 2. Générer et télécharger le PDF
  const response = await fetch(`/api/sales/${saleId}/delivery-note`)
  const blob = await response.blob()
  // ... téléchargement automatique

  // 3. Nettoyer le numéro de téléphone
  const cleanPhone = customerPhone.replace(/[\s\-\(\)]/g, '')
  
  // 4. Créer le message WhatsApp
  const message = `Bonjour ${customerName || 'cher client'},\n\n...`
  
  // 5. Ouvrir WhatsApp
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank')
}
```

#### **Bouton WhatsApp (État Généré)**
```typescript
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
```

#### **Bouton WhatsApp (État Non Généré)**
```typescript
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
```

---

### **Fichier 2 : `app/dashboard/sales/history/page.tsx`**

#### **Interface Sale**
```typescript
interface Sale {
  // ...
  customer: {
    name: string
    company: string | null
    phone: string | null      // ✅ AJOUTÉ
  } | null
  // ...
}
```

#### **Utilisation du Composant (3 emplacements)**

**1. Table Desktop (ligne 725)**
```typescript
<DeliveryNoteButton
  saleId={sale.id}
  saleNumber={sale.saleNumber}
  isGenerated={sale.deliveryNoteGenerated}
  customerPhone={sale.customer?.phone}      // ✅ AJOUTÉ
  customerName={sale.customer?.name}        // ✅ AJOUTÉ
  className="ml-1"
/>
```

**2. Cartes Mobile (ligne 820)**
```typescript
<DeliveryNoteButton
  saleId={sale.id}
  saleNumber={sale.saleNumber}
  isGenerated={sale.deliveryNoteGenerated}
  customerPhone={sale.customer?.phone}      // ✅ AJOUTÉ
  customerName={sale.customer?.name}        // ✅ AJOUTÉ
  className="p-2"
/>
```

**3. Modal de Détails (ligne 923)**
```typescript
<DeliveryNoteButton
  saleId={selectedSale.id}
  saleNumber={selectedSale.saleNumber}
  isGenerated={selectedSale.deliveryNoteGenerated}
  customerPhone={selectedSale.customer?.phone}      // ✅ AJOUTÉ
  customerName={selectedSale.customer?.name}        // ✅ AJOUTÉ
  className="w-full h-10 sm:h-11"
/>
```

---

## 🎉 Résultat

### **Boutons Disponibles**

Après génération du bon de livraison, l'utilisateur voit :

1. ✅ **Télécharger BL** (vert) - Télécharge le PDF
2. ✅ **Imprimer BL** (bleu) - Ouvre le PDF pour impression
3. ✅ **WhatsApp** (vert) - Partage sur WhatsApp *(si numéro disponible)*
4. ✅ **BL généré** (badge vert) - Indicateur de statut

### **Message WhatsApp Pré-rempli**

```
Bonjour [Nom du Client],

Voici votre bon de livraison N° [Numéro].

Le fichier PDF a été téléchargé sur votre appareil. Veuillez le joindre à ce message.

Merci pour votre confiance !
```

---

## ✅ Tests Effectués

- ✅ **Build réussi** - Next.js 15.5.4 compilé en 27.2 secondes
- ✅ **Aucune erreur TypeScript**
- ✅ **Code propre** - Aucun warning

---

## 📌 Notes Importantes

1. **Numéro de téléphone requis** : Le bouton WhatsApp n'apparaît que si le client a un numéro de téléphone
2. **Téléchargement automatique** : Le PDF est téléchargé automatiquement avant l'ouverture de WhatsApp
3. **Action manuelle** : L'utilisateur doit joindre manuellement le fichier PDF dans WhatsApp (limitation de l'API WhatsApp Web)
4. **Format du numéro** : Le numéro est nettoyé automatiquement (espaces, tirets, parenthèses supprimés)
5. **Compatibilité** : Fonctionne sur desktop et mobile (ouvre WhatsApp Web ou l'application mobile)

---

**Date** : 26 Novembre 2025  
**Version** : Next.js 15.5.4

