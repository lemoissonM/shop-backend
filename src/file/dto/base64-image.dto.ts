import { IsString, IsOptional, Matches } from 'class-validator';

export class Base64ImageDto {
  @IsString()
  @Matches(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/, {
    message: 'Invalid base64 image format',
  })
  image: string;

  @IsString()
  @IsOptional()
  filename?: string;
} 