import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryConfigService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME') || '',
      api_key: this.configService.get('CLOUDINARY_API_KEY') || '',
      api_secret: this.configService.get('CLOUDINARY_API_SECRET') || '',
    });
  }

  getCloudinaryStorage() {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'ai-generations',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        format: 'png',
      } as any,
    });
  }

  async uploadBuffer(
    buffer: Buffer,
    folderName = 'ai-generations',
    filename?: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder: folderName,
        resource_type: 'auto',
      };

      if (filename) {
        uploadOptions['public_id'] = filename.replace(/\.[^/.]+$/, ''); // remove extension
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Upload failed'));
          return resolve(result.secure_url);
        },
      );

      uploadStream.end(buffer);
    });
  }
}
