import { IsString, IsNumber, IsIn } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  id: string;

  @IsString()
  shopId: string;

  @IsString()
  name: string;

  @IsNumber()
  percentage: number;

  @IsIn(['fixed', 'percent'])
  type: 'fixed' | 'percent';
}
