## Что есть в системе (сущности):

Note - заметки
User — владелец записей о местах, автор, голосующий
Mesto — сама запись о месте (может быть приватным или публичным)
Tag — метки (многие-ко-многим с Mesto)
Vote — голос пользователя за публичную запись о месте (уникально: один пользователь → один голос на запись о месте)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) MestoVersion — версии промта (история изменений)

## Ключевые правила:

- Публичность — это свойство Mesto (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, MestoId) — уникальный индекс

## Схема базы данных
- Note: id, ownerId -> User, title, createdAt
- User: id (cuid), email unique, name optional, createdAt
- Mesto: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, MestoId -> Mesto, value int default 1, createdAt
- Category: id, category
- Ограничение: один пользователь может проголосовать за промт только один раз:
  UNIQUE(userId, MestoId)
- Индексы:
  Mesto(ownerId, updatedAt)
  Mesto(visibility, createdAt)
  Vote(MestoId)
  Vote(userId)
- onDelete: Cascade для связей
