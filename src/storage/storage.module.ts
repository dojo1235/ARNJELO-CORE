import { Module } from '@nestjs/common'
import { R2ImageService } from './r2-image.service'
//import { StorageController } from './storage.controller';

@Module({
  controllers: [],
  providers: [R2ImageService],
  exports: [R2ImageService],
})
export class StorageModule {}
