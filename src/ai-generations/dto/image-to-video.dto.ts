import { IsString, IsOptional } from 'class-validator';

export class ImageToVideoDto {
  @IsString()
  prompt: string;

  @IsString()
  start_image: string;

  @IsOptional()
  @IsString()
  end_image?: string;
} 