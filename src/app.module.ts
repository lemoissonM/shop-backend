import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { PurchaseModule } from './purchase/purchase.module';
import { SaleModule } from './sale/sale.module';
import { BulksaleModule } from './bulksale/bulksale.module';
import { ConfigModule } from './config/config.module';
import { TaxModule } from './tax/tax.module';
import { ShopModule } from './shop/shop.module';
import { SyncGateway } from './sync.gateway';
import { ProductService } from './product/product.service';
import { PurchaseService } from './purchase/purchase.service';
import { SaleService } from './sale/sale.service';
import { BulksaleService } from './bulksale/bulksale.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { Product } from './product/product.entity';
import { Sale } from './sale/sale.entity';
import { Purchase } from './purchase/purchase.entity';
import { BulkSale } from './bulksale/bulksale.entity';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'shop',
      autoLoadEntities: true,
      synchronize: true,
    }),
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    PurchaseModule,
    SaleModule,
    BulksaleModule,
    ConfigModule,
    TaxModule,
    ShopModule,
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([Product, Sale, Purchase, BulkSale]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SyncGateway,
    ProductService,
    PurchaseService,
    SaleService,
    BulksaleService,
  ],
})
export class AppModule {}
