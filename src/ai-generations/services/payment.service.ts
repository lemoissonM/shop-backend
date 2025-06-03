import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  AiGenerationPayment,
  PaymentStatus,
  PaymentType,
} from '../entities/payment.entity';
import { User } from '../../user/user.entity';
import { Shop } from '../../shop/shop.entity';
import { FlexPayService, ApiErrorResponse } from './flexpay.service';
import { PaymentRequestDto } from '../dto/payment-request.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(AiGenerationPayment)
    private paymentRepository: Repository<AiGenerationPayment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    private flexPayService: FlexPayService,
    private configService: ConfigService,
  ) {}

  // Helper function to calculate credits based on amount
  private calculateCredits(amount: number): number {
    // Example pricing: $10 = 100 credits, $20 = 225 credits, etc.
    // You can adjust this calculation as needed
    return Math.floor(amount * 100);
  }

  // Helper function to calculate tokens based on amount
  private calculateTokens(amount: number): number {
    // Example pricing: $10 = 1000 tokens
    return Math.floor(amount * 100);
  }

  private formatPhoneNumber(phone: string): string {
    const phoneNumber = phone.toString().replace(/\D/g, '').replace(/^0/, '');
    if (phoneNumber.startsWith('243')) {
      return '' + phoneNumber;
    }
    return '243' + phoneNumber;
  }

  // Create a new payment
  async createPayment(
    userId: string,
    paymentRequestDto: PaymentRequestDto,
  ): Promise<AiGenerationPayment> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let credits = 0;
    let tokens = 0;

    // Calculate credits or tokens based on payment type
    if (paymentRequestDto.type === PaymentType.CREDIT_PURCHASE) {
      credits = this.calculateCredits(paymentRequestDto.amount);
      if (credits === 0) {
        throw new BadRequestException(
          'Minimum payment amount for credits is $1',
        );
      }
    } else if (paymentRequestDto.type === PaymentType.TOKEN_PURCHASE) {
      tokens = this.calculateTokens(paymentRequestDto.amount);
      if (tokens === 0) {
        throw new BadRequestException(
          'Minimum payment amount for tokens is $1',
        );
      }
    } else if (paymentRequestDto.type === PaymentType.ONE_TIME_SHOP) {
      if (!paymentRequestDto.shopId) {
        throw new BadRequestException(
          'Shop ID is required for one-time shop payment',
        );
      }

      const shop = await this.shopRepository.findOne({
        where: { id: paymentRequestDto.shopId },
      });
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }
    }

    // Check if payment amount is a valid number
    if (isNaN(paymentRequestDto.amount) || paymentRequestDto.amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // Create the payment record
    const payment = this.paymentRepository.create({
      userId,
      amount: paymentRequestDto.amount,
      status: PaymentStatus.PENDING,
      type: paymentRequestDto.type,
      credits,
      tokens,
      shopId: paymentRequestDto.shopId,
      phoneNumber: paymentRequestDto.phoneNumber,
      currency: paymentRequestDto.currency || 'USD',
      metadata: {},
    });

    // Save the payment to get an ID
    const savedPayment = await this.paymentRepository.save(payment);

    try {
      // Call FlexPay service to initiate payment
      const flexPayResponse = await this.flexPayService.pay({
        amount: payment.amount.toString(),
        phone: this.formatPhoneNumber(payment.phoneNumber),
        reference: payment.id,
        currency: payment.currency,
      });

      // Update payment with FlexPay reference
      await this.paymentRepository.update(payment.id, {
        metadata: {
          flexPayOrderNumber: flexPayResponse.orderNumber,
          flexPayReference: flexPayResponse.reference,
        },
      });

      return {
        ...savedPayment,
        metadata: {
          ...savedPayment.metadata,
          flexPayOrderNumber: flexPayResponse.orderNumber,
          flexPayReference: flexPayResponse.reference,
        },
      };
    } catch (error) {
      // Mark payment as failed if FlexPay call fails
      let errorMessage = 'Failed to call FlexPay API';
      if (error instanceof ApiErrorResponse) {
        errorMessage = error.message;
      }

      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
        metadata: {
          error: errorMessage,
          orderNumber: error.orderNumber || null,
        } as any,
      });

      throw new BadRequestException(
        `Error while processing payment: ${errorMessage}`,
      );
    }
  }

  // Process webhook from payment provider
  async processWebhook(webhookData: any): Promise<any> {
    const { reference, status, bodyMetadata } = webhookData;

    // Find the payment by reference
    const payment = await this.paymentRepository.findOne({
      where: { id: reference },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: payment.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (status === '0') {
      // Payment successful
      await this.paymentRepository.update(reference, {
        status: PaymentStatus.COMPLETED,
        metadata: {
          ...payment.metadata,
          webhookData: bodyMetadata,
        },
      });

      // Update user's credits or tokens based on payment type
      if (payment.type === PaymentType.CREDIT_PURCHASE) {
        await this.userRepository.update(payment.userId, {
          generationCredits: user.generationCredits + payment.credits,
        });
      } else if (payment.type === PaymentType.TOKEN_PURCHASE) {
        await this.userRepository.update(payment.userId, {
          aiTokens: user.aiTokens + payment.tokens,
        });
      } else if (payment.type === PaymentType.ONE_TIME_SHOP && payment.shopId) {
        // Mark shop as having a one-time payment
        await this.shopRepository.update(payment.shopId, {
          hasOneTimePayment: true,
          oneTimePaymentAmount: payment.amount,
          oneTimePaymentDate: new Date(),
        });
      }

      return { message: 'Payment processed successfully', success: true };
    } else {
      // Payment failed
      await this.paymentRepository.update(reference, {
        status: PaymentStatus.FAILED,
        metadata: {
          ...payment.metadata,
          error: 'Payment failed',
          errorDetails: bodyMetadata,
        } as any,
      });

      return { message: 'Payment marked as failed', success: false };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string, userId: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Ensure the payment belongs to the user (unless they're an admin, which you'd need to check separately)
    if (payment.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    if (payment.metadata?.flexPayOrderNumber) {
      try {
        // Check payment status with FlexPay
        const status = await this.flexPayService.check(
          payment.metadata.flexPayOrderNumber,
        );
        if (status === 'success') {
          await this.paymentRepository.update(payment.id, {
            status: PaymentStatus.COMPLETED,
          });
        }
        return { status: payment.status };
      } catch (error) {
        let errorMessage = 'Error checking payment status';
        if (error instanceof ApiErrorResponse) {
          errorMessage = error.message;
        }
        throw new BadRequestException(`${errorMessage}`);
      }
    } else {
      return { status: payment.status };
    }
  }

  // Get user's remaining credits and tokens
  async getUserBalance(
    userId: string,
  ): Promise<{ generationCredits: number; aiTokens: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      generationCredits: user.generationCredits,
      aiTokens: user.aiTokens,
    };
  }
}
