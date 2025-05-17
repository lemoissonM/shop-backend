import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tax } from './tax.entity';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async create(createTaxDto: CreateTaxDto): Promise<Tax> {
    const tax = this.taxRepository.create(createTaxDto);
    const savedTax = await this.taxRepository.save(tax);
    return savedTax;
  }

  async findAll(): Promise<Tax[]> {
    return this.taxRepository.find();
  }

  async findOne(id: string): Promise<Tax | null> {
    return this.taxRepository.findOneBy({ id });
  }

  async update(id: string, updateTaxDto: UpdateTaxDto): Promise<Tax | null> {
    const tax = await this.findOne(id);
    if (!tax) {
      throw new Error('Tax not found');
    }
    await this.taxRepository.update(id, updateTaxDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.taxRepository.delete(id);
  }
}
