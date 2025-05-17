import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BulkSale } from './bulksale.entity';
import { CreateBulksaleDto } from './dto/create-bulksale.dto';
import { UpdateBulksaleDto } from './dto/update-bulksale.dto';

@Injectable()
export class BulksaleService {
  constructor(
    @InjectRepository(BulkSale)
    private readonly bulksaleRepository: Repository<BulkSale>,
  ) {}

  async create(createBulksaleDto: CreateBulksaleDto): Promise<BulkSale> {
    const bulksale = this.bulksaleRepository.create(createBulksaleDto);
    const savedBulksale = await this.bulksaleRepository.save(bulksale);
    return savedBulksale;
  }

  async findAll(): Promise<BulkSale[]> {
    return this.bulksaleRepository.find();
  }

  async findOne(id: string): Promise<BulkSale | null> {
    return this.bulksaleRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateBulksaleDto: UpdateBulksaleDto,
  ): Promise<BulkSale | null> {
    const bulksale = await this.findOne(id);
    if (!bulksale) {
      throw new Error('Bulk sale not found');
    }
    await this.bulksaleRepository.update(id, updateBulksaleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.bulksaleRepository.delete(id);
  }
}
