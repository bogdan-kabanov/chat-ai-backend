# ChatGPT Backend

Express + TypeScript backend с архитектурой Controller → Service → Prisma ORM.

## Стек

- **Express** — HTTP-сервер
- **TypeScript** — типизация
- **Prisma** — ORM (SQLite)
- **OpenAI SDK** — интеграция с ChatGPT API

## Структура

```
src/
├── config/         # Конфигурация (env, prisma client)
├── controllers/    # Обработка HTTP-запросов
├── middlewares/    # Валидация, обработка ошибок
├── routes/        # Маршруты API
├── services/      # Бизнес-логика
└── index.ts       # Точка входа
```

## Установка и запуск

```bash
# Установить зависимости
npm install

# Сгенерировать Prisma Client
npx prisma generate

# Применить миграции
npx prisma migrate dev --name init

# Запустить в dev-режиме
npm run dev
```

## Переменные окружения

Создайте `.env` файл:

```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="file:./dev.db"
```

## API Endpoints

| Метод  | Путь                        | Описание                    |
|--------|-----------------------------|-----------------------------|
| POST   | /api/chat/send              | Отправить сообщение ChatGPT |
| GET    | /api/chat/conversations     | Получить все диалоги        |
| GET    | /api/chat/conversations/:id | Получить диалог по ID       |
| DELETE | /api/chat/conversations/:id | Удалить диалог              |
| GET    | /api/health                 | Health check                |
