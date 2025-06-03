import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BASE_URL_CHECK = 'https://backend.flexpay.cd/api/rest/v1/check/';
const BASE_URL_PAY = 'https://backend.flexpay.cd/api/rest/v1/paymentService';

export class ApiErrorResponse extends Error {
  orderNumber: string | null;

  constructor(message: string, orderNumber: string | null = null) {
    super(message);
    this.orderNumber = orderNumber;
  }
}

interface FlexPayConfig {
  apiKey: string;
  webhookUrl: string;
  merchant: string;
}

interface PaymentRequest {
  amount: string;
  phone: string;
  reference: string;
  currency: string;
}

@Injectable()
export class FlexPayService {
  private readonly config: FlexPayConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('FLEX_PAY_API_KEY') || '',
      webhookUrl: this.configService.get<string>('FLEX_PAY_WEBHOOK_URL') || '',
      merchant: this.configService.get<string>('FLEX_PAY_MERCHANT') || '',
    };
  }

  async pay(request: PaymentRequest): Promise<any> {
    try {
      const response = await axios.post(
        BASE_URL_PAY,
        {
          merchant: this.config.merchant,
          type: '1',
          phone: request.phone,
          reference: request.reference,
          amount: request.amount,
          currency: request.currency,
          callbackUrl: this.config.webhookUrl,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
      );

      const responseBody = response.data;
      if (responseBody.code === '0') {
        console.log('api success');
        return responseBody;
      } else {
        throw new ApiErrorResponse(
          responseBody.message,
          responseBody.orderNumber,
        );
      }
    } catch (error) {
      console.log(error);
      throw new ApiErrorResponse(error.message);
    }
  }

  static parse(data: string): any {
    const response = JSON.parse(data);
    response.isSuccessFull = response.code === '0';
    return response;
  }

  async check(orderNumber: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL_CHECK}${orderNumber}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      const responseBody = response.data;
      if (responseBody.code === '0') {
        if (responseBody.transaction.status === '0') {
          return 'sucess';
        } else {
          return 'failed';
        }
      } else {
        return 'failed';
      }
    } catch (error) {
      throw new ApiErrorResponse(error.message);
    }
  }
}
