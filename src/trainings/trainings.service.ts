import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingRegistration } from './trainings.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { PaymentService } from 'src/ai-generations/services/payment.service';
import {
  AiGenerationPayment,
  PaymentType,
} from 'src/ai-generations/entities/payment.entity';
import { PaymentRequestDto } from 'src/ai-generations/dto/payment-request.dto';
import { CurrencyConversionService } from 'src/ai-generations/services/currency-conversion.service';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectRepository(TrainingRegistration)
    private registrationRepository: Repository<TrainingRegistration>,
    private paymentService: PaymentService,
    private currencyConversionService: CurrencyConversionService,
  ) {}

  async createRegistration(
    createRegistrationDto: CreateRegistrationDto,
    userId: string,
  ): Promise<AiGenerationPayment> {
    try {
      // Create the registration
      const registration = this.registrationRepository.create({
        program: createRegistrationDto.program,
        country: createRegistrationDto.country,
        language: createRegistrationDto.language,
        phone: createRegistrationDto.phone,
        referral: createRegistrationDto.referral,
        name: createRegistrationDto.name,
        status: 'pending',
      });

      const savedRegistration =
        await this.registrationRepository.save(registration);

      const paymentRequestDto: PaymentRequestDto = {
        type: PaymentType.TRAINING_REGISTRATION,
        trainingRegistrationId: savedRegistration.id,
        amount: this.currencyConversionService.convertToCurrency(
          createRegistrationDto.program === 'aiDesignWeb' ? 49 : 55,
          createRegistrationDto.correspondent.currency || 'USD',
        ),
        phoneNumber: createRegistrationDto.phone,
      };

      const payment = await this.paymentService.createPayment(
        userId,
        paymentRequestDto,
      );

      savedRegistration.payment = payment;
      await this.registrationRepository.save(savedRegistration);

      return payment;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error creating registration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRegistration(id: string): Promise<TrainingRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['payment'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async getAllRegistrations(): Promise<TrainingRegistration[]> {
    return this.registrationRepository.find({
      relations: ['payment'],
      order: { createdAt: 'DESC' },
    });
  }
}
