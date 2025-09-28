import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';

export interface CompressionOptions {
  maxSize?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  orientation?: number;
}

@Injectable()
export class ImageCompressionService {
  private readonly logger = new Logger(ImageCompressionService.name);

  /**
   * Сжимает изображение до указанного размера по большей стороне
   * @param imagePath Путь к исходному изображению
   * @param options Опции сжатия
   * @returns Promise<string> Путь к сжатому изображению (тот же, что и исходный)
   */
  async compress(imagePath: string, options: CompressionOptions = {}): Promise<string> {
    const { maxSize = 1920, quality = 90, orientation } = options;

    try {
      this.logger.log(`Starting compression of ${imagePath}`);

      // Проверяем существование файла
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      // Получаем информацию об изображении
      const metadata = await sharp(imagePath).metadata();
      this.logger.log(
        `Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, orientation: ${metadata.orientation || 'unknown'}`,
      );

      // Определяем размеры для сжатия
      const { width, height } = this.calculateDimensions(
        metadata.width || 0,
        metadata.height || 0,
        maxSize,
      );

      this.logger.log(`Target dimensions: ${width}x${height}`);

      // Создаем Sharp pipeline
      let sharpInstance = sharp(imagePath);

      // Применяем ориентацию если указана
      if (orientation && orientation !== 1) {
        this.logger.log(`Applying orientation correction: ${orientation}`);
        sharpInstance = sharpInstance.rotate();
      }

      // Сжимаем изображение
      const compressedBuffer = await sharpInstance
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      // Записываем сжатое изображение в оригинальный путь
      fs.writeFileSync(imagePath, compressedBuffer);

      this.logger.log(`Image compressed successfully: ${imagePath}`);
      return imagePath;
    } catch (error) {
      this.logger.error(`Error compressing image ${imagePath}:`, error);
      throw error;
    }
  }

  /**
   * Вычисляет размеры для сжатия с сохранением пропорций
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxSize: number,
  ): { width: number; height: number } {
    if (originalWidth <= maxSize && originalHeight <= maxSize) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth > originalHeight) {
      return {
        width: maxSize,
        height: Math.round(maxSize / aspectRatio),
      };
    } else {
      return {
        width: Math.round(maxSize * aspectRatio),
        height: maxSize,
      };
    }
  }

  /**
   * Получает информацию об изображении
   */
  async getImageInfo(imagePath: string): Promise<sharp.Metadata> {
    try {
      return await sharp(imagePath).metadata();
    } catch (error) {
      this.logger.error(`Error getting image info for ${imagePath}:`, error);
      throw error;
    }
  }
}
