export default function SimpleLoginPage() {
  return (
    <html>
      <head>
        <title>Connexion - Alami Gestion</title>
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
            text-align: center;
          }
          .subtitle {
            color: #6b7280;
            margin-bottom: 30px;
            text-align: center;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #374151;
          }
          input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
          }
          input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .button {
            width: 100%;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 15px;
          }
          .button:hover {
            background: #2563eb;
          }
          .button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }
          .error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
          }
          .success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
          }
          .link {
            text-align: center;
            margin-top: 20px;
          }
          .link a {
            color: #3b82f6;
            text-decoration: none;
            font-size: 14px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="logo">A</div>
          
          <h1>Connexion</h1>
          <p className="subtitle">Accédez à votre espace de gestion</p>
          
          <div id="message"></div>
          
          <form id="loginForm">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="votre@email.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="Votre mot de passe"
              />
            </div>
            
            <button type="submit" className="button" id="submitBtn">
              Se connecter
            </button>
          </form>
          
          <div className="link">
            <a href="/mobile-test">← Retour au test mobile</a>
          </div>
        </div>
        
        <script>{`
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const messageDiv = document.getElementById('message');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';
            messageDiv.innerHTML = '';
            
            try {
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });
              
              const data = await response.json();
              
              if (response.ok) {
                messageDiv.innerHTML = '<div class="success">✅ Connexion réussie ! Redirection...</div>';
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1000);
              } else {
                messageDiv.innerHTML = '<div class="error">❌ ' + (data.error || 'Erreur de connexion') + '</div>';
              }
            } catch (error) {
              messageDiv.innerHTML = '<div class="error">❌ Erreur de connexion. Vérifiez votre connexion internet.</div>';
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Se connecter';
            }
          });
        `}</script>
      </body>
    </html>
  )
}
