-- Применить миграцию вручную в Neon SQL Editor (идемпотентно).
-- Если "npx prisma migrate deploy" падает с P1002 — скопируйте весь файл в Neon → SQL Editor → Run.

-- Удалить старую таблицу notes (без owner_id), если есть
DROP TABLE IF EXISTS "notes" CASCADE;

-- Enum (создаём только если нет)
DO $$ BEGIN
  CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Таблицы (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tags" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notes" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "owner_id" TEXT NOT NULL,
  CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mestos" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "description" TEXT,
  "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "owner_id" TEXT NOT NULL,
  "category_id" TEXT,
  CONSTRAINT "mestos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "_MestoToTag" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "votes" (
  "id" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_id" TEXT NOT NULL,
  "mesto_id" TEXT NOT NULL,
  CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- Индексы (IF NOT EXISTS)
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "mestos_owner_id_updated_at_idx" ON "mestos"("owner_id", "updated_at");
CREATE INDEX IF NOT EXISTS "mestos_visibility_created_at_idx" ON "mestos"("visibility", "created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "votes_user_id_mesto_id_key" ON "votes"("user_id", "mesto_id");
CREATE INDEX IF NOT EXISTS "votes_mesto_id_idx" ON "votes"("mesto_id");
CREATE INDEX IF NOT EXISTS "votes_user_id_idx" ON "votes"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "_MestoToTag_AB_unique" ON "_MestoToTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_MestoToTag_B_index" ON "_MestoToTag"("B");

-- Внешние ключи (добавляем только если ещё нет)
DO $$ BEGIN
  ALTER TABLE "notes" ADD CONSTRAINT "notes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "mestos" ADD CONSTRAINT "mestos_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "mestos" ADD CONSTRAINT "mestos_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_MestoToTag" ADD CONSTRAINT "_MestoToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "mestos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_MestoToTag" ADD CONSTRAINT "_MestoToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "votes" ADD CONSTRAINT "votes_mesto_id_fkey" FOREIGN KEY ("mesto_id") REFERENCES "mestos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Таблица миграций Prisma
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
SELECT gen_random_uuid()::text, '', now(), '20250131100000_init_schema_from_database_md', now(), 1
WHERE NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '20250131100000_init_schema_from_database_md');
