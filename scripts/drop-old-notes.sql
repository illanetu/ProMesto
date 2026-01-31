-- Выполните в Neon → SQL Editor ПЕРЕД первым применением миграций,
-- если у вас уже есть старая таблица "notes" (без owner_id).
-- Данные в "notes" будут удалены.

DROP TABLE IF EXISTS "notes";
