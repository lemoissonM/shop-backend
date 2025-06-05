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
import { LLMMessageModule } from './llmMessage/llmMessage.module';
import { Product } from './product/product.entity';
import { Sale } from './sale/sale.entity';
import { Purchase } from './purchase/purchase.entity';
import { BulkSale } from './bulksale/bulksale.entity';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AiGenerationsModule } from './ai-generations/ai-generations.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [NestConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
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
    LLMMessageModule,
    TypeOrmModule.forFeature([Product, Sale, Purchase, BulkSale]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'supersecret'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
    AiGenerationsModule,
    FileModule,
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
