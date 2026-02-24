import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UsersAdminService } from './users-admin.service';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersAdminService: UsersAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios administrativos' })
  findAll() {
    return this.usersAdminService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() dto: CreateUserAdminDto) {
    return this.usersAdminService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(@Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    return this.usersAdminService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  remove(@Param('id') id: string) {
    return this.usersAdminService.remove(id);
  }
}
