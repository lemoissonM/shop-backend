import { IsString, IsNumber } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  shopId: string;

  @IsString()
  productId: string;

  @IsNumber()
  date: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  quantity: number;

  @IsString()
  status: string;
}
