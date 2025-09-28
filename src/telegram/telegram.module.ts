import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
// import { TelegramController } from './telegram.controller';

@Module({
  // controllers: [TelegramController], // Commented out for production
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
