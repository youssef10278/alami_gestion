import crypto from 'crypto'
import { BackupData, BackupMetadata } from './types/backup'

// Version de l'application (à synchroniser avec package.json)
export const APP_VERSION = '1.2.3'
export const BACKUP_FORMAT_VERSION = '1.0'

/**
 * Génère les métadonnées pour une sauvegarde
 */
export function generateBackupMetadata(totalRecords: number): BackupMetadata {
  return {
    version: BACKUP_FORMAT_VERSION,
    exported_at: new Date().toISOString(),
    app_version: APP_VERSION,
    total_records: totalRecords,
    compressed: false, // Sera mis à jour si compression appliquée
  }
}

/**
 * Calcule le checksum SHA256 d'un objet JSON
 */
export function calculateChecksum(data: any): string {
  const jsonString = JSON.stringify(data, null, 0) // Compact JSON
  return crypto.createHash('sha256').update(jsonString, 'utf8').digest('hex')
}

/**
 * Valide le format d'une sauvegarde
 */
export function validateBackupFormat(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Vérifier la structure de base
  if (!data.metadata) {
    errors.push('Métadonnées manquantes')
  } else {
    if (!data.metadata.version) errors.push('Version manquante dans les métadonnées')
    if (!data.metadata.exported_at) errors.push('Date d\'export manquante')
    if (!data.metadata.app_version) errors.push('Version de l\'app manquante')
  }

  if (!data.company) {
    errors.push('Données de l\'entreprise manquantes')
  }

  if (!data.data) {
    errors.push('Section de données manquante')
  } else {
    const requiredSections = ['products', 'customers', 'suppliers', 'standalone_sales', 'invoices', 'quotes']
    requiredSections.forEach(section => {
      if (!Array.isArray(data.data[section])) {
        errors.push(`Section ${section} manquante ou invalide`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Vérifie la compatibilité des versions
 */
export function isVersionCompatible(backupVersion: string): boolean {
  // Pour l'instant, on accepte seulement la version 1.0
  // Plus tard, on pourra ajouter la logique de migration
  return backupVersion === BACKUP_FORMAT_VERSION
}

/**
 * Génère un nom de fichier pour la sauvegarde
 */
export function generateBackupFilename(date?: Date): string {
  const backupDate = date || new Date()
  const dateStr = backupDate.toISOString().split('T')[0] // YYYY-MM-DD
  return `alami-backup-${dateStr}.json`
}

/**
 * Compte le nombre total d'enregistrements dans une sauvegarde
 */
export function countTotalRecords(backupData: Partial<BackupData>): number {
  let total = 0
  
  if (backupData.company?.users) {
    total += backupData.company.users.length
  }
  
  if (backupData.data) {
    total += backupData.data.products?.length || 0
    total += backupData.data.customers?.length || 0
    total += backupData.data.suppliers?.length || 0
    total += backupData.data.standalone_sales?.length || 0
    total += backupData.data.invoices?.length || 0
    total += backupData.data.quotes?.length || 0
    
    // Compter les items imbriqués
    backupData.data.customers?.forEach(customer => {
      total += customer.sales?.length || 0
      customer.sales?.forEach(sale => {
        total += sale.items?.length || 0
      })
    })
    
    backupData.data.suppliers?.forEach(supplier => {
      total += supplier.purchases?.length || 0
      supplier.purchases?.forEach(purchase => {
        total += purchase.items?.length || 0
      })
    })
    
    backupData.data.standalone_sales?.forEach(sale => {
      total += sale.items?.length || 0
    })
    
    backupData.data.invoices?.forEach(invoice => {
      total += invoice.items?.length || 0
    })
    
    backupData.data.quotes?.forEach(quote => {
      total += quote.items?.length || 0
    })
  }
  
  return total
}

/**
 * Nettoie les données sensibles avant export
 */
export function sanitizeDataForExport(data: any): any {
  // Créer une copie profonde
  const sanitized = JSON.parse(JSON.stringify(data))
  
  // Supprimer les mots de passe des utilisateurs
  if (sanitized.company?.users) {
    sanitized.company.users.forEach((user: any) => {
      delete user.password
      delete user.passwordHash
    })
  }
  
  return sanitized
}

/**
 * Valide l'intégrité d'un checksum
 */
export function validateChecksum(data: any, expectedChecksum: string): boolean {
  const calculatedChecksum = calculateChecksum(data)
  return calculatedChecksum === expectedChecksum
}

/**
 * Formate la taille d'un fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Estime la taille d'un objet JSON en bytes
 */
export function estimateJsonSize(data: any): number {
  const jsonString = JSON.stringify(data)
  return new Blob([jsonString]).size
}
