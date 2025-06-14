import { IsString, IsOptional } from 'class-validator';

export class TextToVideoDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  end_image?: string;
} 