# Личный кабинет — быстрый старт

## Переменные окружения

Скопируйте `env.example` в `.env` и задайте:

- **DATABASE_URL** — строка подключения к PostgreSQL (NeonDB pooled URL)
- **DIRECT_URL** — прямой URL (без `-pooler`) для миграций
- **AUTH_SECRET** — секрет для Auth.js
- **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET** — для входа через Google

## Миграция

Примените миграцию для добавления поля `is_favorite` в таблицу `mestos`:

```powershell
npx prisma migrate deploy
```

Если `migrate deploy` падает с P1002 (advisory lock), выполните вручную в Neon SQL Editor содержимое:

`prisma/migrations/20250204000000_add_mesto_is_favorite/migration.sql`

## Регенерация Prisma Client

```powershell
npm run db:generate
```

## Запуск

```powershell
npm run dev
```

Откройте [http://localhost:3000/login](http://localhost:3000/login), войдите через Google, затем перейдите в [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Проверка функциональности

1. **Создание** — на странице «Мои места» нажмите «+ Новое место», заполните форму, сохраните.
2. **Редактирование** — на карточке места нажмите иконку карандаша, измените и сохраните.
3. **Удаление** — нажмите иконку корзины, подтвердите удаление.
4. **Публичность** — нажмите Globe/Lock на карточке, чтобы переключить public/private.
5. **Избранное** — нажмите звёздочку, место появится во вкладке «Избранное».
