export default function MobileTestPage() {
  return (
    <html>
      <head>
        <title>Test Mobile - Alami Gestion</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          body {
            margin: 0;
            padding: 20px;
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: #3b82f6;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          h1 {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          p {
            color: #6b7280;
            margin-bottom: 30px;
          }
          .button {
            display: block;
            width: 100%;
            padding: 12px 24px;
            margin-bottom: 10px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            text-align: center;
            box-sizing: border-box;
          }
          .button-primary {
            background: #3b82f6;
            color: white;
          }
          .button-outline {
            background: transparent;
            color: #3b82f6;
            border: 1px solid #3b82f6;
          }
          .status {
            margin-top: 20px;
            padding: 15px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            color: #166534;
          }
          .info {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="logo">A</div>
          
          <h1>Alami Gestion</h1>
          <p>Test Mobile - Version Simplifiée</p>
          
          <a href="/login-simple" className="button button-primary">
            Se connecter (Simple)
          </a>

          <a href="/login" className="button button-outline">
            Se connecter (React)
          </a>

          <a href="/debug" className="button button-outline">
            Page de diagnostic
          </a>

          <a href="/" className="button button-outline">
            Page d'accueil
          </a>
          
          <div className="status">
            ✅ Cette page fonctionne sans JavaScript<br/>
            ✅ Pas de dépendances complexes<br/>
            ✅ Compatible tous navigateurs mobiles
          </div>
          
          <div className="info">
            Si cette page s'affiche correctement, le problème vient des composants React complexes.
          </div>
        </div>
        
        <script>{`
          // Test JavaScript simple
          console.log('JavaScript fonctionne sur mobile');
          
          // Afficher des informations de debug
          setTimeout(() => {
            const info = document.createElement('div');
            info.style.cssText = 'position: fixed; bottom: 10px; left: 10px; right: 10px; background: #1f2937; color: white; padding: 10px; border-radius: 8px; font-size: 12px; z-index: 1000;';
            info.innerHTML = 'User Agent: ' + navigator.userAgent.substring(0, 50) + '...';
            document.body.appendChild(info);
          }, 1000);
        `}</script>
      </body>
    </html>
  )
}
