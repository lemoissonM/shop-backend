import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LLMMessage } from './llmMessage.entity';
import { LLMMessageService } from './llmMessage.service';
import { LLMMessageController } from './llmMessage.controller';
import { ProductModule } from 'src/product/product.module';
import { ShopModule } from 'src/shop/shop.module';

@Module({
  imports: [TypeOrmModule.forFeature([LLMMessage]), ShopModule, ProductModule],
  providers: [LLMMessageService],
  controllers: [LLMMessageController],
  exports: [LLMMessageService],
})
export class LLMMessageModule {} 