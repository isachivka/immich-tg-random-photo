import { Controller, Get, Query, Logger, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ImmichService } from '../services/immich.service';
import { ImageConversionService } from '../services/image-conversion.service';
import * as fs from 'fs';
import * as path from 'path';
import * as AdmZip from 'adm-zip';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    private readonly immichService: ImmichService,
    private readonly imageConversionService: ImageConversionService,
  ) {}

  /**
   * Тестовый эндпоинт для получения случайных фото из Immich
   * GET /test/random-photos?count=20
   */
  @Get('random-photos')
  async getRandomPhotos(@Query('count') count?: string) {
    try {
      const photoCount = count ? parseInt(count, 10) : 20;

      if (isNaN(photoCount) || photoCount <= 0) {
        throw new Error('Count must be a positive number');
      }

      this.logger.log(`Requesting ${photoCount} random photos`);

      const photoIds = await this.immichService.getRandomPhotoIds(photoCount);

      return {
        success: true,
        count: photoIds.length,
        photoIds,
        message: `Successfully retrieved ${photoIds.length} random photo IDs`,
      };
    } catch (error) {
      this.logger.error('Failed to get random photos', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get random photos from Immich',
      };
    }
  }

  /**
   * Тестовый эндпоинт для проверки подключения к Immich
   * GET /test/connection
   */
  @Get('connection')
  async testConnection() {
    try {
      this.logger.log('Testing Immich connection');

      const isConnected = await this.immichService.testConnection();

      if (isConnected) {
        const serverInfo = await this.immichService.getServerInfo();

        return {
          success: true,
          connected: true,
          serverInfo,
          message: 'Successfully connected to Immich API',
        };
      } else {
        return {
          success: false,
          connected: false,
          message: 'Failed to connect to Immich API',
        };
      }
    } catch (error) {
      this.logger.error('Connection test failed', error);
      return {
        success: false,
        connected: false,
        error: error.message,
        message: 'Connection test failed',
      };
    }
  }

  /**
   * Тестовый эндпоинт для получения информации о сервере
   * GET /test/server-info
   */
  @Get('server-info')
  async getServerInfo() {
    try {
      this.logger.log('Getting server info');

      const serverInfo = await this.immichService.getServerInfo();

      return {
        success: true,
        serverInfo,
        message: 'Server info retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Failed to get server info', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get server info',
      };
    }
  }

  /**
   * Тестовый эндпоинт для скачивания ZIP архива с случайными фото
   * GET /test/download-photos?count=20
   */
  @Get('download-photos')
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="random_photos.zip"')
  async downloadRandomPhotos(@Query('count') count: string, @Res() res: Response) {
    try {
      const photoCount = count ? parseInt(count, 10) : 20;

      if (isNaN(photoCount) || photoCount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Count must be a positive number',
          message: 'Invalid count parameter',
        });
      }

      this.logger.log(`Downloading ${photoCount} random photos as ZIP archive`);

      const archive = await this.immichService.getRandomPhotosArchive(photoCount);

      this.logger.log(`Successfully downloaded archive: ${archive.length} bytes`);

      return res.send(archive);
    } catch (error) {
      this.logger.error('Failed to download random photos', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to download random photos',
      });
    }
  }

  /**
   * Тестовый эндпоинт для конвертации изображений
   * GET /test/convert-images?count=3&format=jpeg
   */
  @Get('convert-images')
  async convertImages(
    @Query('count') count: string,
    @Query('format') format: string = 'jpeg',
    @Query('quality') quality: string = '85',
  ) {
    try {
      const photoCount = count ? parseInt(count, 10) : 3;
      const imageFormat = format as 'jpeg' | 'png' | 'webp';
      const imageQuality = quality ? parseInt(quality, 10) : 85;

      if (isNaN(photoCount) || photoCount <= 0) {
        return {
          success: false,
          error: 'Count must be a positive number',
          message: 'Invalid count parameter',
        };
      }

      if (!['jpeg', 'png', 'webp'].includes(imageFormat)) {
        return {
          success: false,
          error: 'Format must be jpeg, png, or webp',
          message: 'Invalid format parameter',
        };
      }

      this.logger.log(`Converting ${photoCount} random photos to ${imageFormat} format`);

      // Сначала получаем случайные фото
      const photoIds = await this.immichService.getRandomPhotoIds(photoCount);

      // Скачиваем их в ZIP архив
      const archive = await this.immichService.downloadArchive(photoIds);

      // Создаем временные папки
      const tempDir = './temp/immich-photos';
      const convertedDir = './temp/converted-photos';

      // Очищаем папки если существуют
      await this.imageConversionService.cleanupDirectory(tempDir);
      await this.imageConversionService.cleanupDirectory(convertedDir);

      // Создаем папки
      fs.mkdirSync(tempDir, { recursive: true });
      fs.mkdirSync(convertedDir, { recursive: true });

      // Сохраняем ZIP архив
      const zipPath = `${tempDir}/photos.zip`;
      fs.writeFileSync(zipPath, archive);

      // Распаковываем ZIP
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);

      // Конвертируем изображения
      const convertedFiles = await this.imageConversionService.convertImagesInDirectory(
        tempDir,
        convertedDir,
        {
          format: imageFormat,
          quality: imageQuality,
          maxWidth: 1920,
          maxHeight: 1080,
        },
      );

      // Получаем информацию о конвертированных файлах
      const fileInfo = [];
      for (const file of convertedFiles) {
        const info = await this.imageConversionService.getImageInfo(file);
        fileInfo.push({
          filename: path.basename(file),
          ...info,
        });
      }

      // Очищаем временные файлы
      // await this.imageConversionService.cleanupDirectory(tempDir);
      // await this.imageConversionService.cleanupDirectory(convertedDir);

      return {
        success: true,
        originalCount: photoIds.length,
        convertedCount: convertedFiles.length,
        format: imageFormat,
        quality: imageQuality,
        files: fileInfo,
        message: `Successfully converted ${convertedFiles.length} images to ${imageFormat} format`,
      };
    } catch (error) {
      this.logger.error('Failed to convert images', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to convert images',
      };
    }
  }
}
