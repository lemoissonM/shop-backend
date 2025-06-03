import { Test, TestingModule } from '@nestjs/testing';
import { AiGenerationsService } from './ai-generations.service';

describe('AiGenerationsService', () => {
  let service: AiGenerationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiGenerationsService],
    }).compile();

    service = module.get<AiGenerationsService>(AiGenerationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
