export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#3b82f6',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          A
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '10px'
        }}>
          Alami Gestion
        </h1>

        <p style={{
          color: '#6b7280',
          marginBottom: '30px'
        }}>
          Application de gestion d'entreprise
        </p>

        <div style={{ marginBottom: '20px' }}>
          <a
            href="/login"
            style={{
              display: 'block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              marginBottom: '10px'
            }}
          >
            Se connecter
          </a>

          <a
            href="/debug"
            style={{
              display: 'block',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              padding: '8px 16px',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Page de diagnostic
          </a>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          Version mobile optimisée
        </p>
      </div>
    </div>
  )
}
