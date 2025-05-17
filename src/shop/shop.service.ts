import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    const shop = this.shopRepository.create(createShopDto);
    const savedShop = await this.shopRepository.save(shop);
    return savedShop;
  }

  async findAll(): Promise<Shop[]> {
    return this.shopRepository.find();
  }

  async findOne(id: string): Promise<Shop | null> {
    return this.shopRepository.findOneBy({ id });
  }

  async update(id: string, updateShopDto: UpdateShopDto): Promise<Shop | null> {
    const shop = await this.findOne(id);
    if (!shop) {
      throw new Error('Shop not found');
    }
    await this.shopRepository.update(id, updateShopDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.shopRepository.delete(id);
  }
}
