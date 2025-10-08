/**
 * Gestionnaire global des ressources caméra
 * Évite les conflits entre scanner de code-barres et prise de photo
 */

export type CameraUser = 'barcode-scanner' | 'image-upload' | 'unknown'

class CameraManager {
  private currentUser: CameraUser | null = null
  private listeners: Set<(user: CameraUser | null) => void> = new Set()

  /**
   * Demander l'accès à la caméra
   */
  async requestCamera(user: CameraUser): Promise<{ success: boolean; error?: string }> {
    // Si la caméra est déjà utilisée par un autre composant
    if (this.currentUser && this.currentUser !== user) {
      // Demander la libération de la caméra
      this.requestRelease()
      
      // Attendre un peu pour la libération
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Vérifier si elle a été libérée
      if (this.currentUser && this.currentUser !== user) {
        return {
          success: false,
          error: `Caméra utilisée par ${this.currentUser}. Veuillez fermer l'autre utilisation.`
        }
      }
    }

    try {
      // Tester l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      // Fermer immédiatement le stream de test
      stream.getTracks().forEach(track => track.stop())
      
      // Marquer comme utilisée
      this.currentUser = user
      this.notifyListeners()
      
      return { success: true }
    } catch (error: any) {
      let errorMessage = 'Erreur d\'accès à la caméra'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans votre navigateur.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Caméra déjà utilisée par une autre application.'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Libérer la caméra
   */
  releaseCamera(user: CameraUser): void {
    if (this.currentUser === user) {
      this.currentUser = null
      this.notifyListeners()
    }
  }

  /**
   * Demander la libération de la caméra à l'utilisateur actuel
   */
  requestRelease(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('request-camera-close'))
    }
  }

  /**
   * Obtenir l'utilisateur actuel de la caméra
   */
  getCurrentUser(): CameraUser | null {
    return this.currentUser
  }

  /**
   * Vérifier si la caméra est disponible
   */
  isAvailable(): boolean {
    return this.currentUser === null
  }

  /**
   * Écouter les changements d'état de la caméra
   */
  onStateChange(callback: (user: CameraUser | null) => void): () => void {
    this.listeners.add(callback)
    
    // Retourner une fonction de nettoyage
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Notifier tous les listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentUser))
  }

  /**
   * Forcer la libération de la caméra (en cas d'urgence)
   */
  forceRelease(): void {
    this.currentUser = null
    this.notifyListeners()
    this.requestRelease()
  }
}

// Instance singleton
export const cameraManager = new CameraManager()

/**
 * Hook React pour utiliser le gestionnaire de caméra
 */
export function useCameraManager() {
  return {
    requestCamera: (user: CameraUser) => cameraManager.requestCamera(user),
    releaseCamera: (user: CameraUser) => cameraManager.releaseCamera(user),
    getCurrentUser: () => cameraManager.getCurrentUser(),
    isAvailable: () => cameraManager.isAvailable(),
    forceRelease: () => cameraManager.forceRelease(),
    onStateChange: (callback: (user: CameraUser | null) => void) => 
      cameraManager.onStateChange(callback)
  }
}

/**
 * Utilitaires pour diagnostiquer les problèmes de caméra
 */
export const cameraUtils = {
  /**
   * Vérifier si la caméra est supportée
   */
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  },

  /**
   * Vérifier si HTTPS est requis
   */
  isHttpsRequired(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.location.protocol !== 'https:' && 
           window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1'
  },

  /**
   * Obtenir des informations de diagnostic
   */
  async getDiagnostics(): Promise<{
    supported: boolean
    httpsOk: boolean
    permission: 'granted' | 'denied' | 'prompt' | 'unknown'
    currentUser: CameraUser | null
    available: boolean
  }> {
    const supported = this.isSupported()
    const httpsOk = !this.isHttpsRequired()
    const currentUser = cameraManager.getCurrentUser()
    const available = cameraManager.isAvailable()
    
    let permission: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown'
    
    if (supported) {
      try {
        // @ts-ignore - permissions API pas toujours disponible
        const result = await navigator.permissions?.query({ name: 'camera' })
        permission = result?.state || 'unknown'
      } catch {
        // Fallback: tester directement l'accès
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop())
          permission = 'granted'
        } catch (error: any) {
          permission = error.name === 'NotAllowedError' ? 'denied' : 'prompt'
        }
      }
    }
    
    return {
      supported,
      httpsOk,
      permission,
      currentUser,
      available
    }
  }
}
