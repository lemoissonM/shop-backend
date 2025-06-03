import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { JwtAuthGuard } from './guards/mock-jwt-auth.guard';

@Controller('ai-generations/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Req() req,
    @Body() paymentRequestDto: PaymentRequestDto,
  ) {
    return this.paymentService.createPayment(req.user.id, paymentRequestDto);
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: any) {
    return this.paymentService.processWebhook(webhookData);
  }

  @Get('status/:id')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Req() req, @Param('id') paymentId: string) {
    return this.paymentService.getPaymentStatus(paymentId, req.user.id);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getUserBalance(@Req() req) {
    return this.paymentService.getUserBalance(req.user.id);
  }
}
