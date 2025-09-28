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
      // Get 10 random photos
      const photos = await this.immichService.downloadRandomPhotos(10);

      // Compress each photo to 1920px with orientation consideration
      for (const photo of photos) {
        const orientationStr = photo.assetInfo.exifInfo?.orientation;
        const orientation = orientationStr ? parseInt(orientationStr, 10) : undefined;
        await this.imageCompressionService.compress(photo.filePath, {
          orientation: orientation,
        });
      }

      // Create description from assetInfo with Immich links
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

        // Build description: country and city only if available, then date
        let description = '';

        // Shorten names for convenience
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

      // Send all photos to Telegram
      const photoPaths = photos.map(photo => photo.filePath);
      const result = await this.telegramService.sendPhotos(photoPaths, caption);

      // Send descriptions with Immich photo links as separate message
      const linksMessage = `${photos
        .map((photo, index) => {
          const immichUrl = `${immichBaseUrl}/photos/${photo.asset.id}`;
          const description = descriptions[index];
          return `${emojis[index]} <a href="${immichUrl}">${description}</a>`;
        })
        .join('\n')}`;

      await this.telegramService.sendMessage(linksMessage, 'HTML');

      // Clean up temporary files after sending
      for (const photo of photos) {
        try {
          if (fs.existsSync(photo.filePath)) {
            fs.unlinkSync(photo.filePath);
          }
        } catch {
          // Log error but continue cleanup
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
      throw error;
    }
  }
}
