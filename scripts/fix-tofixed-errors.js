#!/usr/bin/env node

/**
 * Script pour corriger automatiquement les erreurs toFixed dans l'application
 * Remplace Number().toFixed() par safeToFixed() et ajoute les imports nécessaires
 */

const fs = require('fs');
const path = require('path');

// Fichiers à traiter
const filesToProcess = [
  'app/dashboard/suppliers/checks/page.tsx',
  'app/dashboard/suppliers/checks/analytics/page.tsx', 
  'app/dashboard/suppliers/[id]/page.tsx',
  'app/dashboard/credit/page.tsx',
  'app/dashboard/documents/page.tsx',
  'app/dashboard/sales/history/page.tsx',
  'app/dashboard/products/page.tsx'
];

// Patterns de remplacement
const replacements = [
  // Number(value).toFixed() -> safeToFixed(value)
  {
    pattern: /Number\(([^)]+)\)\.toFixed\((\d+)\)/g,
    replacement: 'safeToFixed($1, $2)'
  },
  // Number(value).toFixed() sans paramètres -> safeToFixed(value)
  {
    pattern: /Number\(([^)]+)\)\.toFixed\(\)/g,
    replacement: 'safeToFixed($1)'
  },
  // Number(value) -> safeNumber(value) (dans certains contextes)
  {
    pattern: /Number\(([^)]+)\)(?!\s*\.)/g,
    replacement: 'safeNumber($1)'
  }
];

// Import à ajouter
const importStatement = "import { safeToFixed, safeNumber } from '@/lib/utils'";

function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Vérifier si l'import existe déjà
    if (content.includes("from '@/lib/utils'")) {
      console.log(`✅ Import déjà présent dans ${filePath}`);
    } else {
      // Ajouter l'import après les autres imports
      const importRegex = /(import.*from.*['"][^'"]+['"];?\s*\n)+/;
      const match = content.match(importRegex);
      
      if (match) {
        content = content.replace(match[0], match[0] + importStatement + '\n');
        modified = true;
      } else {
        // Ajouter au début du fichier
        content = importStatement + '\n\n' + content;
        modified = true;
      }
    }

    // Appliquer les remplacements
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fichier modifié: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Aucune modification nécessaire: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Correction automatique des erreurs toFixed...\n');
  
  let processedCount = 0;
  let modifiedCount = 0;

  filesToProcess.forEach(filePath => {
    processedCount++;
    if (processFile(filePath)) {
      modifiedCount++;
    }
  });

  console.log(`\n📊 Résumé:`);
  console.log(`   Fichiers traités: ${processedCount}`);
  console.log(`   Fichiers modifiés: ${modifiedCount}`);
  
  if (modifiedCount > 0) {
    console.log(`\n✅ Correction terminée ! N'oubliez pas de tester l'application.`);
  } else {
    console.log(`\nℹ️  Aucune correction nécessaire.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, replacements };
