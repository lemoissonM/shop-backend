import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { correspondent } from '../services/correspondant';
import { CurrencyConversionService } from '../services/currency-conversion.service';

@Controller('ai-generations/payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly currencyService: CurrencyConversionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Req() req,
    @Body() paymentRequestDto: PaymentRequestDto,
  ) {
    return this.paymentService.createPayment(
      req.user.userId,
      paymentRequestDto,
    );
  }

  @Post('card')
  @UseGuards(JwtAuthGuard)
  async createPaymentWithCard(
    @Req() req,
    @Body() paymentRequestDto: PaymentRequestDto,
  ) {
    return this.paymentService.createWithFlexPayCard(
      paymentRequestDto,
      req.user,
    );
  }

  @Post('pawapay')
  @UseGuards(JwtAuthGuard)
  async createPawaPayPayment(
    @Req() req,
    @Body() paymentRequestDto: PaymentRequestDto,
  ) {
    return this.paymentService.createPawaPayPayment(
      req.user.userId,
      paymentRequestDto,
    );
  }

  @Post('pawapay/webhook')
  async handlePawaPayWebhook(@Body() webhookData: any) {
    return this.paymentService.pawaPayWebhook(webhookData);
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: any) {
    return this.paymentService.processWebhook(webhookData);
  }

  @Get('status/:id')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Req() req, @Param('id') paymentId: string) {
    return this.paymentService.getPaymentStatus(paymentId, req.user.userId);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getUserBalance(@Req() req) {
    return this.paymentService.getUserBalance(req.user.userId);
  }

  @Post('card/webhook')
  async cardWebhook(@Body() webhookData: any) {
    return this.paymentService.cardWebhook(webhookData);
  }

  @Get('pawapay/information')
  @UseGuards(JwtAuthGuard)
  getPawaPayInformation() {
    return {
      correspondent: correspondent,
      rates: this.currencyService.getRates(),
      countries: [
        { label: 'DR Congo', value: 'COD', code: '243' },
        { label: 'Rwanda', value: 'RWA', code: '250' },
        { label: 'Uganda', value: 'UGA', code: '256' },
        { label: 'Kenya', value: 'KEN', code: '254' },
      ],
    };
  }
}
