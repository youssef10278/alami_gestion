export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="text-center">
        <div className="relative">
          {/* Logo ou icône de chargement */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Texte de chargement */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Alami Gestion
          </h2>
          <p className="text-sm text-gray-600">
            Chargement en cours...
          </p>
          
          {/* Barre de progression animée */}
          <div className="mt-6 w-48 mx-auto">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
