import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { MultiImageDto } from './dto/multi-image.dto';
import { ProfessionalPhotoDto } from './dto/professional-photo.dto';
import { ChangeHairstyleDto } from './dto/change-hairstyle.dto';
import { UpscaleImageDto } from './dto/upscale-image.dto';
import { GenerationResponse } from './interfaces/generation-response.interface';
import { ConfigService } from '@nestjs/config';
import { multiImagePrompt } from './prompt';
import { LogoDto } from './dto/logo.dto';
import OpenAI from 'openai';

@Injectable()
export class AiGenerationsService {
  private apiToken: string;
  private baseUrl = 'https://api.replicate.com/v1/models';
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('REPLICATE_API_TOKEN');
    if (!token) {
      throw new Error('REPLICATE_API_TOKEN is not defined');
    }
    this.apiToken = token;
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  private async callReplicateApi(model: string, input: any): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}/predictions`,
        { input },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            Prefer: 'wait',
          },
        },
      );

      // Return the output URL from the response
      return response.data.output;
    } catch (error) {
      console.error(
        'Error calling Replicate API:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async generateMultiImage(
    multiImageDto: MultiImageDto,
  ): Promise<GenerationResponse> {
    const { type, aspect_ratio, input_image_1, input_image_2 } = multiImageDto;

    const prompt = multiImagePrompt(type);

    const output = await this.callReplicateApi(
      'flux-kontext-apps/multi-image-kontext',
      {
        prompt,
        aspect_ratio: aspect_ratio || '1:1',
        input_image_1,
        input_image_2,
      },
    );

    // If you want to save the file locally
    // const fileName = `multi-image-${Date.now()}.png`;
    // const filePath = join(process.cwd(), 'uploads', fileName);
    // await writeFile(filePath, output);

    return {
      url: output,
    };
  }

  async generateProfessionalPhoto(
    professionalPhotoDto: ProfessionalPhotoDto,
  ): Promise<GenerationResponse> {
    const { gender, input_image, aspect_ratio } = professionalPhotoDto;

    const output = await this.callReplicateApi(
      'flux-kontext-apps/professional-headshot',
      {
        gender: gender.toLowerCase(),
        input_image,
        aspect_ratio: aspect_ratio || '1:1',
      },
    );

    // If you want to save the file locally
    // const fileName = `professional-photo-${Date.now()}.png`;
    // const filePath = join(process.cwd(), 'uploads', fileName);
    // await writeFile(filePath, output);

    return {
      url: output,
    };
  }

  async changeHairstyle(
    changeHairstyleDto: ChangeHairstyleDto,
  ): Promise<GenerationResponse> {
    const { haircut, hair_color, input_image } = changeHairstyleDto;
    console.log(haircut, hair_color, input_image);
    try {
      const output = await this.callReplicateApi(
        'flux-kontext-apps/change-haircut',
        {
          haircut: haircut || 'Random',
          hair_color: hair_color || 'Random',
          input_image,
        },
      );

      return {
        url: output,
      };
    } catch (error) {
      console.error('Error calling Replicate API:', error);
      throw new InternalServerErrorException(
        'Error calling Replicate API: ' + error.message,
      );
    }
  }

  async upscaleImage(
    upscaleImageDto: UpscaleImageDto,
  ): Promise<GenerationResponse> {
    const { input_image } = upscaleImageDto;

    try {
      const output = await this.callReplicateApi(
        'flux-kontext-apps/restore-image',
        {
          input_image,
        },
      );

      return {
        url: output,
      };
    } catch (error) {
      console.error('Error calling Replicate API:', error);
      throw new InternalServerErrorException(
        'Error calling Replicate API: ' + error.message,
      );
    }
  }

  async generateLogo(logoDto: LogoDto) {
    const { prompt, type, symbols, background, company_name, company_slogan } =
      logoDto;

    // return {urls:[
    //   'https://replicate.delivery/xezq/QJBerPdHIc3FXyvdr3tGdzUUfbojiGBOdcuyZ8o3n0iweinpA/tmpiwtbqz5z.svg',
    //   'https://replicate.delivery/xezq/7xfNX1EK3gWIWa5TG35pNRtV7zx7BfGG97Cdgn1gB6YxeinpA/tmpv36m_y3d.svg',
    //   'https://replicate.delivery/xezq/p3TMQgBqP0JgHBiCcseuu8z1ksPf8a9zR93Q0zbE7OpweinpA/tmpkwag470u.svg',
    // ]};

    const promptResult = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a logo generator. You will be given a prompt and you will generate a logo for the prompt.
                    if symbol is provided, describe it in a creative way for a logo.
                    if company type is provided, ensure it's included in the logo description.
                    Ensure that the whole company name is included 
                    examples: 
                    - a portrait of a cute red panda using a laptop, the poster has the title "Red panda is Recraft v3", against a red background
                    - a logo for a technology company called "Recraft" with the slogan "Recrafting the future" and the type of logo is "text" and the symbols are "R" and the background is "white"
                    - a logo for a technology company called "Harvela Company" with the slogan "Harvela is a tech company" and the type of logo is "text" and the symbols are "H" with circuits and the background is "white"
                    - a logo of an online restaurant called "Petit Plat" with a fork and plate in it
                  
                  Reply with only the logo prompt, no other text. all in english.
          `,
        },
        {
          role: 'user',
          content: `
           Company name : ${company_name}
                    ${company_slogan ? `Company slogan : ${company_slogan}` : ''}
                    ${type ? `Type of company : ${type}` : ''}
                    ${symbols ? `Symbols : ${symbols}` : ''}
                    ${background ? `Background : ${background}` : ''}
                    ${prompt ? `Description : ${prompt}` : ''}
          `,
        },
      ],
      max_completion_tokens: 2000,
    });

    console.log(promptResult.choices[0].message.content);

    const output = await Promise.all([
      this.callReplicateApi('recraft-ai/recraft-v3-svg', {
        prompt: promptResult.choices[0].message.content,
      }),
      this.callReplicateApi('recraft-ai/recraft-v3-svg', {
        prompt: promptResult.choices[0].message.content,
      }),
      this.callReplicateApi('recraft-ai/recraft-v3-svg', {
        prompt: promptResult.choices[0].message.content,
      }),
    ]);

    return {
      urls: output,
    };
  }
}
