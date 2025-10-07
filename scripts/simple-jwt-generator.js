const crypto = require('crypto')

console.log('🔐 VOTRE JWT SECRET :')
console.log('')

const jwtSecret = crypto.randomBytes(64).toString('hex')
console.log(jwtSecret)

console.log('')
console.log('📋 COPIEZ cette valeur dans Railway Variables :')
console.log(`JWT_SECRET=${jwtSecret}`)
console.log('')
console.log('✅ Cette chaîne est sécurisée et unique !')
