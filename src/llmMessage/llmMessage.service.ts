/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LLMMessage } from './llmMessage.entity';
import OpenAI from 'openai';
import { ShopService } from 'src/shop/shop.service';
import { ProductService } from 'src/product/product.service';
import { systemPrompt } from './prompt';
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
    const productsForLlm = products.map(
      (product) =>
        `id: ${product.id.replace(shop.id + '-', '')} => name: ${product.name}`,
    );

    try {
      llmMessage.status = 'processing';
      await this.llmMessageRepository.save(llmMessage);

      const detectLang = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'LanguageDetector',
            schema: {
              type: 'object',
              properties: {
                language: {
                  type: 'string',
                },
              },
              required: ['language'],
            },
          },
        },
        messages: [
          {
            role: 'system',
            content: `You are a language detector. You will be given a message and you will need to detect the language of the message.
            output in json format 
            {
              "language": "string"
            }
            `,
          },
          {
            role: 'user',
            content: llmMessage.message,
          },
        ],
      });

      const language = JSON.parse(
        detectLang.choices[0].message.content || '{language: "en"}',
      ).language;

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
            content: systemPrompt(language),
          },
          {
            role: 'user',
            content: `
            user message: ${llmMessage.message}`,
          },
        ],
      });

      llmMessage.result = JSON.parse(
        response.choices[0].message.content || '{}',
      );

      const productsFromSaleOrPurchase = llmMessage.result.actions
        ? llmMessage.result.actions
            .filter(
              (action: any) =>
                action.type === 'sale' || action.type === 'purchase',
            )
            .map((action: any) => action.items)
            .map((item: any) => {
              return item.map((item: any) => {
                const name = Array.isArray(item) ? item[0].name : item.name;
                return {
                  name,
                };
              });
            })
            .flat()
        : [];

      console.log(productsFromSaleOrPurchase, 'productsFromSaleOrPurchase');

      if (productsFromSaleOrPurchase.length > 0) {
        const productMatcher = await this.openai.chat.completions.create({
          model: 'gpt-4.1-nano',
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'ProductMatcher',
              schema: {
                type: 'object',
                properties: {
                  products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string' },
                        name: { type: 'string' },
                        probability: { type: 'number' },
                        otherChoices: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                      required: [
                        'productId',
                        'name',
                        'probability',
                        'otherChoices',
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['products'],
                additionalProperties: false,
              },
            },
          },
          messages: [
            {
              role: 'system',
              content: `You are a product matcher, you can even translate the names.
              You are givea list of products with id and names below:
              ${JSON.stringify(productsForLlm)}
              You will be given a list of products with name  by the user. process each product name given against the list of products above.
              You return a json object with :
              {products: [{
                productId: "string", // the id of product from the list of products above
                name: "string", // the name of product from the list of products above
                probability: "number", // the probability of the product to be the same as the name given by the user
                otherChoices: "string[]", ids of other choices 
              }]}
              `,
            },
            {
              role: 'user',
              content: JSON.stringify(productsFromSaleOrPurchase),
            },
          ],
        });

        const productMatcherResult = JSON.parse(
          productMatcher.choices[0].message.content || '[]',
        );
        console.log(productMatcherResult, 'productMatcherResult');
        llmMessage.result.actions.map((action: any) => {
          const d = { ...action };
          for (const item of d.items) {
            const productId = productMatcherResult.products.find(
              (product: any) =>
                product.name === item.name && product.probability > 0.5,
            )?.productId;
            if (productId) {
              item.productId = productId;
            }
          }
          return d;
        });
      }

      console.log(llmMessage.result, 'llmMessage.result');

      llmMessage.status = 'completed';
      return this.llmMessageRepository.save(llmMessage);
    } catch (error) {
      console.log(error, 'error');
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
