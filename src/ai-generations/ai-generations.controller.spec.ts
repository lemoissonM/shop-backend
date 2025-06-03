import { Test, TestingModule } from '@nestjs/testing';
import { AiGenerationsController } from './ai-generations.controller';

describe('AiGenerationsController', () => {
  let controller: AiGenerationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiGenerationsController],
    }).compile();

    controller = module.get<AiGenerationsController>(AiGenerationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
