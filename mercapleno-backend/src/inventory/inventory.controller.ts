import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { RegisterMovementDto } from './dto/register-movement.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Movimientos')
@ApiBearerAuth()
@Controller('movimientos')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('productos')
  @ApiOperation({ summary: 'Obtener productos con stock actual' })
  getProductsWithStock() {
    return this.inventoryService.getProductsWithStock();
  }

  @Post('registrar')
  @ApiOperation({ summary: 'Registrar movimiento de inventario' })
  registerMovement(@Body() dto: RegisterMovementDto, @CurrentUser() user?: AuthUser) {
    return this.inventoryService.registerMovement(dto, user?.id);
  }
}
