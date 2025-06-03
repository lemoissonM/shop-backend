import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiGenerationsController } from './ai-generations.controller';
import { AiGenerationsService } from './ai-generations.service';
import { PaymentController } from './controllers/payment.controller';
import { FlexPayService } from './services/flexpay.service';
import { PaymentService } from './services/payment.service';
import { CreditService } from './services/credit.service';
import { AiGenerationPayment } from './entities/payment.entity';
import { User } from '../user/user.entity';
import { Shop } from '../shop/shop.entity';
import { CheckCreditGuard } from './guards/check-credit.guard';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AiGenerationPayment, User, Shop]),
    FileModule,
  ],
  controllers: [AiGenerationsController, PaymentController],
  providers: [
    AiGenerationsService,
    PaymentService,
    FlexPayService,
    CreditService,
    CheckCreditGuard,
  ],
  exports: [AiGenerationsService, PaymentService, CreditService],
})
export class AiGenerationsModule {}
