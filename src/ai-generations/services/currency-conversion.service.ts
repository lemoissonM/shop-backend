import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyConversionService {
  // In a production environment, these rates should be fetched from a reliable API.
  private rates = {
    USD: 1,
    UGX: 3800,
    CDF: 2800,
    KSH: 130,
    RWF: 1300,
  };

  /**
   * Returns the current exchange rates against USD.
   */
  getRates(): any {
    return this.rates;
  }

  /**
   * Converts an amount from a given currency to USD.
   * @param amount The amount to convert.
   * @param fromCurrency The currency to convert from.
   * @returns The equivalent amount in USD.
   */
  convertToUSD(amount: number, fromCurrency: string): number {
    const rate = this.rates[fromCurrency.toUpperCase()];
    if (!rate) {
      throw new Error(`Currency ${fromCurrency} is not supported.`);
    }
    if (fromCurrency.toUpperCase() === 'USD') {
      return amount;
    }
    return amount / rate;
  }

  convertToCurrency(amount: number, toCurrency: string): number {
    const rate = this.rates[toCurrency.toUpperCase()];
    if (!rate) {
      throw new Error(`Currency ${toCurrency} is not supported.`);
    }
    return amount * rate;
  }
}
