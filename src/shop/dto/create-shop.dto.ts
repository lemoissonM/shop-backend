import { IsString, IsOptional } from 'class-validator';

export class CreateShopDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
