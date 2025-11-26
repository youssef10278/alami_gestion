# 🧹 Nettoyage Automatique des PDFs Cloudinary (Optionnel)

## 📋 Contexte

Lorsque vous partagez un bon de livraison sur desktop, le PDF est uploadé sur Cloudinary et reste stocké indéfiniment. Pour éviter d'accumuler des fichiers inutiles, vous pouvez implémenter un système de nettoyage automatique.

---

## 🎯 Options de Nettoyage

### **Option 1 : Nettoyage Manuel via API**

Utilisez l'API DELETE déjà créée pour supprimer un PDF spécifique.

**Endpoint** : `DELETE /api/sales/[id]/delivery-note/share?publicId=[PUBLIC_ID]`

**Exemple** :
```javascript
await fetch('/api/sales/123/delivery-note/share?publicId=alami-gestion/delivery-notes/bon-livraison-V001-1234567890', {
  method: 'DELETE'
})
```

---

### **Option 2 : Nettoyage Automatique avec Cron Job (Recommandé)**

Créez un cron job qui s'exécute quotidiennement pour supprimer les PDFs de plus de 24h.

#### **Étape 1 : Créer l'API de nettoyage**

Créez le fichier `app/api/cleanup/delivery-notes/route.ts` :

```typescript
import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST() {
  try {
    // Récupérer tous les PDFs du dossier delivery-notes
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'alami-gestion/delivery-notes',
      max_results: 500
    })

    const now = Date.now()
    const oneDayInMs = 24 * 60 * 60 * 1000
    let deletedCount = 0

    // Supprimer les fichiers de plus de 24h
    for (const resource of result.resources) {
      const createdAt = new Date(resource.created_at).getTime()
      const age = now - createdAt

      if (age > oneDayInMs) {
        await cloudinary.uploader.destroy(resource.public_id, {
          resource_type: 'raw'
        })
        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount} fichier(s) supprimé(s)`,
      deletedCount
    })

  } catch (error) {
    console.error('Error cleaning up delivery notes:', error)
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage' },
      { status: 500 }
    )
  }
}
```

#### **Étape 2 : Configurer le Cron Job**

**Option A : Utiliser Vercel Cron Jobs** (si déployé sur Vercel)

Créez `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/cleanup/delivery-notes",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Option B : Utiliser un service externe** (EasyCron, cron-job.org, etc.)

Configurez un appel HTTP POST quotidien vers :
```
https://votre-domaine.com/api/cleanup/delivery-notes
```

**Option C : Utiliser Node-Cron** (si auto-hébergé)

Installez node-cron :
```bash
npm install node-cron
```

Créez `lib/cron.ts` :
```typescript
import cron from 'node-cron'

// Exécuter tous les jours à 2h du matin
cron.schedule('0 2 * * *', async () => {
  console.log('🧹 Nettoyage des PDFs Cloudinary...')
  
  try {
    const response = await fetch('http://localhost:3000/api/cleanup/delivery-notes', {
      method: 'POST'
    })
    const result = await response.json()
    console.log('✅ Nettoyage terminé:', result)
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error)
  }
})
```

---

### **Option 3 : Suppression Immédiate Après Partage**

Modifiez `components/sales/DeliveryNoteButton.tsx` pour supprimer le PDF après un délai :

```typescript
// Dans handleShareWhatsApp(), après l'upload Cloudinary :

const { url: pdfUrl, publicId } = await uploadResponse.json()

// Ouvrir WhatsApp
window.open(whatsappUrl, '_blank')

// Supprimer le PDF après 5 minutes
setTimeout(async () => {
  try {
    await fetch(`/api/sales/${saleId}/delivery-note/share?publicId=${publicId}`, {
      method: 'DELETE'
    })
    console.log('PDF supprimé de Cloudinary')
  } catch (error) {
    console.error('Erreur suppression PDF:', error)
  }
}, 5 * 60 * 1000) // 5 minutes
```

**⚠️ Attention** : Cette méthode n'est pas fiable car si l'utilisateur ferme la page, le PDF ne sera pas supprimé.

---

### **Option 4 : Utiliser Cloudinary Auto-Delete**

Cloudinary ne supporte pas nativement l'auto-delete pour les fichiers `raw`, mais vous pouvez utiliser leur API de transformation.

---

## 🎯 Recommandation

**Option 2 (Cron Job)** est la meilleure solution car :

✅ **Automatique** - Pas d'intervention manuelle  
✅ **Fiable** - S'exécute même si l'utilisateur ferme la page  
✅ **Configurable** - Vous pouvez ajuster la durée de rétention  
✅ **Centralisé** - Un seul endroit pour gérer le nettoyage

---

## 📊 Estimation de Stockage

**Taille moyenne d'un bon de livraison PDF** : ~50 KB

**Nombre de partages par jour** : 100 (exemple)

**Stockage quotidien** : 100 × 50 KB = 5 MB

**Stockage mensuel (sans nettoyage)** : 5 MB × 30 = 150 MB

**Avec nettoyage quotidien** : ~5 MB maximum

---

## 🔧 Implémentation Rapide

Si vous voulez implémenter le nettoyage automatique maintenant :

1. Créez le fichier `app/api/cleanup/delivery-notes/route.ts` (code ci-dessus)
2. Testez manuellement : `POST http://localhost:3000/api/cleanup/delivery-notes`
3. Configurez un cron job externe (cron-job.org) pour appeler cette URL quotidiennement

---

**Note** : Cette fonctionnalité est **optionnelle**. Les PDFs sur Cloudinary ne coûtent presque rien en stockage, donc vous pouvez décider de ne pas implémenter le nettoyage si vous préférez garder un historique complet.

