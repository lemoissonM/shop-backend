import { PartialType } from '@nestjs/mapped-types';
import { CreateBulksaleDto } from './create-bulksale.dto';

export class UpdateBulksaleDto extends PartialType(CreateBulksaleDto) {}
