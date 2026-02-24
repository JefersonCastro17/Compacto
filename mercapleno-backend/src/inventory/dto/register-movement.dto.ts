import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RegisterMovementDto {
  @ApiProperty()
  @IsInt()
  id_producto: number;

  @ApiProperty({ enum: ['ENTRADA', 'SALIDA'] })
  @IsString()
  @IsIn(['ENTRADA', 'SALIDA'])
  tipo_movimiento: 'ENTRADA' | 'SALIDA';

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty()
  @IsString()
  id_documento: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comentario?: string;
}
