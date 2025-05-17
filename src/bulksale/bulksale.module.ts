import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulksaleService } from './bulksale.service';
import { BulksaleController } from './bulksale.controller';
import { BulkSale } from './bulksale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BulkSale])],
  controllers: [BulksaleController],
  providers: [BulksaleService],
  exports: [BulksaleService],
})
export class BulksaleModule {}
