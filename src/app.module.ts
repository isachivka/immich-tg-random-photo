import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpServerModule } from './mcp/mcp.module';
import { ServicesModule } from './services/services.module';
import { TestController } from './controllers/test.controller';

@Module({
  imports: [ConfigModule.forRoot(), McpServerModule, ServicesModule],
  controllers: [TestController],
  providers: [],
})
export class AppModule {}
