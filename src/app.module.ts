import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpServerModule } from './mcp/mcp.module';
import { ImmichModule } from './immich/immich.module';
import { ImageCompressionModule } from './image-compression/image-compression.module';
import { TelegramModule } from './telegram/telegram.module';
import { FinalModule } from './final/final.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    McpServerModule,
    ImmichModule,
    ImageCompressionModule,
    TelegramModule,
    FinalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
