import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import * as fs from 'fs';

export interface SendPhotosOptions {
  photos: string[];
  caption?: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot: Telegraf;

  constructor(private readonly configService: ConfigService) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured');
    }

    this.bot = new Telegraf(botToken);
    this.logger.log(`Telegram service initialized for chat: ${chatId}`);
  }

  /**
   * Sends a batch of photos to Telegram with caption
   * @param photos Array of photo file paths (up to 10 photos)
   * @param caption Caption for the photos
   * @returns Promise with send result
   */
  async sendPhotos(photos: string[], caption?: string): Promise<any> {
    try {
      this.logger.log(`Sending ${photos.length} photos to Telegram`);

      // Check photo count
      if (photos.length === 0) {
        throw new Error('No photos provided');
      }

      if (photos.length > 10) {
        throw new Error('Maximum 10 photos allowed per message');
      }

      // Check file existence
      const validPhotos = [];
      for (const photoPath of photos) {
        if (!fs.existsSync(photoPath)) {
          this.logger.warn(`Photo file not found: ${photoPath}`);
          continue;
        }
        validPhotos.push(photoPath);
      }

      if (validPhotos.length === 0) {
        throw new Error('No valid photo files found');
      }

      const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

      // If single photo, send as regular photo
      if (validPhotos.length === 1) {
        const result = await this.bot.telegram.sendPhoto(
          chatId,
          { source: validPhotos[0] },
          { caption: caption || '' },
        );

        this.logger.log(`Successfully sent 1 photo to Telegram`);
        return result;
      }

      // If multiple photos, send as media group
      const media = validPhotos.map((photoPath, index) => ({
        type: 'photo' as const,
        media: { source: photoPath },
        ...(index === 0 && caption ? { caption } : {}),
      }));

      const result = await this.bot.telegram.sendMediaGroup(chatId, media);

      this.logger.log(`Successfully sent ${validPhotos.length} photos to Telegram`);
      return result;
    } catch (error) {
      this.logger.error(`Error sending photos to Telegram:`, error);
      throw error;
    }
  }

  /**
   * Sends a text message to Telegram
   * @param message Message text
   * @param parseMode Parse mode ('HTML' or 'Markdown')
   * @returns Promise with send result
   */
  async sendMessage(message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<any> {
    try {
      this.logger.log(`Sending text message to Telegram with parse mode: ${parseMode}`);

      const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
      const result = await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: parseMode,
      });

      this.logger.log(`Successfully sent text message to Telegram`);
      return result;
    } catch (error) {
      this.logger.error(`Error sending text message to Telegram:`, error);
      throw error;
    }
  }

  /**
   * Checks connection to Telegram Bot API
   */
  async checkConnection(): Promise<boolean> {
    try {
      const me = await this.bot.telegram.getMe();
      this.logger.log(`Connected to Telegram bot: @${me.username}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to connect to Telegram Bot API:', error);
      return false;
    }
  }

  /**
   * Gets bot information
   */
  async getBotInfo(): Promise<any> {
    try {
      return await this.bot.telegram.getMe();
    } catch (error) {
      this.logger.error('Failed to get bot info:', error);
      throw error;
    }
  }
}
