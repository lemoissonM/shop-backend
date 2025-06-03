import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AiGenerationsModule } from '../ai-generations.module';
import { ConfigModule } from '@nestjs/config';

describe('AiGenerationsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AiGenerationsModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/POST ai-generations/multi-image (should return url)', () => {
    // This is a mock test, actual API calls would require real images and API key
    return request(app.getHttpServer())
      .post('/ai-generations/multi-image')
      .send({
        prompt: 'Test prompt',
        aspect_ratio: '1:1',
        input_image_1: 'https://example.com/image1.png',
        input_image_2: 'https://example.com/image2.png',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('url');
      });
  });

  it('/POST ai-generations/professional-photo (should return url)', () => {
    // This is a mock test, actual API calls would require real images and API key
    return request(app.getHttpServer())
      .post('/ai-generations/professional-photo')
      .send({
        gender: 'female',
        input_image: 'https://example.com/image.png',
        aspect_ratio: '1:1',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('url');
      });
  });

  it('/POST ai-generations/change-hairstyle (should return url)', () => {
    // This is a mock test, actual API calls would require real images and API key
    return request(app.getHttpServer())
      .post('/ai-generations/change-hairstyle')
      .send({
        haircut: 'Random',
        hair_color: 'Random',
        input_image: 'https://example.com/image.png',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('url');
      });
  });

  it('/POST ai-generations/upscale-image (should return url)', () => {
    // This is a mock test, actual API calls would require real images and API key
    return request(app.getHttpServer())
      .post('/ai-generations/upscale-image')
      .send({
        input_image: 'https://example.com/image.png',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('url');
      });
  });
}); 