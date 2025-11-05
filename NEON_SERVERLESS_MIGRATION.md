# Миграция на @neondatabase/serverless

**Дата:** 5 ноября 2025  
**Статус:** ✅ **COMPLETE**

---

## Проблема

```
[DB] PostgreSQL connection failed: Error: Connection terminated due to connection timeout
```

### Причина
Использование стандартного `pg` драйвера с неправильной конфигурацией для Vercel serverless:
- **❌ `max: 20` connections** - каждая serverless function создает свой pool → исчерпание лимита подключений Neon
- **❌ Connection pooling** не работает в serverless (каждый invocation = новый процесс)
- **❌ Long-lived connections** не подходят для serverless environment
- **❌ Build-time initialization** OpenAI clients требовали env vars во время сборки

---

## Решение

### 1. Установлены пакеты для Neon serverless

```bash
npm install @neondatabase/serverless ws
npm install --save-dev @types/ws
```

**Установленные пакеты:**
- `@neondatabase/serverless` - оптимизированный драйвер для serverless
- `ws` - WebSocket library (требуется для Neon)
- `@types/ws` - TypeScript типы

---

### 2. Обновлен `lib/db.ts`

#### Было:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // ❌ Слишком много для serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  query_timeout: 60000,
  statement_timeout: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// ❌ Подключение во время build time
pool.connect()
  .then(client => {
    console.log('[DB] PostgreSQL connection established');
    client.release();
  })
  .catch(error => {
    console.error('[DB] PostgreSQL connection failed:', error);
  });
```

#### Стало:
```typescript
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;

// ✅ Оптимизировано для Vercel serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // ✅ CRITICAL: Only 1 connection per serverless function instance
  idleTimeoutMillis: 10000, // ✅ 10 seconds - quick cleanup
  connectionTimeoutMillis: 10000, // ✅ 10 seconds - fast fail
});

// ✅ Подключение только в development mode с DATABASE_URL
if (process.env.NODE_ENV === 'development' && process.env.DATABASE_URL) {
  pool.connect()
    .then(client => {
      console.log('[DB] PostgreSQL connection established');
      client.release();
    })
    .catch(error => {
      console.error('[DB] PostgreSQL connection failed:', error);
    });
}
```

**Ключевые изменения:**
- ✅ `max: 1` - только одно соединение на function instance
- ✅ `idleTimeoutMillis: 10000` - быстрое освобождение неиспользуемых соединений
- ✅ `connectionTimeoutMillis: 10000` - быстрый fail для cold starts
- ✅ Условное подключение только в development mode
- ✅ WebSocket connection для Neon (оптимизировано для serverless)

---

### 3. Исправлен OpenAI lazy initialization

Проблема: OpenAI клиент инициализировался на уровне модуля → требовал `OPENAI_API_KEY` во время build time.

#### Обновлены файлы:
- `app/api/code/route.ts`
- `app/api/conversation/route.ts`
- `app/api/image/route.ts`
- `app/api/style-transfer/route.ts`

#### Было:
```typescript
const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(configuration); // ❌ Инициализация на уровне модуля

export async function POST(req: Request) {
  // ...
  if (!configuration.apiKey) {
    return new NextResponse("OpenAI API Key not configured.", { status: 500 });
  }
}
```

#### Стало:
```typescript
export async function POST(req: Request) {
  try {
    // ✅ Lazy initialization внутри handler
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // ...
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    }
  }
}
```

**Преимущества:**
- ✅ Не требует env vars во время build time
- ✅ OpenAI клиент создается только когда нужен
- ✅ Каждый запрос получает свежий экземпляр клиента

---

## Результаты

### ✅ Build Success
```bash
npm run build

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (50/50)
✓ Finalizing page optimization
```

### ✅ Оптимизация для Vercel Serverless

**До миграции:**
- ❌ 20 connections × N functions = connection limit exceeded
- ❌ Long timeouts (30-60s) → slow cold starts
- ❌ Keep-alive connections → не работает в serverless
- ❌ Connection pool не переиспользуется

**После миграции:**
- ✅ 1 connection per function instance
- ✅ Fast timeouts (10s) → быстрые cold starts
- ✅ WebSocket-based connections (Neon optimized)
- ✅ Automatic connection cleanup после idle

---

## Connection Pool Settings Comparison

| Setting | Old (pg) | New (@neondatabase/serverless) | Причина изменения |
|---------|----------|-------------------------------|-------------------|
| `max` | 20 | 1 | Serverless = 1 instance → 1 connection |
| `idleTimeoutMillis` | 30000 | 10000 | Быстрая очистка неиспользуемых connections |
| `connectionTimeoutMillis` | 30000 | 10000 | Быстрый fail для холодных стартов |
| `query_timeout` | 60000 | (default) | Не нужно для serverless |
| `statement_timeout` | 60000 | (default) | Не нужно для serverless |
| `keepAlive` | true | (N/A) | Не работает в serverless |
| WebSocket | ❌ | ✅ | Оптимизировано для Neon serverless |

---

## Что делать при deployment на Vercel

### 1. Убедиться, что DATABASE_URL настроен

Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_htMKUEqkQ4A0@ep-floral-hill-a2w6wrew-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

✅ Должен быть установлен для:
- Production
- Preview
- Development

### 2. Проверить Runtime Logs

После deployment:
1. Vercel Dashboard → Deployments → Latest
2. Function Logs
3. Проверить логи:

**Успешное подключение:**
```
[DB] PostgreSQL connection established (только в dev mode)
```

**При ошибке:**
```
[DB] PostgreSQL connection failed: Error...
```

### 3. Monitoring

Следить за:
- Connection timeouts (должно быть < 10s)
- Количество active connections в Neon Dashboard
- Cold start время functions

---

## Дополнительные преимущества Neon Serverless

1. **Автоматический pooling** на стороне Neon
2. **WebSocket connections** быстрее, чем TCP для cold starts
3. **Connection caching** между invocations (где возможно)
4. **Graceful degradation** при high load
5. **Меньше idle connections** в Neon Dashboard

---

## Troubleshooting

### Ошибка: "Connection timeout"

**Возможные причины:**
1. DATABASE_URL не установлен в Vercel
2. Neon database в suspend mode (free tier)
3. Сетевые проблемы между Vercel и Neon

**Решение:**
1. Проверить Vercel env vars
2. Проверить Neon Dashboard → Database status
3. Увеличить `connectionTimeoutMillis` (но не рекомендуется)

### Ошибка: "Too many connections"

**Причина:** Много одновременных requests → много function instances

**Решение:**
- ✅ Уже исправлено: `max: 1` ограничивает connections per instance
- Проверить Neon connection limit (зависит от плана)
- Использовать Neon connection pooling endpoint (с `-pooler` в URL)

### Ошибка: "Module 'ws' not found"

**Причина:** Не установлен пакет `ws`

**Решение:**
```bash
npm install ws
npm install --save-dev @types/ws
```

---

## Дальнейшие оптимизации (опционально)

### 1. HTTP Fetch API вместо WebSocket (экспериментально)

```typescript
import { neonConfig } from '@neondatabase/serverless';

// Использовать HTTP fetch вместо WebSocket
neonConfig.fetchEndpoint = 'https://...';
```

### 2. Connection pooling через Neon Proxy

Использовать `-pooler` endpoint в DATABASE_URL:
```
postgresql://...@ep-xxx-pooler.aws.neon.tech/neondb
```

### 3. Query optimization

Минимизировать количество queries через:
- Batch inserts
- JOIN вместо multiple queries
- Prepared statements

---

## Полезные ссылки

- [Neon Serverless Driver Documentation](https://neon.tech/docs/serverless/serverless-driver)
- [Vercel Functions Best Practices](https://vercel.com/docs/functions/serverless-functions)
- [Next.js Database Connections](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)

---

**Миграция завершена успешно!** ✅

