import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { MultiImageDto } from './dto/multi-image.dto';
import { ProfessionalPhotoDto } from './dto/professional-photo.dto';
import { ChangeHairstyleDto } from './dto/change-hairstyle.dto';
import { UpscaleImageDto } from './dto/upscale-image.dto';
import { TextToVideoDto } from './dto/text-to-video.dto';
import { ImageToVideoDto } from './dto/image-to-video.dto';
import { GenerationResponse } from './interfaces/generation-response.interface';
import { ConfigService } from '@nestjs/config';
import { multiImagePrompt } from './prompt';
import { LogoDto } from './dto/logo.dto';
import OpenAI from 'openai';
import { join } from 'path';
import * as fs from 'fs';

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

  private async createPrediction(model: string, input: any): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}/predictions`,
        { input },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Return the prediction ID
      return response.data.id;
    } catch (error) {
      console.error(
        'Error creating prediction:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async checkPredictionStatus(predictionId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error checking prediction status:',
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
    userId: string,
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

      // download the output and save it to /public/images
      const response = await axios.get(output, { responseType: 'stream' });
      const fileName = `${userId}-${Date.now()}.png`;
      const filePath = join(process.cwd(), 'public', 'images', fileName);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return {
        url: `${process.env.BACKEND || 'http://localhost:8001'}/images/${fileName}`,
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

  async generateLogo(logoDto: LogoDto, userId: string) {
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
          content: `You are an elite brand designer specializing in luxury and iconic logo creation for global brands. For each prompt, craft a highly detailed, modern, and visually striking logo description that embodies the company's unique identity at the highest level, akin to the design work for brands like LVMH, Lamborghini, or Apple.

Requirements for each logo prompt:

If symbols are provided, reinterpret them in a sophisticated, creative, and visually impactful way suitable for a world-class logo.
If a company type or industry is given, ensure the logo style, mood, and details resonate deeply with that sector.
Always include the full company name clearly within the logo description.
If a slogan is provided, describe how it is stylishly incorporated.
State the logo type (e.g., wordmark, emblem, monogram, pictorial mark) only if specified.
Assume premium, minimalism, and timelessness unless otherwise indicated.
Describe the color palette and background, emphasizing harmony and modern aesthetic.
make it consize.
Maintain simplicity and elegance. Do not add flours, complex forms, or unnecessary details.
no more than 50 words.
Focus on unique and memorable details that set the brand apart at a global level.
Reply only with the highly refined logo prompt in English, no additional explanations or introductory text.
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
        prompt: `${promptResult.choices[0].message.content}
        Do not add frames or background.
        Just symbols.
        Modern , elegant and luxury.
        `,
      }),
      this.callReplicateApi('recraft-ai/recraft-v3-svg', {
        prompt: `${promptResult.choices[0].message.content}
        branding for rich people.
        Just symbols.
        Well spaced. 
        Minimalist.
        `,
      }),
      this.callReplicateApi('recraft-ai/recraft-v3-svg', {
        prompt: `${promptResult.choices[0].message.content}
        Simple frames .
        artist drawing. 
        Minimalist.
        `,
      }),
    ]);

    const urls: string[] = [];
    // download outputs and save them to /public/logos
    for (const url of output) {
      const response = await axios.get(url, { responseType: 'stream' });
      const fileName = `${userId}-me-${Date.now()}.svg`;
      const filePath = join(process.cwd(), 'public', 'logos', fileName);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      urls.push(
        `${process.env.BACKEND || 'http://localhost:8001'}/logos/${fileName}`,
      );
    }

    // return the urls
    return {
      urls,
    };
  }

  async generateTextToVideo(
    textToVideoDto: TextToVideoDto,
    userId: string,
  ): Promise<GenerationResponse> {
    const { prompt, end_image } = textToVideoDto;

    try {
      const input: any = { prompt };
      if (end_image) {
        input.end_image = end_image;
      }

      const output = await this.callReplicateApi('kwaivgi/kling-v1.6-pro', input);

      // Download the output and save it to /public/videos
      const response = await axios.get(output, { responseType: 'stream' });
      const fileName = `${userId}-text-to-video-${Date.now()}.mp4`;
      const filePath = join(process.cwd(), 'public', 'videos', fileName);
      
      // Ensure the directory exists
      const dir = join(process.cwd(), 'public', 'videos');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return {
        url: `${process.env.BACKEND || 'http://localhost:8001'}/videos/${fileName}`,
      };
    } catch (error) {
      console.error('Error generating text to video:', error);
      throw new InternalServerErrorException(
        'Error generating text to video: ' + error.message,
      );
    }
  }

  async generateImageToVideo(
    imageToVideoDto: ImageToVideoDto,
    userId: string,
  ): Promise<GenerationResponse> {
    const { prompt, start_image, end_image } = imageToVideoDto;

    try {
      const input: any = { prompt, start_image };
      if (end_image) {
        input.end_image = end_image;
      }

      const output = await this.callReplicateApi('kwaivgi/kling-v1.6-pro', input);

      // Download the output and save it to /public/videos
      const response = await axios.get(output, { responseType: 'stream' });
      const fileName = `${userId}-image-to-video-${Date.now()}.mp4`;
      const filePath = join(process.cwd(), 'public', 'videos', fileName);
      
      // Ensure the directory exists
      const dir = join(process.cwd(), 'public', 'videos');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return {
        url: `${process.env.BACKEND || 'http://localhost:8001'}/videos/${fileName}`,
      };
    } catch (error) {
      console.error('Error generating image to video:', error);
      throw new InternalServerErrorException(
        'Error generating image to video: ' + error.message,
      );
    }
  }
}
