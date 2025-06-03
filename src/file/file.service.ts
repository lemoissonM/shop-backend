import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryConfigService } from './configs/cloudinary.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  constructor(
    private cloudinaryConfig: CloudinaryConfigService,
    private configService: ConfigService,
  ) {}

  /**
   * Upload a file to Cloudinary
   * @param file File from multer
   * @returns URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Upload to Cloudinary
      const url = await this.cloudinaryConfig.uploadBuffer(
        file.buffer,
        'ai-generations',
        file.originalname,
      );

      return { url };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload multiple files to Cloudinary
   * @param files Files from multer
   * @returns URLs of the uploaded files
   */
  async uploadFiles(files: Express.Multer.File[]): Promise<{ urls: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    try {
      // Upload all files in parallel
      const uploadPromises = files.map(file =>
        this.cloudinaryConfig.uploadBuffer(
          file.buffer,
          'ai-generations',
          file.originalname,
        ),
      );

      const urls = await Promise.all(uploadPromises);
      return { urls };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload files: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload a base64 encoded image to Cloudinary
   * @param base64Image Base64 encoded image
   * @param filename Optional filename
   * @returns URL of the uploaded file
   */
  async uploadBase64Image(
    base64Image: string,
    filename?: string,
  ): Promise<{ url: string }> {
    if (!base64Image) {
      throw new BadRequestException('No image provided');
    }

    try {
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(
        /^data:image\/\w+;base64,/,
        '',
      );
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Upload to Cloudinary
      const url = await this.cloudinaryConfig.uploadBuffer(
        buffer,
        'ai-generations',
        filename || `image-${Date.now()}`,
      );

      return { url };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload base64 image: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
