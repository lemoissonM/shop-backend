import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateLLMMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class LLMMessageResponseDto {
  id: string;
  message: string;
  userId: string;
  status: string;
  result: any;
  createdAt: Date;
  updatedAt: Date;
} 