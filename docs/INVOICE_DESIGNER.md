# 🎨 Designer de Facture - Documentation

## Vue d'ensemble

Le **Designer de Facture** est une fonctionnalité avancée qui permet aux utilisateurs de personnaliser entièrement l'apparence de leurs factures PDF selon leur identité visuelle et leurs préférences.

## ✨ Fonctionnalités

### 🎯 Aperçu en Temps Réel
- **Visualisation instantanée** : Voir immédiatement l'effet des modifications
- **Mise à jour automatique** : L'aperçu se rafraîchit à chaque changement
- **Interface intuitive** : Panneau de configuration à gauche, aperçu à droite

### 🎨 Personnalisation Complète

#### **Thèmes Prédéfinis**
- **Moderne** : Design épuré et contemporain (Bleu/Vert)
- **Classique** : Style traditionnel et professionnel (Gris foncé)
- **Minimal** : Design simple et élégant (Gris clair)
- **Coloré** : Design vibrant et dynamique (Violet/Rose)

#### **Couleurs Personnalisables**

**Couleurs Principales :**
- **Couleur principale** : Logo, accents, éléments principaux
- **Couleur secondaire** : En-têtes de tableau, sections
- **Couleur d'accent** : Highlights, boutons, éléments spéciaux
- **Couleur de fond** : Arrière-plan du document

**Couleurs du Texte :**
- **Texte principal** : Contenu, descriptions, montants
- **Texte de l'en-tête** : Nom entreprise, "FACTURE", informations d'en-tête
- **Texte des sections** : "FACTURÉ À", "Désignation", "Qté", "Prix Unit.", "Total TTC"

#### **Mise en Page**
- **Position du logo** : Gauche, Centre, Droite
- **Taille du logo** : Petit, Moyen, Grand
- **Style d'en-tête** : Dégradé, Couleur unie, Minimal
- **Bordures arrondies** : Aucune, Arrondies, Très arrondies

#### **Typographie**
- **Famille de police** : Helvetica, Times New Roman, Courier
- **Taille de police** : Petit, Normal, Grand

#### **Fonctionnalités Avancées**
- **Filigrane** : Ajouter un texte en filigrane (ex: "CONFIDENTIEL")
- **CSS personnalisé** : Code CSS avancé pour les utilisateurs experts

## 🚀 Utilisation

### Accès au Designer
1. Aller dans **Paramètres** → **Designer de Facture**
2. L'interface se divise en deux parties :
   - **Gauche** : Panneau de configuration
   - **Droite** : Aperçu en temps réel

### Configuration Rapide
1. **Choisir un thème prédéfini** dans les raccourcis rapides
2. **Ajuster les couleurs** avec les sélecteurs de couleur
3. **Modifier la mise en page** selon vos préférences
4. **Voir l'aperçu** se mettre à jour automatiquement

### Sauvegarde et Test
1. **Sauvegarder** les paramètres avec le bouton "Sauvegarder"
2. **Télécharger un PDF** de test avec "Télécharger PDF"
3. **Réinitialiser** aux valeurs par défaut si nécessaire

## 🛠️ Architecture Technique

### Base de Données
```sql
-- Nouveaux champs dans CompanySettings
invoiceTheme    VARCHAR DEFAULT 'modern'
primaryColor    VARCHAR DEFAULT '#2563EB'
secondaryColor  VARCHAR DEFAULT '#10B981'
accentColor     VARCHAR DEFAULT '#F59E0B'
textColor       VARCHAR DEFAULT '#1F2937'
backgroundColor VARCHAR DEFAULT '#FFFFFF'
headerStyle     VARCHAR DEFAULT 'gradient'
logoPosition    VARCHAR DEFAULT 'left'
logoSize        VARCHAR DEFAULT 'medium'
fontFamily      VARCHAR DEFAULT 'helvetica'
fontSize        VARCHAR DEFAULT 'normal'
borderRadius    VARCHAR DEFAULT 'rounded'
showWatermark   BOOLEAN DEFAULT false
watermarkText   VARCHAR
customCSS       TEXT
```

### API Endpoints
- **GET** `/api/settings/invoice-design` - Récupérer les paramètres
- **PUT** `/api/settings/invoice-design` - Sauvegarder les paramètres
- **DELETE** `/api/settings/invoice-design` - Réinitialiser
- **POST** `/api/invoices/preview` - Générer un aperçu PDF

### Composants
- `InvoiceDesigner.tsx` - Interface principale de configuration
- `InvoicePreview.tsx` - Aperçu en temps réel
- `pdf-generator.ts` - Générateur PDF avec support des designs

## 🎨 Exemples de Thèmes

### Thème Moderne
```typescript
{
  invoiceTheme: 'modern',
  primaryColor: '#2563EB',    // Bleu moderne
  secondaryColor: '#10B981',  // Vert émeraude
  accentColor: '#F59E0B',     // Orange
  headerStyle: 'gradient'
}
```

### Thème Classique
```typescript
{
  invoiceTheme: 'classic',
  primaryColor: '#1F2937',    // Gris foncé
  secondaryColor: '#374151',  // Gris moyen
  accentColor: '#DC2626',     // Rouge
  headerStyle: 'solid'
}
```

### Thème Minimal
```typescript
{
  invoiceTheme: 'minimal',
  primaryColor: '#6B7280',    // Gris clair
  secondaryColor: '#9CA3AF',  // Gris très clair
  accentColor: '#F59E0B',     // Orange
  headerStyle: 'minimal'
}
```

## 🔧 Personnalisation Avancée

### CSS Personnalisé
Les utilisateurs avancés peuvent ajouter du CSS personnalisé pour des modifications spécifiques :

```css
/* Exemple de CSS personnalisé */
.invoice-header {
  border-bottom: 3px solid #2563EB;
}

.invoice-table th {
  text-transform: uppercase;
  letter-spacing: 1px;
}

.invoice-total {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Filigrane
Le filigrane peut être utilisé pour :
- Marquer les documents comme "CONFIDENTIEL"
- Ajouter le statut "BROUILLON" ou "COPIE"
- Inclure le nom de l'entreprise en arrière-plan

## 📱 Responsive Design

L'aperçu s'adapte automatiquement :
- **Desktop** : Vue côte à côte (configuration + aperçu)
- **Tablet** : Vue empilée avec aperçu réduit
- **Mobile** : Interface optimisée pour écrans tactiles

## 🔒 Sécurité

- **Validation des couleurs** : Format hexadécimal obligatoire
- **Sanitisation du CSS** : Protection contre les injections
- **Permissions** : Seuls les propriétaires peuvent modifier
- **Sauvegarde automatique** : Prévention de la perte de données

## 🚀 Performances

- **Aperçu optimisé** : Rendu CSS rapide sans génération PDF
- **Lazy loading** : Chargement différé des composants lourds
- **Cache intelligent** : Mise en cache des paramètres fréquents
- **Compression** : Optimisation des assets et images

## 📊 Métriques

- **Temps de chargement** : < 2 secondes
- **Mise à jour aperçu** : < 100ms
- **Génération PDF** : < 5 secondes
- **Taille des paramètres** : < 2KB par configuration

## 🔄 Migration

Pour migrer vers le nouveau système :

```bash
# Exécuter la migration
node scripts/migrate-invoice-design.js

# Vérifier la migration
npm run dev
```

## 🎯 Roadmap

### Version Future
- [ ] **Templates prédéfinis** par secteur d'activité
- [ ] **Import/Export** de thèmes
- [ ] **Marketplace** de designs communautaires
- [ ] **A/B Testing** de designs
- [ ] **Analytics** sur l'engagement client
- [ ] **Multi-langues** pour les templates

## 📞 Support

Pour toute question ou problème :
1. Vérifier cette documentation
2. Consulter les logs de l'application
3. Tester avec les thèmes prédéfinis
4. Réinitialiser aux valeurs par défaut si nécessaire

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0  
**Compatibilité** : Next.js 15, React 19, jsPDF 2.5+
