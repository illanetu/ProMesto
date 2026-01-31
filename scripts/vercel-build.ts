// Скрипт для автоматического создания таблицы при деплое на Vercel
// Можно использовать в Build Command на Vercel, но лучше создать таблицу вручную через Neon Dashboard

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('Проверка и создание таблицы notes...')
    
    // Проверка существования таблицы
    const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      ) as exists;
    `
    
    if (!tableExists[0]?.exists) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "notes" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
        );
      `
      console.log('✅ Таблица notes создана!')
    } else {
      console.log('✅ Таблица notes уже существует')
    }
    
  } catch (error) {
    console.error('⚠️ Ошибка при создании таблицы (возможно, таблица уже существует):', error)
    // Не прерываем сборку, если таблица уже существует
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
