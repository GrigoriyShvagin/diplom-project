# Friends Journey Platform — контекст проекта для ИИ / разработки

Документ описывает продукт, стек, структуру репозитория и типичные npm-скрипты. Его можно целиком вставить в другой чат как контекст.

---

## 1. Продукт

**Название (рабочее):** Friends Journey Platform

**Суть:** веб-платформа для **совместного планирования путешествий с друзьями**: карта и маршруты, расписание по дням, голосования, бюджет и разделение расходов, анализ группового чата и рекомендации через **OpenAI API** (без обязательного собственного ML на первом этапе).

**Целевая аудитория:** небольшие группы (2–6 человек), друзья, самостоятельные поездки.

**Не цель MVP:** мобильное приложение, оплаты внутри платформы, production-grade real-time «как Google Docs».

---

## 2. Стек (зафиксировано)

| Слой | Технологии |
|------|------------|
| **Frontend** | React, TypeScript |
| **Сборка SPA** | Vite (рекомендуется)
| **Стили / UI** | Tailwind CSS, shadcn/ui, clsx |
| **Карты** | Mapbox GL JS (или альтернатива: Google Maps JS API) |
| **Backend** | Node.js, TypeScript |
| **Фреймворк API** | NestJS (структура, модули) |
| **БД** | PostgreSQL |
| **ORM / миграции** | Prisma |
| **AI** | OpenAI API (чат-анализ, извлечение предпочтений, рекомендации, summary) |
| **Места (POI)** | Внешний API: Google Places / Mapbox Search / OSM; в БД — `provider` + `provider_place_id` + опциональный кэш выбранных мест |

**Инструменты для работы с БД (локально):** TablePlus.

**Облачный Postgres (для разработки):** Neon, Supabase и т.п.

---

## 3. Рекомендуемая структура репозитория (monorepo)

```
friends-journey-platform/
├── apps/
│   ├── web/                 # Frontend (Vite + React + TS)
│   └── api/                 # Backend (NestJS + TS)
├── packages/
│   └── shared/              # Общие типы, константы, zod-схемы (опционально)
├── prisma/                  # Если Prisma в корне — схема и миграции (или внутри apps/api)
├── docker-compose.yml       # Опционально: локальный Postgres
├── package.json             # Root workspaces (npm/pnpm/yarn)
├── pnpm-workspace.yaml      # Если pnpm
└── PROJECT-CONTEXT.md       # Этот файл
```

**Альтернатива:** два отдельных репозитория `friends-journey-web` и `friends-journey-api` — структура внутри `apps/web` и `apps/api` остаётся логикой той же.

### 3.1. Frontend — `apps/web/`

```
apps/web/
├── public/
├── src/
│   ├── app/                 # Провайдеры, роутер, layout
│   ├── pages/               # Страницы: landing, trips, trip/[id], ...
│   ├── features/            # Фичи: trip-map, itinerary, budget, votes, chat-import
│   ├── entities/            # UI-сущности: trip-card, place-marker (по желанию FSD)
│   ├── shared/
│   │   ├── api/             # Клиент к backend (fetch/axios + типы)
│   │   ├── ui/              # Общие компоненты
│   │   └── lib/             # Утилиты, форматирование дат
│   ├── assets/
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

### 3.2. Backend — `apps/api/`

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts        # NestJS
│   ├── modules/
│   │   ├── auth/            # JWT / session (когда появится)
│   │   ├── users/
│   │   ├── trips/
│   │   ├── places/          # Кэш POI, резолв external id
│   │   ├── itinerary/       # дни, schedule_items, routes
│   │   ├── votes/
│   │   ├── expenses/
│   │   └── ai/              # OpenAI: анализ чата, промпты, парсинг JSON
│   └── common/              # Guards, pipes, filters
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
└── package.json
```

---

## 4. NPM-скрипты — Frontend (`apps/web`)

Типичный набор для **Vite + React + TypeScript** (имена стандартные, `package.json`):

| Скрипт | Назначение |
|--------|------------|
| `dev` | Локальный dev-сервер с HMR (`vite`) |
| `build` | Production-сборка (`tsc -b` + `vite build`) |
| `preview` | Просмотр production-сборки локально |
| `lint` | ESLint по проекту |
| `lint:fix` | ESLint с автофиксом |
| `format` | Prettier (если подключён) |
| `typecheck` | `tsc --noEmit` без сборки |

**Пример блока в `package.json` (ориентир):**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 5. NPM-скрипты — Backend (`apps/api`)

Типичный набор для **NestJS**:

| Скрипт | Назначение |
|--------|------------|
| `build` | Компиляция TypeScript в `dist` |
| `start` | Запуск скомпилированного приложения |
| `start:dev` | Режим разработки с watch |
| `start:debug` | Отладка |
| `lint` | ESLint |
| `test` | Unit-тесты |
| `test:e2e` | E2E (опционально) |

**Prisma (часто в том же `package.json`):**

| Скрипт | Назначение |
|--------|------------|
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:push` | `prisma db push` (прототип без миграций) |
| `db:studio` | `prisma studio` |

**Пример объединённого блока:**

```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "test": "jest",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

---

## 6. Переменные окружения (черновик)

**Frontend (`apps/web/.env.example`):**

- `VITE_API_URL` — базовый URL backend API
- `VITE_MAPBOX_TOKEN` — токен Mapbox (если карта на клиенте)

**Backend (`apps/api/.env.example`):**

- `DATABASE_URL` — строка подключения PostgreSQL
- `PORT` — порт HTTP
- `OPENAI_API_KEY` — ключ OpenAI
- `JWT_SECRET` — когда появится авторизация
- `CORS_ORIGIN` — origin фронтенда для CORS

---

## 7. Модель данных (сущности БД)

Кратко, без SQL:

- `User`
- `Trip` (без массивов members/paths/schedule внутри одного JSON как единственного источника правды)
- `TripMember` (связь User ↔ Trip, роль)
- `TripDay`
- `ScheduleItem` (тип: место / еда / трансфер / свободное время / кастом; время начала/конца; ссылка на кэш места при необходимости)
- `TripRoute`, `RoutePoint`
- `PlaceCache` (опционально: кэш выбранных POI по `provider` + `provider_place_id`)
- `TripChat` / `ChatAnalysis` (сырые сообщения — опционально; результаты анализа — желательно)
- `Vote`, `VoteOption`, `VoteAnswer`
- `Expense`, `ExpenseSplit`

---

## 8. API (логические группы эндпоинтов)

- `POST/GET /users`, `GET /users/me` (после auth)
- `POST/GET /trips`, `GET/PATCH/DELETE /trips/:id`
- `GET/POST /trips/:id/members`
- `GET/POST /trips/:id/days`, `.../schedule-items`
- `GET/POST /trips/:id/routes`, `.../points`
- `GET/POST /trips/:id/votes`, `.../votes/:voteId/vote`
- `GET/POST /trips/:id/expenses`
- `POST /trips/:id/chat/analyze` — загрузка текста/файла чата → OpenAI → сохранение `ChatAnalysis`

Точные пути и DTO — по мере реализации.

---

## 9. MVP vs дальше

**MVP:**

- Создание поездки, участники
- Карта: точки, простой маршрут / порядок
- Расписание по дням
- Бюджет и split
- Голосования
- Анализ чата через OpenAI + сохранение инсайтов

**Позже:**

- WebSocket / presence / live-голосования
- Прогноз бюджета (ML на табличных данных)
- Углублённый ранжирующий рекомендатель

---

## 10. Как использовать этот файл в другой нейросети

Вставь в начало промпта:

> Ниже `PROJECT-CONTEXT.md` репозитория. Соблюдай стек и структуру папок. Пиши команды и код под `apps/web` и `apps/api`. Не предлагай смену стека без причины.

Затем вставь **весь этот файл** целиком.

---

*Файл сгенерирован для проекта дипломной работы; статья и критерии конференции в контекст не включены.*
