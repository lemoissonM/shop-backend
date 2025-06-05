import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryConfigService } from './configs/cloudinary.config';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

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
      const uploadPromises = files.map((file) =>
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
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

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

  /**
   * Upload a file to local public/images directory
   * @param file File from multer
   * @returns URL of the uploaded file
   */
  async uploadLocalFile(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Create public/images directory if it doesn't exist
      const publicDir = path.join(process.cwd(), 'public');
      const imagesDir = path.join(publicDir, 'images');

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
      }

      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
      }

      // Generate a unique filename to prevent overwriting
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;
      const filePath = path.join(imagesDir, uniqueFilename);

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const MAX_SIZE = 2 * 1024 * 1024;
      let fileBuffer = file.buffer;

      // If file is larger than 2MB, resize it
      if (file.buffer.length > MAX_SIZE) {
        // Process image with sharp
        fileBuffer = await sharp(file.buffer)
          .resize({
            width: 1200, // Resize to max width of 1200px
            height: 1200, // Resize to max height of 1200px
            fit: 'inside', // Maintain aspect ratio
            withoutEnlargement: true, // Don't enlarge images smaller than these dimensions
          })
          .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
          .toBuffer();
      }

      // Write the file to disk
      fs.writeFileSync(filePath, fileBuffer);

      // Generate and return the URL
      const baseUrl =
        this.configService.get('BASE_URL') ||
        'https://shop-backend.harvely.com';
      const url = `${baseUrl}/images/${uniqueFilename}`;

      return { url };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file locally: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
