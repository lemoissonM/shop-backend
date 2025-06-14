import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ValidationPipe,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async createRegistration(
    @Body(ValidationPipe) createRegistrationDto: CreateRegistrationDto,
    @Req() req,
  ) {
    return this.trainingsService.createRegistration(
      createRegistrationDto,
      req.user.userId,
    );
  }

  @Get(':id')
  async getRegistration(@Param('id') id: string) {
    return this.trainingsService.getRegistration(id);
  }

  @Get()
  async getAllRegistrations() {
    return this.trainingsService.getAllRegistrations();
  }
}
