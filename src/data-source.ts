import { DataSource } from 'typeorm';
import { Product } from './product/product.entity';
import { Purchase } from './purchase/purchase.entity';
import { Sale } from './sale/sale.entity';
import { BulkSale } from './bulksale/bulksale.entity';
import { Config } from './config/config.entity';
import { Tax } from './tax/tax.entity';
import { Shop } from './shop/shop.entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123',
  database: 'shop',
  entities: [Product, Purchase, Sale, BulkSale, Config, Tax, Shop],
  migrations: ['dist/migrations/*.js'],
});
