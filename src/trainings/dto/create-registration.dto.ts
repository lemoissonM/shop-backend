import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  program: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  referral?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  correspondent?: any;
}
