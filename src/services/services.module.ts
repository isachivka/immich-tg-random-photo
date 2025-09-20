import { Module } from '@nestjs/common';
import { ImmichService } from './immich.service';
import { ImageConversionService } from './image-conversion.service';

@Module({
  providers: [ImmichService, ImageConversionService],
  exports: [ImmichService, ImageConversionService],
})
export class ServicesModule {}
