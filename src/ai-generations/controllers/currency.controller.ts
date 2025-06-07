import { Controller, Get } from '@nestjs/common';
import { CurrencyConversionService } from '../services/currency-conversion.service';

@Controller('ai-generations/currency')
export class CurrencyController {
  constructor(
    private readonly currencyConversionService: CurrencyConversionService,
  ) {}

  @Get('rates')
  getRates() {
    return this.currencyConversionService.getRates();
  }
}
