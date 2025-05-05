const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Only show the actual models, not internal properties
const models = Object.keys(prisma).filter(key =>
  !key.startsWith('_') &&
  !key.startsWith('$') &&
  typeof prisma[key] === 'object'
)

console.log('Available Prisma Models:', models)

// Test establishment access specifically
console.log('\nTesting establishment model:')
console.log('establishment exists:', prisma.establishment !== undefined)
console.log('establishment methods:', Object.keys(prisma.establishment || {}))

// Clean up
prisma.$disconnect()
