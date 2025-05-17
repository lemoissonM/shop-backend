import { IsString, IsNumber, IsIn } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  shopId: string;

  @IsString()
  name: string;

  @IsNumber()
  percentage: number;

  @IsIn(['fixed', 'percent'])
  type: 'fixed' | 'percent';
}
