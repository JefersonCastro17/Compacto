import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  id_metodo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  metodo_pago?: number;
}
