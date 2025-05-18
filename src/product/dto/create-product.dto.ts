import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  id: string;

  @IsString()
  shopId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  variant?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsNumber()
  stock: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  updatedAt: number;

  @IsOptional()
  @IsArray()
  batches?: any[];

  @IsOptional()
  @IsNumber()
  unitSellingPrice?: number;
}
