import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AiGenerationsService } from './ai-generations.service';
import { MultiImageDto } from './dto/multi-image.dto';
import { ProfessionalPhotoDto } from './dto/professional-photo.dto';
import { ChangeHairstyleDto } from './dto/change-hairstyle.dto';
import { UpscaleImageDto } from './dto/upscale-image.dto';
import { GenerationResponse } from './interfaces/generation-response.interface';
import {
  CheckCreditGuard,
  RequireCredits,
  CreditType,
} from './guards/check-credit.guard';
import { CreditService } from './services/credit.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LogoDto } from './dto/logo.dto';

@Controller('ai-generations')
export class AiGenerationsController {
  constructor(
    private readonly aiGenerationsService: AiGenerationsService,
    private readonly creditService: CreditService,
  ) {}

  @Post('multi-image')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(0.1, CreditType.GENERATION_CREDITS)
  async generateMultiImage(
    @Body() multiImageDto: MultiImageDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      0.1,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateMultiImage(multiImageDto);
  }

  @Post('professional-photo')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(1.5, CreditType.GENERATION_CREDITS)
  async generateProfessionalPhoto(
    @Body() professionalPhotoDto: ProfessionalPhotoDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      1.5,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateProfessionalPhoto(
      professionalPhotoDto,
    );
  }

  @Post('change-hairstyle')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(0.1, CreditType.GENERATION_CREDITS)
  async changeHairstyle(
    @Body() changeHairstyleDto: ChangeHairstyleDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      0.1,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.changeHairstyle(changeHairstyleDto);
  }

  @Post('upscale-image')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(0.1, CreditType.GENERATION_CREDITS) // Higher quality costs more credits
  async upscaleImage(
    @Body() upscaleImageDto: UpscaleImageDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      0.1,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.upscaleImage(upscaleImageDto);
  }

  @Post('logo')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(0.1, CreditType.GENERATION_CREDITS)
  async generateLogo(
    @Body() logoDto: LogoDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    await this.creditService.deductCredits(
      req.user.userId,
      0.1,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateLogo(logoDto);
  }
}
