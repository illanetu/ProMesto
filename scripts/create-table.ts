import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTable() {
  try {
    console.log('Создание таблицы notes...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "notes" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
      );
    `
    
    console.log('✅ Таблица notes успешно создана!')
    
    // Проверка
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `
    console.log('Проверка: таблица существует:', tableExists)
    
  } catch (error) {
    console.error('❌ Ошибка при создании таблицы:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTable()
