import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LLMMessage } from './llmMessage.entity';
import OpenAI from 'openai';
import { json } from 'stream/consumers';
import { ShopService } from 'src/shop/shop.service';
import { ProductService } from 'src/product/product.service';
import { jsonSchema, systemPrompt } from './prompt';
@Injectable()
export class LLMMessageService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(LLMMessage)
    private readonly llmMessageRepository: Repository<LLMMessage>,
    private configService: ConfigService,
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async create(userId: string, message: string): Promise<LLMMessage> {
    const llmMessage = this.llmMessageRepository.create({
      userId,
      message,
      status: 'pending',
    });

    return this.llmMessageRepository.save(llmMessage);
  }

  async processMessage(id: string): Promise<LLMMessage> {
    const llmMessage = await this.llmMessageRepository.findOneBy({ id });
    if (!llmMessage) {
      throw new Error('Message not found');
    }
    const shop = await this.shopService.findByOwnerId(llmMessage.userId);

    if (!shop) {
      throw new Error('Shop not found');
    }

    const products = await this.productService.findByShopId(shop.id);
    // format for llm use : id: product.id => name: product.name, id: product.id => name
    const productsForLlm = products
      .map(
        (product) =>
          `id: ${product.id.replace(shop.id + '-', '')} => name: ${product.name}`,
      )
      .join(', ');

    console.log(productsForLlm, 'productsForLlm');

    try {
      llmMessage.status = 'processing';
      await this.llmMessageRepository.save(llmMessage);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        response_format: {
          type: 'json_object',
          //   json_schema: {
          //     name: 'ShopAssistantActionRoot',
          //     strict: true,
          //     schema: jsonSchema,
          //   },
        },
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Here are the products available: ${productsForLlm}
            user message: ${llmMessage.message}`,
          },
        ],
      });

      console.log(response.choices[0].message.content, 'response');

      llmMessage.result = JSON.parse(
        response.choices[0].message.content || '{}',
      );
      llmMessage.status = 'completed';
      return this.llmMessageRepository.save(llmMessage);
    } catch (error) {
      llmMessage.status = 'failed';
      llmMessage.result = { error: error.message };
      return this.llmMessageRepository.save(llmMessage);
    }
  }

  async findById(id: string): Promise<LLMMessage | null> {
    return this.llmMessageRepository.findOneBy({ id });
  }

  async findByUserId(userId: string): Promise<LLMMessage[]> {
    return this.llmMessageRepository.findBy({ userId });
  }
}
