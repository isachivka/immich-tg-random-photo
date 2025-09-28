# Telegram Service

Service for sending photos to Telegram using the Telegraf library.

## Usage

### Basic Usage

```typescript
import { TelegramService } from './telegram.service';

// Inject service
constructor(private readonly telegramService: TelegramService) {}

// Send single photo with caption
await this.telegramService.sendPhotos(['/path/to/photo.jpg'], 'Photo description');

// Send multiple photos
await this.telegramService.sendPhotos([
  '/path/to/photo1.jpg',
  '/path/to/photo2.jpg',
  '/path/to/photo3.jpg'
], 'Photo batch');
```

### Connection Check

```typescript
// Check connection to Telegram Bot API
const isConnected = await this.telegramService.checkConnection();
if (isConnected) {
  console.log('Connected to Telegram');
}

// Get bot information
const botInfo = await this.telegramService.getBotInfo();
console.log(`Bot: @${botInfo.username}`);
```

## API

### Method `sendPhotos(photos: string[], caption?: string): Promise<any>`

Sends a batch of photos to Telegram with caption.

**Parameters:**

- `photos` - array of photo file paths (up to 10 photos)
- `caption` - caption for photos (optional)

**Returns:** Promise with send result

**Features:**

- If single photo provided, sends as regular photo
- If multiple photos provided, sends as media group
- Caption is added to first photo in group
- Automatically filters non-existent files
- Maximum 10 photos per call

### Method `checkConnection(): Promise<boolean>`

Checks connection to Telegram Bot API.

**Returns:** Promise with boolean value (true if connection successful)

### Method `getBotInfo(): Promise<any>`

Gets bot information.

**Returns:** Promise with bot information

## Configuration

Service uses the following environment variables:

- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - Chat ID for sending photos

## Error Handling

Service includes detailed logging and error handling:

- File existence check
- Photo count validation
- Telegram API error handling
- Operation logging

## HTTP API (for testing)

Controller provides HTTP endpoints for testing functionality:

### Controller Activation

To activate controller, uncomment lines in `telegram.module.ts`:

```typescript
import { TelegramController } from './telegram.controller';

@Module({
  controllers: [TelegramController], // Uncomment for testing
  providers: [TelegramService],
  exports: [TelegramService],
})
```

### Endpoints

#### POST `/telegram/test-send-photos`

Sends test photo with caption.

```bash
curl -X POST http://localhost:3000/telegram/test-send-photos \
  -H "Content-Type: application/json" \
  -d '{"caption": "Test photo!"}'
```

#### POST `/telegram/send-photos`

Sends specified photos.

```bash
curl -X POST http://localhost:3000/telegram/send-photos \
  -H "Content-Type: application/json" \
  -d '{
    "photos": ["/path/to/photo1.jpg", "/path/to/photo2.jpg"],
    "caption": "Photo descriptions"
  }'
```

#### POST `/telegram/check-connection`

Checks connection to Telegram Bot API.

```bash
curl -X POST http://localhost:3000/telegram/check-connection \
  -H "Content-Type: application/json"
```

#### POST `/telegram/bot-info`

Gets bot information.

```bash
curl -X POST http://localhost:3000/telegram/bot-info \
  -H "Content-Type: application/json"
```

## Usage Examples

### Send Single Photo

```typescript
const result = await telegramService.sendPhotos(['/path/to/single-photo.jpg'], 'Beautiful photo');
```

### Send Multiple Photos

```typescript
const photos = ['/path/to/photo1.jpg', '/path/to/photo2.jpg', '/path/to/photo3.jpg'];

const result = await telegramService.sendPhotos(photos, 'Vacation photo series');
```

### Send Without Caption

```typescript
const result = await telegramService.sendPhotos(['/path/to/photo1.jpg', '/path/to/photo2.jpg']);
```
