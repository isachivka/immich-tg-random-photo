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
   * Отправляет пачку фотографий в Telegram с описанием
   * @param photos Массив путей к фотографиям (до 10 штук)
   * @param caption Описание к фотографиям
   * @returns Promise с результатом отправки
   */
  async sendPhotos(photos: string[], caption?: string): Promise<any> {
    try {
      this.logger.log(`Sending ${photos.length} photos to Telegram`);

      // Проверяем количество фотографий
      if (photos.length === 0) {
        throw new Error('No photos provided');
      }

      if (photos.length > 10) {
        throw new Error('Maximum 10 photos allowed per message');
      }

      // Проверяем существование файлов
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

      // Если одна фотография, отправляем как обычное фото
      if (validPhotos.length === 1) {
        const result = await this.bot.telegram.sendPhoto(
          chatId,
          { source: validPhotos[0] },
          { caption: caption || '' },
        );

        this.logger.log(`Successfully sent 1 photo to Telegram`);
        return result;
      }

      // Если несколько фотографий, отправляем как медиа-группу
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
   * Отправляет текстовое сообщение в Telegram
   * @param message Текст сообщения
   * @param parseMode Режим парсинга ('HTML' или 'Markdown')
   * @returns Promise с результатом отправки
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
   * Проверяет соединение с Telegram Bot API
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
   * Получает информацию о боте
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
