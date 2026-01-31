import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkConnection() {
  try {
    console.log('Проверка подключения к базе данных...')
    
    // Простой запрос для проверки подключения
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Подключение успешно!', result)
    
    // Проверка существования таблицы
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `
    console.log('Таблица notes существует:', tableExists)
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkConnection()
