import { Test, TestingModule } from '@nestjs/testing';
import { ImageCompressionService } from './image-compression.service';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

describe('ImageCompressionService Integration Tests', () => {
  let service: ImageCompressionService;
  let testImagePath: string;
  let originalImagePath: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageCompressionService],
    }).compile();

    service = module.get<ImageCompressionService>(ImageCompressionService);

    originalImagePath = path.join(process.cwd(), 'test', 'images', 'test-image.jpg');
    testImagePath = path.join(process.cwd(), 'temp', 'integration-test-image.jpg');
  });

  beforeEach(() => {
    // Copy original image for each test
    if (fs.existsSync(originalImagePath)) {
      fs.copyFileSync(originalImagePath, testImagePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  describe('compress method', () => {
    it('should compress image with default settings (1920px max size)', async () => {
      const originalMetadata = await sharp(testImagePath).metadata();
      const originalSize = fs.statSync(testImagePath).size;

      const compressedPath = await service.compress(testImagePath);

      expect(compressedPath).toBe(testImagePath);

      const compressedMetadata = await sharp(testImagePath).metadata();
      const compressedSize = fs.statSync(testImagePath).size;

      expect(compressedSize).toBeLessThan(originalSize);

      const maxDimension = Math.max(compressedMetadata.width || 0, compressedMetadata.height || 0);
      expect(maxDimension).toBeLessThanOrEqual(1920);

      const originalAspectRatio = (originalMetadata.width || 0) / (originalMetadata.height || 0);
      const compressedAspectRatio =
        (compressedMetadata.width || 0) / (compressedMetadata.height || 0);
      expect(Math.abs(originalAspectRatio - compressedAspectRatio)).toBeLessThan(0.01);
    });
  });
});
