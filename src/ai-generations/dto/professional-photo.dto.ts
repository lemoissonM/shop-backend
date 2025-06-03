import { IsString, IsOptional } from 'class-validator';

export class ProfessionalPhotoDto {
  @IsString()
  gender: string;

  @IsString()
  input_image: string;

  @IsString()
  background: string;

  @IsString()
  @IsOptional()
  aspect_ratio?: string = '1:1';
} 