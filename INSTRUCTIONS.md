# Immich Telegram Random Photo MCP Server - Development Instructions

## Project Overview

This MCP (Model Context Protocol) server provides functionality to fetch random photos from an Immich server and send them to Telegram. The server includes AI-powered filtering to avoid sending screenshots and document photos.

## Architecture

### Core Components

- **MCP Server**: Built with NestJS and the MCP NestJS implementation
- **Immich Integration**: Fetches photos from Immich API
- **Telegram Integration**: Sends photos to Telegram via bot API
- **AI Filtering**: Filters out screenshots and document photos
- **Image Compression**: Compresses images to specified dimensions

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
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `TELEGRAM_CHAT_ID`: Target chat ID for photo delivery

### API Design

- RESTful endpoints for MCP tools
- Proper error handling and validation
- Rate limiting for external API calls
- Logging for debugging and monitoring

## Implementation Plan

### Phase 1: Basic MCP Server

- [ ] Set up basic MCP server structure
- [ ] Implement configuration management
- [ ] Add basic health check endpoint

### Phase 2: Immich Integration

- [ ] Implement Immich API client
- [ ] Add photo fetching functionality
- [ ] Handle authentication and rate limiting

### Phase 3: Telegram Integration

- [ ] Implement Telegram bot client
- [ ] Add photo sending functionality
- [ ] Handle file uploads and media types

### Phase 4: AI Filtering

- [ ] Integrate AI service for image analysis
- [ ] Implement screenshot detection
- [ ] Add document photo filtering
- [ ] Create filtering rules and thresholds

### Phase 5: Image Compression

- [x] Implement ImageCompressionService with compress method
- [x] Add Sharp dependency for image processing
- [x] Support default compression to 1920px on larger side
- [x] Overwrite original file with compressed version

### Phase 6: MCP Tools

- [ ] Create MCP tools for photo operations
- [ ] Add configuration management tools
- [ ] Implement monitoring and logging tools

## Testing

- Integration tests for image compression service with real images
- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for MCP tool functionality
- Performance tests for photo processing

## Deployment

- Docker containerization
- Environment-based configuration
- Health checks and monitoring
- Logging and error tracking
