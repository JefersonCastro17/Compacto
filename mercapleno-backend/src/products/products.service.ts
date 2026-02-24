import { Injectable, NotFoundException } from '@nestjs/common';
import { productos_estado } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productos.findMany({
      orderBy: { id_productos: 'asc' },
    });
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.productos.create({
      data: {
        nombre: dto.nombre,
        precio: dto.precio,
        id_categoria: dto.id_categoria,
        id_proveedor: dto.id_proveedor,
        descripcion: dto.descripcion || null,
        estado: this.mapEstado(dto.estado),
        imagen: dto.imagen || null,
      },
    });

    return {
      message: 'Producto agregado correctamente',
      id: product.id_productos,
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.prisma.productos.findUnique({
      where: { id_productos: id },
      select: { id_productos: true },
    });

    if (!existing) {
      throw new NotFoundException({ message: 'Producto no encontrado' });
    }

    await this.prisma.productos.update({
      where: { id_productos: id },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
        ...(dto.precio !== undefined ? { precio: dto.precio } : {}),
        ...(dto.id_categoria !== undefined ? { id_categoria: dto.id_categoria } : {}),
        ...(dto.id_proveedor !== undefined ? { id_proveedor: dto.id_proveedor } : {}),
        ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
        ...(dto.estado !== undefined ? { estado: this.mapEstado(dto.estado) } : {}),
        ...(dto.imagen !== undefined ? { imagen: dto.imagen } : {}),
      },
    });

    return { message: 'Producto actualizado correctamente' };
  }

  async remove(id: number) {
    const existing = await this.prisma.productos.findUnique({
      where: { id_productos: id },
      select: { id_productos: true },
    });

    if (!existing) {
      throw new NotFoundException({ message: 'Producto no encontrado' });
    }

    await this.prisma.productos.delete({
      where: { id_productos: id },
    });

    return { message: 'Producto eliminado correctamente' };
  }

  private mapEstado(estado: string): productos_estado {
    const normalized = estado.trim().toLowerCase();
    if (normalized === 'disponible') return productos_estado.Disponible;
    if (normalized === 'agotado') return productos_estado.Agotado;
    if (normalized === 'descontinuado') return productos_estado.Descontinuado;

    // La base tiene valor mapeado para "En tránsito".
    return productos_estado.En_transito;
  }
}
