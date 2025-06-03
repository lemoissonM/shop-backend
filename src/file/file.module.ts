import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CloudinaryConfigService } from './configs/cloudinary.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FileController],
  providers: [FileService, CloudinaryConfigService],
  exports: [FileService],
})
export class FileModule {}
