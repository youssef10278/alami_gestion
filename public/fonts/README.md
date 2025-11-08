# Polices pour PDF avec Support Arabe

## Police Requise

Pour afficher correctement les caractères arabes dans les PDF, vous devez ajouter une police TTF qui supporte l'arabe.

### Option 1 : Amiri (Recommandée)

1. Télécharger Amiri depuis : https://fonts.google.com/specimen/Amiri
2. Télécharger le fichier `Amiri-Regular.ttf`
3. Placer le fichier dans ce dossier : `public/fonts/Amiri-Regular.ttf`

### Option 2 : Noto Sans Arabic

1. Télécharger depuis : https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
2. Télécharger le fichier `NotoSansArabic-Regular.ttf`
3. Placer le fichier dans ce dossier : `public/fonts/NotoSansArabic-Regular.ttf`

### Option 3 : Cairo

1. Télécharger depuis : https://fonts.google.com/specimen/Cairo
2. Télécharger le fichier `Cairo-Regular.ttf`
3. Placer le fichier dans ce dossier : `public/fonts/Cairo-Regular.ttf`

## Conversion en Base64

Après avoir téléchargé la police, vous devez la convertir en base64 :

### En ligne (Facile)

1. Aller sur : https://www.base64encode.org/
2. Uploader le fichier TTF
3. Cliquer sur "Encode"
4. Copier le résultat base64

### Avec Node.js

```bash
node -e "console.log(require('fs').readFileSync('public/fonts/Amiri-Regular.ttf', 'base64'))" > amiri-base64.txt
```

## Utilisation

Une fois la police convertie en base64, elle sera automatiquement chargée par le générateur PDF.

## Polices Actuellement Supportées

- ✅ Helvetica (par défaut) - Latin, accents français
- ⚠️ Arabe - Nécessite une police TTF personnalisée

## Liens Utiles

- Google Fonts : https://fonts.google.com/
- Base64 Encoder : https://www.base64encode.org/
- jsPDF Documentation : https://github.com/parallax/jsPDF

