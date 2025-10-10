'use client'

import { useState, useEffect } from 'react'

interface BackupStatus {
  lastBackupDate: string | null
  isFirstOpenToday: boolean
  backupEnabled: boolean
}

/**
 * Hook pour gérer le suivi des sauvegardes automatiques
 * Utilisé pour la Phase 2 - Sauvegarde automatique quotidienne
 */
export function useBackupTracker() {
  const [status, setStatus] = useState<BackupStatus>({
    lastBackupDate: null,
    isFirstOpenToday: false,
    backupEnabled: true
  })

  // Clé pour localStorage
  const BACKUP_STORAGE_KEY = 'alami-backup-tracker'
  const BACKUP_ENABLED_KEY = 'alami-backup-enabled'

  /**
   * Vérifie si c'est la première ouverture du jour
   */
  const isFirstOpenToday = (): boolean => {
    if (typeof window === 'undefined') return false
    
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const lastBackupDate = localStorage.getItem(BACKUP_STORAGE_KEY)
    
    return lastBackupDate !== today
  }

  /**
   * Marque la sauvegarde comme effectuée pour aujourd'hui
   */
  const markBackupDone = (): void => {
    if (typeof window === 'undefined') return
    
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(BACKUP_STORAGE_KEY, today)
    
    setStatus(prev => ({
      ...prev,
      lastBackupDate: today,
      isFirstOpenToday: false
    }))
  }

  /**
   * Active ou désactive la sauvegarde automatique
   */
  const setBackupEnabled = (enabled: boolean): void => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(BACKUP_ENABLED_KEY, enabled.toString())
    setStatus(prev => ({
      ...prev,
      backupEnabled: enabled
    }))
  }

  /**
   * Récupère la dernière date de sauvegarde
   */
  const getLastBackupDate = (): Date | null => {
    if (typeof window === 'undefined') return null
    
    const lastBackupDate = localStorage.getItem(BACKUP_STORAGE_KEY)
    return lastBackupDate ? new Date(lastBackupDate + 'T00:00:00') : null
  }

  /**
   * Vérifie si la sauvegarde automatique est activée
   */
  const isBackupEnabled = (): boolean => {
    if (typeof window === 'undefined') return true
    
    const enabled = localStorage.getItem(BACKUP_ENABLED_KEY)
    return enabled !== 'false' // Par défaut activé
  }

  /**
   * Réinitialise le tracker (pour tests ou debug)
   */
  const resetTracker = (): void => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(BACKUP_STORAGE_KEY)
    setStatus(prev => ({
      ...prev,
      lastBackupDate: null,
      isFirstOpenToday: true
    }))
  }

  /**
   * Obtient des statistiques sur les sauvegardes
   */
  const getBackupStats = () => {
    const lastDate = getLastBackupDate()
    const daysSinceLastBackup = lastDate 
      ? Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      lastBackupDate: lastDate,
      daysSinceLastBackup,
      isOverdue: daysSinceLastBackup !== null && daysSinceLastBackup > 1,
      nextBackupDue: isFirstOpenToday() ? 'Maintenant' : 'Demain'
    }
  }

  // Initialisation au montage du composant
  useEffect(() => {
    if (typeof window === 'undefined') return

    const lastBackupDate = localStorage.getItem(BACKUP_STORAGE_KEY)
    const backupEnabled = isBackupEnabled()
    const firstOpenToday = isFirstOpenToday()

    setStatus({
      lastBackupDate,
      isFirstOpenToday: firstOpenToday,
      backupEnabled
    })

    // Log pour debug (Phase 2)
    console.log('🔍 Backup Tracker Status:', {
      lastBackupDate,
      isFirstOpenToday: firstOpenToday,
      backupEnabled,
      today: new Date().toISOString().split('T')[0]
    })
  }, [])

  return {
    // État actuel
    status,
    
    // Fonctions de vérification
    isFirstOpenToday: status.isFirstOpenToday,
    isBackupEnabled: status.backupEnabled,
    
    // Fonctions d'action
    markBackupDone,
    setBackupEnabled,
    resetTracker,
    
    // Utilitaires
    getLastBackupDate,
    getBackupStats
  }
}

/**
 * Hook simplifié pour vérifier si une sauvegarde est nécessaire
 * Utilisé dans le layout principal pour déclencher la sauvegarde automatique
 */
export function useAutoBackupCheck() {
  const { isFirstOpenToday, isBackupEnabled, markBackupDone } = useBackupTracker()
  
  /**
   * Vérifie si une sauvegarde automatique doit être déclenchée
   */
  const shouldTriggerBackup = (): boolean => {
    return isBackupEnabled && isFirstOpenToday
  }

  /**
   * Déclenche la sauvegarde automatique
   * Retourne une promesse qui se résout avec le succès/échec
   */
  const triggerAutoBackup = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔄 Déclenchement sauvegarde automatique...')
      
      // Appel à l'API d'export
      const response = await fetch('/api/backup/export?compress=true&format=gzip')
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export automatique')
      }

      // Télécharger le fichier automatiquement
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const today = new Date().toISOString().split('T')[0]
      a.download = `alami-backup-${today}.json.gz`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Marquer comme fait
      markBackupDone()
      
      console.log('✅ Sauvegarde automatique terminée')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde automatique:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  return {
    shouldTriggerBackup,
    triggerAutoBackup,
    isFirstOpenToday,
    isBackupEnabled
  }
}

/**
 * Types pour TypeScript
 */
export type { BackupStatus }
