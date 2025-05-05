import { prisma } from '@/lib/prisma'

async function testConnection() {
  try {
    // Test basic connection
    console.log('1. Testing database connection...')
    const test = await prisma.$queryRaw`SELECT 1`
    console.log('Basic connection successful:', test)

    // List available models
    console.log('\n2. Available Prisma models:')
    console.log(Object.keys(prisma).filter(key =>
      !key.startsWith('_') &&
      !key.startsWith('$')
    ))

    // Test establishment model specifically
    console.log('\n3. Testing establishment model...')
    const firstEstablishment = await prisma.establishment.findFirst()
    console.log('First establishment found:', firstEstablishment)

  } catch (error) {
    console.error('\nERROR:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
