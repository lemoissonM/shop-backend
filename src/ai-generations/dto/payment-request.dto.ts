import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PaymentType } from '../entities/payment.entity';

export class PaymentRequestDto {
  @IsNumber()
  amount: number;

  @IsString()
  phoneNumber: string;

  @IsEnum(PaymentType)
  type: PaymentType;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsString()
  @IsOptional()
  shopId?: string;

  @IsString()
  @IsOptional()
  correspondent?: {
    currency: string;
    network: string;
    country: string;
  };
}
