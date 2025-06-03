import { IsOptional, IsString } from 'class-validator';

export class LogoDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  symbols: string;

  @IsOptional()
  @IsString()
  background: string;

  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  company_slogan: string;
}
