import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { productos_estado } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { deleteStoredProductImage } from './product-image-upload.util';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productos.findMany({
      orderBy: { id_productos: 'asc' },
    });
  }

  async create(dto: CreateProductDto, uploadedImagePath?: string) {
    const normalizedImage = this.normalizeImagePath(uploadedImagePath ?? dto.imagen);

    try {
      const product = await this.prisma.productos.create({
        data: {
          nombre: dto.nombre,
          precio: dto.precio,
          id_categoria: dto.id_categoria,
          id_proveedor: dto.id_proveedor,
          descripcion: dto.descripcion || null,
          estado: this.mapEstado(dto.estado),
          imagen: normalizedImage,
        },
      });

      return {
        message: 'Producto agregado correctamente',
        id: product.id_productos,
      };
    } catch (error) {
      if (uploadedImagePath) {
        deleteStoredProductImage(uploadedImagePath);
      }

      throw error;
    }
  }

  async update(id: number, dto: UpdateProductDto, uploadedImagePath?: string) {
    const existing = await this.prisma.productos.findUnique({
      where: { id_productos: id },
      select: { id_productos: true, imagen: true },
    });

    if (!existing) {
      if (uploadedImagePath) {
        deleteStoredProductImage(uploadedImagePath);
      }

      throw new NotFoundException({ message: 'Producto no encontrado' });
    }

    const nextImage =
      uploadedImagePath !== undefined
        ? this.normalizeImagePath(uploadedImagePath)
        : dto.imagen !== undefined
          ? this.normalizeImagePath(dto.imagen)
          : undefined;

    try {
      await this.prisma.productos.update({
        where: { id_productos: id },
        data: {
          ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
          ...(dto.precio !== undefined ? { precio: dto.precio } : {}),
          ...(dto.id_categoria !== undefined ? { id_categoria: dto.id_categoria } : {}),
          ...(dto.id_proveedor !== undefined ? { id_proveedor: dto.id_proveedor } : {}),
          ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion || null } : {}),
          ...(dto.estado !== undefined ? { estado: this.mapEstado(dto.estado) } : {}),
          ...(nextImage !== undefined ? { imagen: nextImage } : {}),
        },
      });
    } catch (error) {
      if (uploadedImagePath) {
        deleteStoredProductImage(uploadedImagePath);
      }

      throw error;
    }

    if (uploadedImagePath && existing.imagen && existing.imagen !== uploadedImagePath) {
      deleteStoredProductImage(existing.imagen);
    }

    return { message: 'Producto actualizado correctamente' };
  }

  async remove(id: number) {
    const existing = await this.prisma.productos.findUnique({
      where: { id_productos: id },
      select: { id_productos: true, imagen: true },
    });

    if (!existing) {
      throw new NotFoundException({ message: 'Producto no encontrado' });
    }

    await this.prisma.productos.delete({
      where: { id_productos: id },
    });

    deleteStoredProductImage(existing.imagen);

    return { message: 'Producto eliminado correctamente' };
  }

  private normalizeImagePath(imagePath?: string | null) {
    if (typeof imagePath !== 'string') {
      return null;
    }

    const normalized = imagePath.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private mapEstado(estado: string): productos_estado {
    const normalized = estado.trim().toLowerCase();

    if (normalized === 'disponible') return productos_estado.Disponible;
    if (normalized === 'agotado') return productos_estado.Agotado;

    throw new BadRequestException('Estado de producto invalido');
  }
}
