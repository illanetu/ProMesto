-- Заполнение БД тестовыми данными для Neon (SQL Editor).
-- Выполните весь скрипт целиком в Neon Console → SQL Editor → Run.
-- Требование: миграции уже применены (таблицы users, notes, mestos, votes и т.д. существуют).
-- Удаляет существующего тестового пользователя seed@example.com и создаёт заново:
--   пользователь, 3 заметки, категория, 2 места (Mesto), 2 тега, связи место–тег, 1 голос.

-- 1. Удалить тестового пользователя (каскадно удалятся его заметки, места, голоса и связи _MestoToTag)
DELETE FROM users WHERE email = 'seed@example.com';

-- 2. Пользователь
INSERT INTO users (id, email, name)
VALUES ('seed-user-1', 'seed@example.com', 'Seed пользователь');

-- 3. Заметки
INSERT INTO notes (id, title, owner_id)
VALUES
  ('seed-note-1', 'Первая заметка', 'seed-user-1'),
  ('seed-note-2', 'Вторая заметка', 'seed-user-1'),
  ('seed-note-3', 'Третья заметка', 'seed-user-1');

-- 4. Категория
INSERT INTO categories (id, category)
VALUES ('seed-cat-1', 'Тестовая категория')
ON CONFLICT (id) DO NOTHING;

-- 5. Места (Mesto)
INSERT INTO mestos (id, title, content, description, visibility, owner_id, category_id)
VALUES
  ('seed-mesto-1', 'Тестовое место 1', 'Описание первого места.', NULL, 'PUBLIC', 'seed-user-1', 'seed-cat-1'),
  ('seed-mesto-2', 'Тестовое место 2', 'Второе место.', NULL, 'PRIVATE', 'seed-user-1', NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. Теги
INSERT INTO tags (id, name)
VALUES
  ('seed-tag-1', 'тест'),
  ('seed-tag-2', 'демо')
ON CONFLICT (id) DO NOTHING;

-- 7. Связь мест и тегов (многие-ко-многим)
INSERT INTO "_MestoToTag" ("A", "B")
VALUES
  ('seed-mesto-1', 'seed-tag-1'),
  ('seed-mesto-1', 'seed-tag-2')
ON CONFLICT ("A", "B") DO NOTHING;

-- 8. Голос пользователя за публичное место
INSERT INTO votes (id, user_id, mesto_id, value)
VALUES ('seed-vote-1', 'seed-user-1', 'seed-mesto-1', 1)
ON CONFLICT (id) DO NOTHING;
