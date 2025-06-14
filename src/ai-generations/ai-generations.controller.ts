import { Body, Controller, Post, UseGuards, Req, Get, Param } from '@nestjs/common';
import { AiGenerationsService } from './ai-generations.service';
import { MultiImageDto } from './dto/multi-image.dto';
import { ProfessionalPhotoDto } from './dto/professional-photo.dto';
import { ChangeHairstyleDto } from './dto/change-hairstyle.dto';
import { UpscaleImageDto } from './dto/upscale-image.dto';
import { TextToVideoDto } from './dto/text-to-video.dto';
import { ImageToVideoDto } from './dto/image-to-video.dto';
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
  @RequireCredits(10, CreditType.GENERATION_CREDITS)
  async generateMultiImage(
    @Body() multiImageDto: MultiImageDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      10,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateMultiImage(multiImageDto);
  }

  @Post('professional-photo')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(10, CreditType.GENERATION_CREDITS)
  async generateProfessionalPhoto(
    @Body() professionalPhotoDto: ProfessionalPhotoDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      10,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateProfessionalPhoto(
      professionalPhotoDto,
    );
  }

  @Post('change-hairstyle')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(7, CreditType.GENERATION_CREDITS)
  async changeHairstyle(
    @Body() changeHairstyleDto: ChangeHairstyleDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      7,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.changeHairstyle(
      changeHairstyleDto,
      req.user.userId,
    );
  }

  @Post('upscale-image')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(10, CreditType.GENERATION_CREDITS) // Higher quality costs more credits
  async upscaleImage(
    @Body() upscaleImageDto: UpscaleImageDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    // Deduct credits after successful generation
    await this.creditService.deductCredits(
      req.user.userId,
      10,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.upscaleImage(upscaleImageDto);
  }

  @Post('logo')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(150, CreditType.GENERATION_CREDITS)
  async generateLogo(@Body() logoDto: LogoDto, @Req() req) {
    await this.creditService.deductCredits(
      req.user.userId,
      150,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateLogo(logoDto, req.user.userId);
  }

  @Post('text-to-video')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(200, CreditType.GENERATION_CREDITS)
  async generateTextToVideo(
    @Body() textToVideoDto: TextToVideoDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    await this.creditService.deductCredits(
      req.user.userId,
      200,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateTextToVideo(
      textToVideoDto,
      req.user.userId,
    );
  }

  @Post('image-to-video')
  @UseGuards(JwtAuthGuard, CheckCreditGuard)
  @RequireCredits(250, CreditType.GENERATION_CREDITS)
  async generateImageToVideo(
    @Body() imageToVideoDto: ImageToVideoDto,
    @Req() req,
  ): Promise<GenerationResponse> {
    await this.creditService.deductCredits(
      req.user.userId,
      250,
      CreditType.GENERATION_CREDITS,
    );
    return this.aiGenerationsService.generateImageToVideo(
      imageToVideoDto,
      req.user.userId,
    );
  }

  @Get('prediction/:id')
  @UseGuards(JwtAuthGuard)
  async checkPredictionStatus(@Param('id') predictionId: string) {
    return this.aiGenerationsService.checkPredictionStatus(predictionId);
  }
}
