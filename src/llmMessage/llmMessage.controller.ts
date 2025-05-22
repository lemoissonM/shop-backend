import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { LLMMessageService } from './llmMessage.service';
import { LLMMessage } from './llmMessage.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLLMMessageDto } from './llmMessage.dto';

@Controller('llm-messages')
export class LLMMessageController {
  constructor(private readonly llmMessageService: LLMMessageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createMessageDto: CreateLLMMessageDto,
  ): Promise<LLMMessage> {
    const { userId, message } = createMessageDto;
    const llmMessage = await this.llmMessageService.create(userId, message);
    return this.llmMessageService.processMessage(llmMessage.id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUserId(@Param('userId') userId: string): Promise<LLMMessage[]> {
    return this.llmMessageService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<LLMMessage> {
    const message = await this.llmMessageService.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }
}
