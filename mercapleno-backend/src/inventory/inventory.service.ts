import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PoolConnection } from 'mysql2/promise';
import { MysqlService } from '../common/database/mysql.service';
import { RegisterMovementDto } from './dto/register-movement.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly db: MysqlService) {}

  async getProductsWithStock() {
    const sql = `
      SELECT p.id_productos AS id, p.nombre, p.precio, p.imagen,
             c.nombre AS categoria, COALESCE(s.stock, 0) AS stock
      FROM productos p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN stock_actual s ON p.id_productos = s.id_productos
      ORDER BY p.nombre ASC
    `;

    const [rows] = await this.db.query(sql);
    return rows;
  }

  async registerMovement(dto: RegisterMovementDto, userId?: number) {
    const id_mov_db = dto.tipo_movimiento === 'ENTRADA' ? 2 : 3;
    const id_usuario = Number.isFinite(Number(userId)) ? Number(userId) : 1;

    let connection: PoolConnection | null = null;

    try {
      connection = await this.db.getConnection();
      await connection.beginTransaction();

      if (dto.tipo_movimiento === 'ENTRADA') {
        await connection.execute(
          `
            INSERT INTO entrada_productos
            (id_productos, cantidad, fecha, observaciones, id_documento, id_usuario, id_movimiento)
            VALUES (?, ?, NOW(), ?, ?, ?, ?)
          `,
          [dto.id_producto, dto.cantidad, dto.comentario || null, dto.id_documento, id_usuario, id_mov_db],
        );

        await connection.execute(
          'UPDATE stock_actual SET stock = stock + ? WHERE id_productos = ?',
          [dto.cantidad, dto.id_producto],
        );
      } else {
        const [[stockRow]] = await connection.query<any[]>(
          'SELECT stock FROM stock_actual WHERE id_productos = ? FOR UPDATE',
          [dto.id_producto],
        );

        if (!stockRow || stockRow.stock < dto.cantidad) {
          throw new BadRequestException({ error: 'Stock insuficiente para registrar salida' });
        }

        await connection.execute(
          `
            INSERT INTO salida_productos
            (id_productos, cantidad, fecha, id_documento, id_usuario, id_movimiento)
            VALUES (?, ?, NOW(), ?, ?, ?)
          `,
          [dto.id_producto, dto.cantidad, dto.id_documento, id_usuario, id_mov_db],
        );

        await connection.execute(
          'UPDATE stock_actual SET stock = stock - ? WHERE id_productos = ?',
          [dto.cantidad, dto.id_producto],
        );
      }

      await connection.commit();
      return { message: 'Movimiento registrado con exito' };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({ error: 'No se pudo registrar el movimiento' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}
