import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingRegistration } from './trainings.entity';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { PawaPayService } from '../ai-generations/services/pawapay.service';
import { AiGenerationPayment } from 'src/ai-generations/entities/payment.entity';
import { AiGenerationsModule } from 'src/ai-generations/ai-generations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingRegistration, AiGenerationPayment]),
    AiGenerationsModule,
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService, PawaPayService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
