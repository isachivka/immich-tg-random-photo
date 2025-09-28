import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImmichService } from '../immich/immich.service';
import { ImageCompressionService } from '../image-compression/image-compression.service';
import { TelegramService } from '../telegram/telegram.service';
import * as fs from 'fs';

@Controller('final')
export class FinalController {
  constructor(
    private readonly immichService: ImmichService,
    private readonly imageCompressionService: ImageCompressionService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  @Post('send-random-photos')
  async sendRandomPhotos() {
    try {
      // Получаем 10 рандомных фотографий
      const photos = await this.immichService.downloadRandomPhotos(10);

      // Сжимаем каждую фотографию до 1920px с учетом ориентации
      for (const photo of photos) {
        const orientationStr = photo.assetInfo.exifInfo?.orientation;
        const orientation = orientationStr ? parseInt(orientationStr, 10) : undefined;
        await this.imageCompressionService.compress(photo.filePath, {
          orientation: orientation,
        });
      }

      // Создаем описание из assetInfo с ссылками на Immich
      const immichBaseUrl = this.configService.get<string>('IMMICH_PUBLIC_URL');
      const descriptions = photos.map(photo => {
        const info = photo.assetInfo;
        const country = info.exifInfo?.country;
        const city = info.exifInfo?.city;
        const dateTimeOriginal = info.exifInfo?.dateTimeOriginal;

        let dateStr = 'Unknown';
        if (dateTimeOriginal) {
          const date = new Date(dateTimeOriginal);
          dateStr = date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });
        }

        // Формируем описание: страна и город только если есть, потом дата
        let description = '';

        // Сокращаем названия для удобства
        let shortCountry = country;
        let shortCity = city;

        if (country === 'Russian Federation') {
          shortCountry = 'Russia';
        }

        if (city === 'Saint Petersburg') {
          shortCity = 'Saint P.';
        }

        if (shortCountry && shortCity) {
          description = `${shortCountry}, ${shortCity}, ${dateStr}`;
        } else if (shortCountry) {
          description = `${shortCountry}, ${dateStr}`;
        } else if (shortCity) {
          description = `${shortCity}, ${dateStr}`;
        } else {
          description = dateStr;
        }

        return description;
      });

      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const caption = ``;

      // Отправляем все фотографии в Telegram
      const photoPaths = photos.map(photo => photo.filePath);
      const result = await this.telegramService.sendPhotos(photoPaths, caption);

      // Отправляем описания с ссылками на фотографии в Immich отдельным сообщением
      const linksMessage = `${photos
        .map((photo, index) => {
          const immichUrl = `${immichBaseUrl}/photos/${photo.asset.id}`;
          const description = descriptions[index];
          return `${emojis[index]} <a href="${immichUrl}">${description}</a>`;
        })
        .join('\n')}`;

      await this.telegramService.sendMessage(linksMessage, 'HTML');

      // Выводим ссылки на фотографии в Immich в консоль для отладки
      console.log('\n=== IMMICH LINKS ===');
      console.log(linksMessage);
      console.log('===================\n');

      // Удаляем временные файлы после отправки
      for (const photo of photos) {
        try {
          if (fs.existsSync(photo.filePath)) {
            fs.unlinkSync(photo.filePath);
          }
        } catch (error) {
          console.error(`Failed to delete file ${photo.filePath}:`, error);
        }
      }

      return {
        success: true,
        message: `Successfully sent ${photos.length} random photos to Telegram`,
        photos: photos.map(photo => ({
          id: photo.asset.id,
          path: photo.filePath,
          description: descriptions[photos.indexOf(photo)],
        })),
        result,
      };
    } catch (error) {
      console.error('Error in sendRandomPhotos:', error);
      throw error;
    }
  }
}
