import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import * as path from 'path';

export interface SendPhotosRequest {
  photos: string[];
  caption?: string;
}

export interface TestSendPhotosRequest {
  caption?: string;
}

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Sends photos to Telegram
   * POST /telegram/send-photos
   */
  @Post('send-photos')
  async sendPhotos(@Body() request: SendPhotosRequest) {
    try {
      const { photos, caption } = request;

      if (!photos || !Array.isArray(photos) || photos.length === 0) {
        throw new HttpException(
          'Photos array is required and must not be empty',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (photos.length > 10) {
        throw new HttpException('Maximum 10 photos allowed per request', HttpStatus.BAD_REQUEST);
      }

      const result = await this.telegramService.sendPhotos(photos, caption);

      return {
        success: true,
        message: `Successfully sent ${photos.length} photo(s) to Telegram`,
        result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send photos to Telegram',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test endpoint for sending test photo
   * POST /telegram/test-send-photos
   */
  @Post('test-send-photos')
  async testSendPhotos(@Body() request: TestSendPhotosRequest) {
    try {
      const { caption } = request;

      // Use test image
      const testImagePath = path.join(process.cwd(), 'test', 'images', 'test-image.jpg');

      const result = await this.telegramService.sendPhotos([testImagePath], caption);

      return {
        success: true,
        message: 'Successfully sent test photo to Telegram',
        photoPath: testImagePath,
        caption: caption || 'Test photo from Immich Telegram Random Photo MCP Server',
        result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send test photo to Telegram',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Checks connection to Telegram Bot API
   * POST /telegram/check-connection
   */
  @Post('check-connection')
  async checkConnection() {
    try {
      const isConnected = await this.telegramService.checkConnection();

      return {
        success: true,
        connected: isConnected,
        message: isConnected
          ? 'Successfully connected to Telegram Bot API'
          : 'Failed to connect to Telegram Bot API',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to check Telegram connection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Gets bot information
   * POST /telegram/bot-info
   */
  @Post('bot-info')
  async getBotInfo() {
    try {
      const botInfo = await this.telegramService.getBotInfo();

      return {
        success: true,
        message: 'Successfully retrieved bot information',
        botInfo,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get bot information',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
