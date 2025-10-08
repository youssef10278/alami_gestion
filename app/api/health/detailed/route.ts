import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    checks: {}
  }

  try {
    // 1. Vérifier la connexion à la base de données
    checks.checks.database = { status: 'checking' }
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.checks.database = { status: 'ok', message: 'Connexion réussie' }
    } catch (error: any) {
      checks.checks.database = { 
        status: 'error', 
        message: 'Erreur de connexion',
        error: error.message 
      }
    }

    // 2. Vérifier l'authentification
    checks.checks.auth = { status: 'checking' }
    try {
      const session = await getSession()
      checks.checks.auth = { 
        status: session ? 'ok' : 'no_session',
        message: session ? `Session active (${session.role})` : 'Aucune session',
        userId: session?.userId,
        role: session?.role
      }
    } catch (error: any) {
      checks.checks.auth = { 
        status: 'error', 
        message: 'Erreur d\'authentification',
        error: error.message 
      }
    }

    // 3. Vérifier les paramètres de l'entreprise
    checks.checks.companySettings = { status: 'checking' }
    try {
      const settings = await prisma.companySettings.findFirst()
      checks.checks.companySettings = { 
        status: settings ? 'ok' : 'missing',
        message: settings ? 'Paramètres trouvés' : 'Aucun paramètre',
        id: settings?.id,
        companyName: settings?.companyName
      }
    } catch (error: any) {
      checks.checks.companySettings = { 
        status: 'error', 
        message: 'Erreur de récupération',
        error: error.message 
      }
    }

    // 4. Compter les utilisateurs
    checks.checks.users = { status: 'checking' }
    try {
      const userCount = await prisma.user.count()
      const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } })
      checks.checks.users = { 
        status: 'ok',
        total: userCount,
        owners: ownerCount,
        message: `${userCount} utilisateur(s), ${ownerCount} propriétaire(s)`
      }
    } catch (error: any) {
      checks.checks.users = { 
        status: 'error', 
        message: 'Erreur de comptage',
        error: error.message 
      }
    }

    // 5. Compter les produits
    checks.checks.products = { status: 'checking' }
    try {
      const productCount = await prisma.product.count()
      checks.checks.products = { 
        status: 'ok',
        total: productCount,
        message: `${productCount} produit(s)`
      }
    } catch (error: any) {
      checks.checks.products = { 
        status: 'error', 
        message: 'Erreur de comptage',
        error: error.message 
      }
    }

    // 6. Compter les ventes
    checks.checks.sales = { status: 'checking' }
    try {
      const salesCount = await prisma.sale.count()
      checks.checks.sales = { 
        status: 'ok',
        total: salesCount,
        message: `${salesCount} vente(s)`
      }
    } catch (error: any) {
      checks.checks.sales = { 
        status: 'error', 
        message: 'Erreur de comptage',
        error: error.message 
      }
    }

    // Déterminer le statut global
    const hasErrors = Object.values(checks.checks).some((check: any) => check.status === 'error')
    const hasMissing = Object.values(checks.checks).some((check: any) => check.status === 'missing')
    
    if (hasErrors) {
      checks.status = 'error'
    } else if (hasMissing) {
      checks.status = 'warning'
    } else {
      checks.status = 'ok'
    }

    return NextResponse.json(checks)
  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: 'Erreur lors du diagnostic',
      error: error.message,
      stack: error.stack,
      checks
    }, { status: 500 })
  }
}

