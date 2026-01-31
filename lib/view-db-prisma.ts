import { PrismaClient } from '@prisma/client'

const clientCache = new Map<string, PrismaClient>()

export type ViewDbEnv = 'local' | 'production'

function getDatabaseUrl(env: ViewDbEnv): string {
  if (env === 'local') {
    const url = process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL_LOCAL или DATABASE_URL не заданы')
    return url
  }
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL не задан')
  return url
}

export function getViewDbPrisma(env: ViewDbEnv): PrismaClient {
  const cached = clientCache.get(env)
  if (cached) return cached
  const url = getDatabaseUrl(env)
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  })
  clientCache.set(env, client)
  return client
}

export type TableKey = 'users' | 'notes' | 'categories' | 'mestos' | 'tags' | 'votes'
type PrismaModelName = 'user' | 'note' | 'category' | 'mesto' | 'tag' | 'vote'

export const TABLE_CONFIG: Record<
  TableKey,
  { label: string; model: PrismaModelName; idField: string; fields: { key: string; label: string; type: 'string' | 'number' | 'datetime' | 'enum'; required?: boolean; enumValues?: string[] }[] }
> = {
  users: {
    label: 'Пользователи',
    model: 'user',
    idField: 'id',
    fields: [
      { key: 'email', label: 'Email', type: 'string', required: true },
      { key: 'name', label: 'Имя', type: 'string' },
    ],
  },
  notes: {
    label: 'Заметки',
    model: 'note',
    idField: 'id',
    fields: [
      { key: 'title', label: 'Заголовок', type: 'string', required: true },
      { key: 'ownerId', label: 'ID владельца', type: 'string', required: true },
    ],
  },
  categories: {
    label: 'Категории',
    model: 'category',
    idField: 'id',
    fields: [{ key: 'category', label: 'Категория', type: 'string', required: true }],
  },
  mestos: {
    label: 'Места (Mesto)',
    model: 'mesto',
    idField: 'id',
    fields: [
      { key: 'title', label: 'Заголовок', type: 'string', required: true },
      { key: 'content', label: 'Содержимое', type: 'string', required: true },
      { key: 'description', label: 'Описание', type: 'string' },
      { key: 'visibility', label: 'Видимость', type: 'enum', enumValues: ['PRIVATE', 'PUBLIC'] },
      { key: 'ownerId', label: 'ID владельца', type: 'string', required: true },
      { key: 'categoryId', label: 'ID категории', type: 'string' },
    ],
  },
  tags: {
    label: 'Теги',
    model: 'tag',
    idField: 'id',
    fields: [{ key: 'name', label: 'Название', type: 'string', required: true }],
  },
  votes: {
    label: 'Голоса',
    model: 'vote',
    idField: 'id',
    fields: [
      { key: 'value', label: 'Значение', type: 'number' },
      { key: 'userId', label: 'ID пользователя', type: 'string', required: true },
      { key: 'mestoId', label: 'ID места', type: 'string', required: true },
    ],
  },
}

export const TABLE_KEYS: TableKey[] = ['users', 'notes', 'categories', 'mestos', 'tags', 'votes']
