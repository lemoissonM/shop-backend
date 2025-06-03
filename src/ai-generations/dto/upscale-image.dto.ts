import { IsString } from 'class-validator';

export class UpscaleImageDto {
  @IsString()
  input_image: string;
}