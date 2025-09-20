import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as heicConvert from 'heic-convert';

export interface ConversionOptions {
  format: 'jpeg' | 'png' | 'webp';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

@Injectable()
export class ImageConversionService {
  private readonly logger = new Logger(ImageConversionService.name);

  /**
   * Конвертировать HEIC файл в JPEG
   * @param inputPath Путь к HEIC файлу
   * @param outputPath Путь для сохранения JPEG файла
   * @param quality Качество JPEG (1-100)
   */
  async convertHeicToJpeg(
    inputPath: string,
    outputPath: string,
    quality: number = 85,
  ): Promise<void> {
    try {
      this.logger.log(`Converting HEIC: ${inputPath} -> ${outputPath}`);

      const inputBuffer = fs.readFileSync(inputPath);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: quality,
      });

      fs.writeFileSync(outputPath, outputBuffer);
      this.logger.log(`Successfully converted HEIC: ${outputPath}`);
    } catch (error) {
      this.logger.error(`Failed to convert HEIC ${inputPath}`, error);
      throw new Error(`HEIC conversion failed: ${error.message}`);
    }
  }

  /**
   * Конвертировать изображение в поддерживаемый Telegram формат
   * @param inputPath Путь к исходному файлу
   * @param outputPath Путь для сохранения конвертированного файла
   * @param options Опции конвертации
   */
  async convertImage(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions = { format: 'jpeg', quality: 85 },
  ): Promise<void> {
    try {
      this.logger.log(`Converting image: ${inputPath} -> ${outputPath}`);

      // Проверяем, является ли файл HEIC
      const ext = path.extname(inputPath).toLowerCase();
      if (ext === '.heic') {
        // Для HEIC файлов используем специальную конвертацию
        await this.convertHeicToJpeg(inputPath, outputPath, options.quality || 85);
        return;
      }

      let sharpInstance = sharp(inputPath);

      // Применяем изменения размера если нужно
      if (options.maxWidth || options.maxHeight) {
        sharpInstance = sharpInstance.resize(options.maxWidth, options.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Конвертируем в нужный формат
      switch (options.format) {
        case 'jpeg':
          await sharpInstance.jpeg({ quality: options.quality || 85 }).toFile(outputPath);
          break;
        case 'png':
          await sharpInstance.png({ quality: options.quality || 85 }).toFile(outputPath);
          break;
        case 'webp':
          await sharpInstance.webp({ quality: options.quality || 85 }).toFile(outputPath);
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      this.logger.log(`Successfully converted image: ${outputPath}`);
    } catch (error) {
      this.logger.error(`Failed to convert image ${inputPath}`, error);
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }

  /**
   * Конвертировать все изображения в папке
   * @param inputDir Папка с исходными изображениями
   * @param outputDir Папка для сохранения конвертированных изображений
   * @param options Опции конвертации
   */
  async convertImagesInDirectory(
    inputDir: string,
    outputDir: string,
    options: ConversionOptions = { format: 'jpeg', quality: 85 },
  ): Promise<string[]> {
    try {
      this.logger.log(`Converting images in directory: ${inputDir}`);

      // Создаем выходную папку если не существует
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const files = fs.readdirSync(inputDir);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.tiff', '.bmp'];
      const imageFiles = files.filter(file =>
        imageExtensions.some(ext => file.toLowerCase().endsWith(ext)),
      );

      this.logger.log(`Found ${imageFiles.length} image files to convert`);

      const convertedFiles: string[] = [];

      for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const outputFileName = this.getOutputFileName(file, options.format);
        const outputPath = path.join(outputDir, outputFileName);

        try {
          await this.convertImage(inputPath, outputPath, options);
          convertedFiles.push(outputPath);
        } catch (error) {
          this.logger.error(`Failed to convert ${file}:`, error);
          // Продолжаем с другими файлами
        }
      }

      this.logger.log(`Successfully converted ${convertedFiles.length} images`);
      return convertedFiles;
    } catch (error) {
      this.logger.error('Failed to convert images in directory', error);
      throw new Error(`Directory conversion failed: ${error.message}`);
    }
  }

  /**
   * Получить информацию об изображении
   * @param imagePath Путь к изображению
   */
  async getImageInfo(imagePath: string): Promise<any> {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        channels: metadata.channels,
        density: metadata.density,
      };
    } catch (error) {
      this.logger.error(`Failed to get image info for ${imagePath}`, error);
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  /**
   * Проверить, поддерживается ли формат изображения
   * @param filePath Путь к файлу
   */
  isSupportedFormat(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.tiff', '.bmp'];
    return supportedFormats.includes(ext);
  }

  /**
   * Получить имя выходного файла с правильным расширением
   * @param inputFileName Имя исходного файла
   * @param outputFormat Формат выходного файла
   */
  private getOutputFileName(inputFileName: string, outputFormat: string): string {
    const nameWithoutExt = path.parse(inputFileName).name;
    return `${nameWithoutExt}.${outputFormat}`;
  }

  /**
   * Очистить папку от временных файлов
   * @param dirPath Путь к папке
   */
  async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          fs.unlinkSync(filePath);
        }
        fs.rmdirSync(dirPath);
        this.logger.log(`Cleaned up directory: ${dirPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup directory ${dirPath}`, error);
    }
  }
}
