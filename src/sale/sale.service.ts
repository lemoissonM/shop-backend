import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const sale = this.saleRepository.create(createSaleDto);
    const savedSale = await this.saleRepository.save(sale);
    return savedSale;
  }

  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find();
  }

  async findOne(id: string): Promise<Sale | null> {
    return this.saleRepository.findOneBy({ id });
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale | null> {
    const sale = await this.findOne(id);
    if (!sale) {
      throw new Error('Sale not found');
    }
    await this.saleRepository.update(id, updateSaleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.saleRepository.delete(id);
  }
}
