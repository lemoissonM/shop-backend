import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const purchase = this.purchaseRepository.create(createPurchaseDto);
    const savedPurchase = await this.purchaseRepository.save(purchase);
    return savedPurchase;
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchaseRepository.find();
  }

  async findOne(id: string): Promise<Purchase | null> {
    return this.purchaseRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase | null> {
    const purchase = await this.findOne(id);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    await this.purchaseRepository.update(id, updatePurchaseDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.purchaseRepository.delete(id);
  }
}
