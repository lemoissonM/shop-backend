import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BulkSaleItemDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateBulksaleDto {
  @IsString()
  shopId: string;

  @IsNumber()
  date: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSaleItemDto)
  items: BulkSaleItemDto[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsIn(['fixed', 'percent'])
  taxType: 'fixed' | 'percent';

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  receiptQr?: string;
}
