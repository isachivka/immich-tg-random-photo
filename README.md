# Immich Telegram Photo Bot

A NestJS application that automatically sends random photos from your Immich server to Telegram. Perfect for sharing memories and creating photo streams in your Telegram chats.

## Features

- Fetches random photos from Immich API
- Sends photos to Telegram via Telegraf bot API
- Image compression service with configurable settings
- Batch photo sending (up to 10 photos per message)
- Automatic cleanup of temporary files
- HTTP API for testing and manual triggers
- Docker support for easy deployment

## Installation

```bash
npm install
```

## Configuration

Set the following environment variables:

- `IMMICH_API_URL` - Your Immich server API URL
- `IMMICH_API_KEY` - Your Immich API key
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `TELEGRAM_CHAT_ID` - Target chat ID for sending photos

## Usage

### Development

```bash
# Start development server
npm run start:dev
```

### Production

```bash
# Build and start production server
npm run build
npm run start:prod
```

### HTTP API Endpoints

Once running, you can use these endpoints:

- `POST /final/send-random-photos` - Send 10 random photos to Telegram
- `POST /telegram/send-photos` - Send specific photos to Telegram
- `POST /telegram/test-send-photos` - Send test photo to Telegram
- `POST /telegram/check-connection` - Check Telegram bot connection

## Docker

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Documentation

For detailed information about the project architecture, development standards, and contribution guidelines, please refer to the [INSTRUCTIONS.md](./INSTRUCTIONS.md) file.
