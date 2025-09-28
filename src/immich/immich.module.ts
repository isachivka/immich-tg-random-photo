import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImmichService } from './immich.service';

@Module({
  imports: [ConfigModule],
  providers: [ImmichService],
  exports: [ImmichService],
})
export class ImmichModule {}
