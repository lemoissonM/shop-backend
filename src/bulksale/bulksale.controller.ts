import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BulksaleService } from './bulksale.service';
import { CreateBulksaleDto } from './dto/create-bulksale.dto';
import { UpdateBulksaleDto } from './dto/update-bulksale.dto';

@Controller('bulksale')
export class BulksaleController {
  constructor(private readonly bulksaleService: BulksaleService) {}

  @Post()
  create(@Body() createBulksaleDto: CreateBulksaleDto) {
    return this.bulksaleService.create(createBulksaleDto);
  }

  @Get()
  findAll() {
    return this.bulksaleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bulksaleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBulksaleDto: UpdateBulksaleDto,
  ) {
    return this.bulksaleService.update(id, updateBulksaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bulksaleService.remove(id);
  }
}
