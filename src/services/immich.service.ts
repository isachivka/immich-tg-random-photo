import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface ImmichAsset {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  fileCreatedAt: string;
  fileModifiedAt: string;
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  duration: string;
  exifInfo: any;
  livePhotoVideoId?: string;
  tags: any[];
  people: any[];
  checksum: string;
  stack: any;
  sidecarPath?: string;
  isExternal: boolean;
  isReadOnly: boolean;
  isOffline: boolean;
  libraryId: string;
  originalPath: string;
  resizePath: string;
  webpPath: string;
  thumbhash: string;
  encodedVideoPath?: string;
  colorPalette: any[];
  localDateTime: string;
  isVisible: boolean;
  deviceAssetId: string;
  deviceId: string;
  ownerId: string;
  owner: any;
  library: any;
}

@Injectable()
export class ImmichService {
  private readonly logger = new Logger(ImmichService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('IMMICH_API_URL');
    this.apiKey = this.configService.get<string>('IMMICH_API_KEY');

    if (!this.apiUrl || !this.apiKey) {
      throw new Error('IMMICH_API_URL and IMMICH_API_KEY must be configured');
    }

    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.logger.log(`ImmichService initialized with API URL: ${this.apiUrl}`);
  }

  async getRandomPhotoIds(count: number = 20): Promise<string[]> {
    try {
      this.logger.log(`Requesting ${count} random photos from Immich`);

      const response = await this.httpClient.post('/search/random', {
        size: count,
        type: 'IMAGE',
        withDeleted: false,
      });

      if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('Immich returned empty random assets list');
      }

      const assetIds = response.data.map((asset: ImmichAsset) => asset.id);
      this.logger.log(`Received ${assetIds.length} random photo IDs: ${assetIds.join(', ')}`);

      return assetIds;
    } catch (error) {
      this.logger.error('Failed to get random photos from Immich', error);
      throw new Error(`Failed to get random photos: ${error.message}`);
    }
  }

  async getAssetById(assetId: string): Promise<ImmichAsset> {
    try {
      this.logger.log(`Getting asset details for ID: ${assetId}`);

      const response = await this.httpClient.get(`/asset/${assetId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get asset ${assetId}`, error);
      throw new Error(`Failed to get asset details: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing Immich API connection');

      // Попробуем запрос, который точно работает - получение случайных фото
      const response = await this.httpClient.post('/search/random', {
        size: 1,
        type: 'IMAGE',
        withDeleted: false,
      });

      if (response.data && Array.isArray(response.data)) {
        this.logger.log('Immich API connection successful');
        return true;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      this.logger.error('Immich API connection failed', error);
      return false;
    }
  }

  async getServerInfo(): Promise<any> {
    try {
      // Попробуем получить информацию о сервере через другой эндпоинт
      const response = await this.httpClient.get('/server/ping');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get server info', error);
      throw new Error(`Failed to get server info: ${error.message}`);
    }
  }

  /**
   * Скачать ZIP архив с фото по их ID
   * @param assetIds Массив ID фото для скачивания
   * @returns Buffer с ZIP архивом
   */
  async downloadArchive(assetIds: string[]): Promise<Buffer> {
    try {
      this.logger.log(`Downloading archive with ${assetIds.length} photos`);

      const response = await this.httpClient.post(
        '/download/archive',
        {
          assetIds,
        },
        {
          responseType: 'arraybuffer', // Важно для получения бинарных данных
          timeout: 120000, // 2 минуты для больших архивов
        },
      );

      if (!response.data) {
        throw new Error('Empty response from download/archive');
      }

      const buffer = Buffer.from(response.data);
      this.logger.log(`Downloaded archive: ${buffer.length} bytes`);

      return buffer;
    } catch (error) {
      this.logger.error('Failed to download archive', error);
      throw new Error(`Failed to download archive: ${error.message}`);
    }
  }

  /**
   * Получить случайные фото и скачать их в ZIP архив
   * @param count Количество фото для получения
   * @returns Buffer с ZIP архивом
   */
  async getRandomPhotosArchive(count: number = 20): Promise<Buffer> {
    try {
      this.logger.log(`Getting ${count} random photos and downloading archive`);

      // Сначала получаем ID случайных фото
      const photoIds = await this.getRandomPhotoIds(count);

      // Затем скачиваем их в ZIP архив
      const archive = await this.downloadArchive(photoIds);

      return archive;
    } catch (error) {
      this.logger.error('Failed to get random photos archive', error);
      throw new Error(`Failed to get random photos archive: ${error.message}`);
    }
  }
}
