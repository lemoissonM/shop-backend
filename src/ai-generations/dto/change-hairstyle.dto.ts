import { IsString, IsOptional } from 'class-validator';

export class ChangeHairstyleDto {
  @IsString()
  @IsOptional()
  haircut?: string = 'Random';

  @IsString()
  @IsOptional()
  hair_color?: string = 'Random';

  @IsString()
  input_image: string;
} 