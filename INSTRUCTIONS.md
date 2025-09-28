# Immich Telegram Photo Bot - Development Instructions

## Project Overview

This NestJS application automatically fetches random photos from an Immich server and sends them to Telegram. The application includes image compression, batch sending, and HTTP API for testing and manual triggers.

## Architecture

### Core Components

- **NestJS Application**: Built with NestJS framework
- **Immich Integration**: Fetches photos from Immich API
- **Telegram Integration**: Sends photos to Telegram via Telegraf bot API
- **Image Compression**: Compresses images to specified dimensions
- **HTTP API**: Provides endpoints for testing and manual triggers

### Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts               # Application entry point
├── config/               # Configuration management
│   ├── config.module.ts
│   ├── config.constants.ts
│   └── index.ts
├── image-compression/    # Image compression service
│   ├── image-compression.service.ts
│   ├── image-compression.module.ts
│   └── index.ts
├── immich/               # Immich integration
│   ├── immich.service.ts
│   ├── immich.module.ts
│   └── index.ts
├── telegram/             # Telegram integration
│   ├── telegram.service.ts
│   ├── telegram.controller.ts  # HTTP API for testing
│   ├── telegram.module.ts
│   └── index.ts
└── mcp/                  # MCP server implementation
    └── mcp.module.ts
```

## Development Standards

### Code Style

- Use TypeScript with strict mode
- Follow NestJS conventions
- Use ESLint and Prettier for code formatting
- Write comprehensive tests

### Environment Variables

- `IMMICH_API_URL`: Immich server API endpoint
- `IMMICH_API_KEY`: API key for Immich authentication
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for Telegraf
- `TELEGRAM_CHAT_ID`: Target chat ID for photo delivery

### API Design

- RESTful endpoints for MCP tools
- Proper error handling and validation
- Rate limiting for external API calls
- Logging for debugging and monitoring

## Implementation Plan

### Phase 1: Basic NestJS Application

- [x] Set up basic NestJS application structure
- [x] Implement configuration management
- [x] Add basic HTTP endpoints

### Phase 2: Immich Integration

- [x] Implement Immich API client
- [x] Add photo fetching functionality
- [x] Handle authentication and rate limiting

### Phase 3: Telegram Integration

- [x] Implement TelegramService with Telegraf
- [x] Add sendPhotos method for batch photo sending
- [x] Support up to 10 photos per message with captions
- [x] Handle single photo and media group sending

### Phase 4: Image Compression

- [x] Implement ImageCompressionService with compress method
- [x] Add Sharp dependency for image processing
- [x] Support default compression to 1920px on larger side
- [x] Overwrite original file with compressed version

### Phase 5: HTTP API

- [x] Create HTTP endpoints for photo operations
- [x] Add testing endpoints for Telegram integration
- [x] Implement error handling and validation

### Phase 6: Production Features

- [x] Docker containerization
- [x] Environment-based configuration
- [x] Logging and error tracking
- [x] Automatic cleanup of temporary files

## Testing

- Integration tests for image compression service with real images
- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for HTTP API functionality
- Performance tests for photo processing

## Deployment

- Docker containerization
- Environment-based configuration
- Health checks and monitoring
- Logging and error tracking
