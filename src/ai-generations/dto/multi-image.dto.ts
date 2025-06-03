import { IsString, IsOptional } from 'class-validator';

export class MultiImageDto {
  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  aspect_ratio?: string = '1:1';

  @IsString()
  input_image_1: string;

  @IsString()
  input_image_2: string;
} 