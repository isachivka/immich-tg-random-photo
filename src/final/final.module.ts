import { Module } from '@nestjs/common';
import { FinalController } from './final.controller';
import { ImmichModule } from '../immich/immich.module';
import { ImageCompressionModule } from '../image-compression/image-compression.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [ImmichModule, ImageCompressionModule, TelegramModule],
  controllers: [FinalController],
})
export class FinalModule {}
