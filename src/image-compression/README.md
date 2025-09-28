# Image Compression Service

Service for compressing images using the Sharp library.

## Usage

### Basic Usage

```typescript
import { ImageCompressionService } from './image-compression.service';

// Inject service
constructor(private readonly imageCompressionService: ImageCompressionService) {}

// Compress image with default settings
// (1920px on larger side, 85% quality, JPEG format)
const compressedPath = await this.imageCompressionService.compress('/path/to/image.jpg');
```

### Advanced Settings

```typescript
// Compress with custom parameters
const compressedPath = await this.imageCompressionService.compress('/path/to/image.jpg', {
  maxSize: 1024, // Maximum size on larger side
  quality: 90, // JPEG quality (1-100)
  format: 'jpeg', // Output file format
});
```

## API

### Method `compress(imagePath: string, options?: CompressionOptions): Promise<string>`

Compresses image and saves result to original path.

**Parameters:**

- `imagePath` - path to source image
- `options` - compression options (optional)

**Compression Options:**

- `maxSize?: number` - maximum size on larger side (default: 1920)
- `quality?: number` - JPEG quality (default: 85)
- `format?: 'jpeg' | 'png' | 'webp'` - output file format (default: 'jpeg')

**Returns:** Promise with path to compressed image (same as source)

### Method `getImageInfo(imagePath: string): Promise<sharp.Metadata>`

Gets image information.

**Parameters:**

- `imagePath` - path to image

**Returns:** Promise with image metadata

## Features

- Preserves image aspect ratio
- Does not enlarge images that are already smaller than target size
- Overwrites original file with compressed version
- Supports operation logging
- Handles errors with detailed logging
