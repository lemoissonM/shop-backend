import { IsString, IsNumber, IsArray } from 'class-validator';
import { BulkPurchaseCost, BulkPurchaseItem } from '../purchase.entity';

export class CreatePurchaseDto {
  @IsString()
  id: string;

  @IsString()
  shopId: string;

  @IsNumber()
  date: number;

  @IsArray()
  costs: BulkPurchaseCost[];

  @IsNumber()
  totalCost: number;

  @IsString()
  status: string;

  @IsArray()
  items: BulkPurchaseItem[];
}
