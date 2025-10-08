export type CameraUser = 'barcode-scanner' | 'image-upload' | 'unknown'

interface CameraState {
  currentUser: CameraUser | null
  stream: MediaStream | null
  isRequesting: boolean
}

class CameraManagerV2 {
  private state: CameraState = {
    currentUser: null,
    stream: null,
    isRequesting: false
  }

  private listeners: Set<(state: CameraState) => void> = new Set()

  async requestCamera(user: CameraUser): Promise<{ success: boolean; error?: string; stream?: MediaStream }> {
    // Si déjà en cours de demande, attendre
    if (this.state.isRequesting) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (this.state.isRequesting) {
        return { success: false, error: 'Caméra en cours d\'utilisation' }
      }
    }

    // Si caméra utilisée par un autre composant
    if (this.state.currentUser && this.state.currentUser !== user) {
      // Demander la libération
      this.requestRelease()
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Si toujours occupée
      if (this.state.currentUser && this.state.currentUser !== user) {
        return {
          success: false,
          error: `Caméra utilisée par ${this.state.currentUser}. Fermez l'autre utilisation.`
        }
      }
    }

    // Si déjà utilisée par le même composant
    if (this.state.currentUser === user && this.state.stream) {
      return { success: true, stream: this.state.stream }
    }

    try {
      this.state.isRequesting = true
      this.notifyListeners()

      // Vérifier support caméra
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Caméra non supportée par ce navigateur')
      }

      // Vérifier HTTPS (sauf localhost)
      if (typeof window !== 'undefined') {
        const isHttpsRequired = window.location.protocol !== 'https:' && 
                               window.location.hostname !== 'localhost' && 
                               window.location.hostname !== '127.0.0.1'
        
        if (isHttpsRequired) {
          throw new Error('HTTPS requis pour accéder à la caméra')
        }
      }

      // Demander accès caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      })

      // Mettre à jour l'état
      this.state.currentUser = user
      this.state.stream = stream
      this.state.isRequesting = false
      this.notifyListeners()

      return { success: true, stream }

    } catch (error: any) {
      this.state.isRequesting = false
      this.notifyListeners()

      let errorMessage = 'Erreur d\'accès à la caméra'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé. Autorisez l\'accès dans votre navigateur.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Caméra déjà utilisée par une autre application.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Caméra ne supporte pas les paramètres demandés.'
      } else if (error.message) {
        errorMessage = error.message
      }

      return { success: false, error: errorMessage }
    }
  }

  releaseCamera(user: CameraUser): void {
    if (this.state.currentUser === user) {
      // Arrêter le flux
      if (this.state.stream) {
        this.state.stream.getTracks().forEach(track => track.stop())
      }

      // Réinitialiser l'état
      this.state.currentUser = null
      this.state.stream = null
      this.state.isRequesting = false
      
      this.notifyListeners()

      // Notifier la libération
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('camera-released', { detail: { user } }))
      }
    }
  }

  forceRelease(): void {
    // Arrêter le flux
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop())
    }

    const previousUser = this.state.currentUser

    // Réinitialiser l'état
    this.state.currentUser = null
    this.state.stream = null
    this.state.isRequesting = false
    
    this.notifyListeners()

    // Demander la fermeture
    this.requestRelease()

    // Notifier la libération forcée
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('camera-force-released', { 
        detail: { previousUser } 
      }))
    }
  }

  private requestRelease(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('request-camera-close'))
    }
  }

  getCurrentUser(): CameraUser | null {
    return this.state.currentUser
  }

  isAvailable(): boolean {
    return this.state.currentUser === null && !this.state.isRequesting
  }

  getState(): CameraState {
    return { ...this.state }
  }

  onStateChange(callback: (state: CameraState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback({ ...this.state }))
  }
}

// Instance singleton
export const cameraManagerV2 = new CameraManagerV2()

// Hook React
export function useCameraManagerV2() {
  return {
    requestCamera: (user: CameraUser) => cameraManagerV2.requestCamera(user),
    releaseCamera: (user: CameraUser) => cameraManagerV2.releaseCamera(user),
    forceRelease: () => cameraManagerV2.forceRelease(),
    getCurrentUser: () => cameraManagerV2.getCurrentUser(),
    isAvailable: () => cameraManagerV2.isAvailable(),
    getState: () => cameraManagerV2.getState(),
    onStateChange: (callback: (state: any) => void) => 
      cameraManagerV2.onStateChange(callback)
  }
}

// Utilitaires caméra
export const cameraUtilsV2 = {
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  },

  isHttpsRequired(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.location.protocol !== 'https:' && 
           window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1'
  },

  async checkPermissions(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    if (!this.isSupported()) return 'unknown'

    try {
      // Essayer avec l'API permissions si disponible
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
        return result.state as 'granted' | 'denied' | 'prompt'
      }

      // Fallback: essayer d'accéder à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return 'granted'
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        return 'denied'
      }
      return 'prompt'
    }
  },

  async getDiagnostics() {
    const supported = this.isSupported()
    const httpsOk = !this.isHttpsRequired()
    const permission = await this.checkPermissions()
    const state = cameraManagerV2.getState()

    return {
      supported,
      httpsOk,
      permission,
      currentUser: state.currentUser,
      available: cameraManagerV2.isAvailable(),
      isRequesting: state.isRequesting,
      hasStream: !!state.stream
    }
  }
}
