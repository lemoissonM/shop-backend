import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface PawaPayDepositRequest {
  amount: string;
  country: string; // e.g., 'ZMB'
  currency: string; // e.g., 'ZMW'
  correspondent: string; // e.g., 'MTN_MOMO_ZMB'
  payer: {
    type: 'MSISDN';
    address: {
      value: string; // phone number
    };
  };
  statementDescription: string;
}

@Injectable()
export class PawaPayService {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('PAWAPAY_BASE_URL') ||
      'https://api.sandbox.pawapay.io';
    this.apiToken = this.configService.get<string>('PAWAPAY') || '';
  }

  private getHeaders() {
    console.log(this.apiToken);
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`,
    };
  }

  async requestDeposit(
    depositData: PawaPayDepositRequest,
  ): Promise<{ depositId: string; status: string }> {
    const depositId = uuidv4();
    const payload = {
      depositId,
      ...depositData,
      customerTimestamp: new Date().toISOString(),
    };

    console.log(payload);

    try {
      const response = await axios.post(`${this.baseUrl}/deposits`, payload, {
        headers: this.getHeaders(),
      });

      if (
        response.data.status === 'REJECTED' ||
        response.data.status === 'DUPLICATE_IGNORED'
      ) {
        throw new HttpException(
          `PawaPay deposit rejected: ${response.data.rejectionReason || 'Unknown reason'}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data;
    } catch (error) {
      console.log(error) //['PawaPay deposit rejected']);
      const errorMessage =
        error.response?.data?.message || error.message || 'PawaPay API error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkDepositStatus(depositId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/deposits/${depositId}`,
        {
          headers: this.getHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error checking PawaPay deposit status';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
