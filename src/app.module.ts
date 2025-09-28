import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpServerModule } from './mcp/mcp.module';
import { ImmichModule } from './immich/immich.module';

@Module({
  imports: [ConfigModule.forRoot(), McpServerModule, ImmichModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
