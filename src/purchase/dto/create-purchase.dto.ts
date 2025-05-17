import { IsString, IsNumber, IsObject } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  shopId: string;

  @IsString()
  productId: string;

  @IsNumber()
  date: number;

  @IsNumber()
  quantity: number;

  @IsObject()
  costs: Record<string, number>;

  @IsNumber()
  totalCost: number;

  @IsNumber()
  unitPrice: number;
}
