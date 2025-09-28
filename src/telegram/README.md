# Telegram Service

Сервис для отправки фотографий в Telegram с использованием библиотеки Telegraf.

## Использование

### Базовое использование

```typescript
import { TelegramService } from './telegram.service';

// Инжектируем сервис
constructor(private readonly telegramService: TelegramService) {}

// Отправляем одну фотографию с описанием
await this.telegramService.sendPhotos(['/path/to/photo.jpg'], 'Описание фотографии');

// Отправляем несколько фотографий
await this.telegramService.sendPhotos([
  '/path/to/photo1.jpg',
  '/path/to/photo2.jpg',
  '/path/to/photo3.jpg'
], 'Пачка фотографий');
```

### Проверка соединения

```typescript
// Проверяем соединение с Telegram Bot API
const isConnected = await this.telegramService.checkConnection();
if (isConnected) {
  console.log('Соединение с Telegram установлено');
}

// Получаем информацию о боте
const botInfo = await this.telegramService.getBotInfo();
console.log(`Бот: @${botInfo.username}`);
```

## API

### Метод `sendPhotos(photos: string[], caption?: string): Promise<any>`

Отправляет пачку фотографий в Telegram с описанием.

**Параметры:**

- `photos` - массив путей к фотографиям (до 10 штук)
- `caption` - описание к фотографиям (опционально)

**Возвращает:** Promise с результатом отправки

**Особенности:**

- Если передана одна фотография, отправляется как обычное фото
- Если передано несколько фотографий, отправляется как медиа-группа
- Описание добавляется к первой фотографии в группе
- Автоматически фильтрует несуществующие файлы
- Максимум 10 фотографий за один вызов

### Метод `checkConnection(): Promise<boolean>`

Проверяет соединение с Telegram Bot API.

**Возвращает:** Promise с булевым значением (true если соединение успешно)

### Метод `getBotInfo(): Promise<any>`

Получает информацию о боте.

**Возвращает:** Promise с информацией о боте

## Конфигурация

Сервис использует следующие переменные окружения:

- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `TELEGRAM_CHAT_ID` - ID чата для отправки фотографий

## Обработка ошибок

Сервис включает подробное логирование и обработку ошибок:

- Проверка существования файлов
- Валидация количества фотографий
- Обработка ошибок API Telegram
- Логирование всех операций

## HTTP API (для тестирования)

Контроллер предоставляет HTTP эндпоинты для тестирования функциональности:

### Активация контроллера

Для активации контроллера раскомментируйте строки в `telegram.module.ts`:

```typescript
import { TelegramController } from './telegram.controller';

@Module({
  controllers: [TelegramController], // Раскомментировать для тестирования
  providers: [TelegramService],
  exports: [TelegramService],
})
```

### Эндпоинты

#### POST `/telegram/test-send-photos`

Отправляет тестовую фотографию с описанием.

```bash
curl -X POST http://localhost:3000/telegram/test-send-photos \
  -H "Content-Type: application/json" \
  -d '{"caption": "Тестовая фотография!"}'
```

#### POST `/telegram/send-photos`

Отправляет указанные фотографии.

```bash
curl -X POST http://localhost:3000/telegram/send-photos \
  -H "Content-Type: application/json" \
  -d '{
    "photos": ["/path/to/photo1.jpg", "/path/to/photo2.jpg"],
    "caption": "Описание фотографий"
  }'
```

#### POST `/telegram/check-connection`

Проверяет соединение с Telegram Bot API.

```bash
curl -X POST http://localhost:3000/telegram/check-connection \
  -H "Content-Type: application/json"
```

#### POST `/telegram/bot-info`

Получает информацию о боте.

```bash
curl -X POST http://localhost:3000/telegram/bot-info \
  -H "Content-Type: application/json"
```

## Примеры использования

### Отправка одной фотографии

```typescript
const result = await telegramService.sendPhotos(
  ['/path/to/single-photo.jpg'],
  'Красивая фотография',
);
```

### Отправка нескольких фотографий

```typescript
const photos = ['/path/to/photo1.jpg', '/path/to/photo2.jpg', '/path/to/photo3.jpg'];

const result = await telegramService.sendPhotos(photos, 'Серия фотографий из отпуска');
```

### Отправка без описания

```typescript
const result = await telegramService.sendPhotos(['/path/to/photo1.jpg', '/path/to/photo2.jpg']);
```
