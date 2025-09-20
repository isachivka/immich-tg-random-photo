# Immich Telegram Random Photo MCP Server

MCP (Model Context Protocol) server that fetches random photos from your Immich server and sends them to Telegram.

## Features

- Fetches random photos from Immich API
- Sends photos to Telegram
- AI-powered filtering to avoid sending screenshots and document photos
- Configurable number of photos to send

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

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

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