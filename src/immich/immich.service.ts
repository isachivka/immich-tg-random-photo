import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AssetMediaSize,
  getRandom,
  init,
  viewAsset,
  getAssetInfo,
  AssetResponseDto,
} from '@immich/sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImmichService {
  private readonly logger = new Logger(ImmichService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp');

  constructor(private readonly configService: ConfigService) {
    const apiUrl = this.configService.get<string>('IMMICH_API_URL');
    const apiKey = this.configService.get<string>('IMMICH_API_KEY');

    if (!apiUrl || !apiKey) {
      throw new Error('IMMICH_API_URL and IMMICH_API_KEY must be configured');
    }

    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    init({
      baseUrl: apiUrl,
      apiKey: apiKey,
    });

    this.logger.log(`Immich service initialized with URL: ${apiUrl}`);
  }

  async downloadRandomPhotos(
    count: number,
  ): Promise<{ filePath: string; asset: AssetResponseDto; assetInfo: AssetResponseDto }[]> {
    const assets = await getRandom({ count });
    const assetsInfo = await Promise.all(assets.map(asset => getAssetInfo({ id: asset.id })));
    const blobs = await Promise.all(
      assets.map(asset => viewAsset({ id: asset.id, size: AssetMediaSize.Fullsize })),
    );

    const result = [];
    for (let i = 0; i < blobs.length; i++) {
      const fileName = `${assets[i].id}.jpg`;
      const filePath = path.join(this.tempDir, fileName);
      const buffer = Buffer.from(await blobs[i].arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      result.push({
        filePath,
        asset: assets[i],
        assetInfo: assetsInfo[i],
      });
    }

    return result;
  }
}
