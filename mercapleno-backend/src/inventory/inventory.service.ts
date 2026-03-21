import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PoolConnection } from 'mysql2/promise';
import { MysqlService } from '../common/database/mysql.service';
import { buildLowStockAlert, getLowStockMetadata, LowStockAlert } from '../common/stock/low-stock.util';
import { EmailService } from '../email/email.service';
import { RegisterMovementDto } from './dto/register-movement.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly db: MysqlService,
    private readonly emailService: EmailService,
  ) {}

  async getProductsWithStock() {
    const sql = `
      SELECT p.id_productos AS id, p.nombre, p.precio, p.imagen,
             c.nombre AS categoria, COALESCE(s.stock, 0) AS stock
      FROM productos p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN stock_actual s ON p.id_productos = s.id_productos
      ORDER BY p.nombre ASC
    `;

    const [rows] = await this.db.query<any[]>(sql);
    return rows.map((row: any) => {
      const stock = Number(row.stock || 0);
      const precio = Number(row.precio || 0);

      return {
        ...row,
        precio: Number.isFinite(precio) ? precio : 0,
        stock,
        ...getLowStockMetadata(stock),
      };
    });
  }

  async registerMovement(dto: RegisterMovementDto, userId?: number) {
    const id_mov_db = dto.tipo_movimiento === 'ENTRADA' ? 2 : 3;
    const id_usuario = Number.isFinite(Number(userId)) ? Number(userId) : 1;

    let connection: PoolConnection | null = null;
    let lowStockAlert: LowStockAlert | null = null;

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

        const [updateResult] = await connection.execute(
          'UPDATE stock_actual SET stock = stock + ? WHERE id_productos = ?',
          [dto.cantidad, dto.id_producto],
        );

        if ((updateResult as { affectedRows?: number }).affectedRows === 0) {
          throw new BadRequestException({
            error: 'No existe un registro de stock para el producto seleccionado',
          });
        }
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

        const [updateResult] = await connection.execute(
          'UPDATE stock_actual SET stock = stock - ? WHERE id_productos = ?',
          [dto.cantidad, dto.id_producto],
        );

        if ((updateResult as { affectedRows?: number }).affectedRows === 0) {
          throw new BadRequestException({
            error: 'No existe un registro de stock para el producto seleccionado',
          });
        }
      }

      const stockSnapshot = await this.getStockSnapshot(connection, dto.id_producto);
      if (stockSnapshot) {
        lowStockAlert = buildLowStockAlert(stockSnapshot.id, stockSnapshot.stock, stockSnapshot.nombre);
      }

      await connection.commit();

      if (lowStockAlert) {
        this.logger.log(
          `Se detecto stock bajo para producto ${lowStockAlert.productId} tras movimiento. Se intentara notificar por correo.`,
        );
        await this.notifyLowStockAdmins([lowStockAlert], 'registro de movimiento de inventario');
      }

      return {
        message: 'Movimiento registrado con exito',
        ...(lowStockAlert ? { warning: lowStockAlert } : {}),
      };
    } catch (error) {
      await this.rollbackSafely(connection, 'registerMovement', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `No se pudo registrar el movimiento: ${this.describeError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException({ error: 'No se pudo registrar el movimiento' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  private async getStockSnapshot(connection: PoolConnection, productId: number) {
    const [rows] = await connection.query<any[]>(
      `
        SELECT p.id_productos AS id, p.nombre, COALESCE(sa.stock, 0) AS stock
        FROM productos p
        LEFT JOIN stock_actual sa ON p.id_productos = sa.id_productos
        WHERE p.id_productos = ?
        LIMIT 1
      `,
      [productId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: Number(row.id),
      nombre: row.nombre ? String(row.nombre) : undefined,
      stock: Number(row.stock || 0),
    };
  }

  private async rollbackSafely(connection: PoolConnection | null, context: string, originalError: unknown) {
    if (!connection) {
      return;
    }

    try {
      await connection.rollback();
    } catch (rollbackError) {
      this.logger.warn(
        `No se pudo hacer rollback en ${context}. Error original: ${this.describeError(
          originalError,
        )}. Error de rollback: ${this.describeError(rollbackError)}`,
      );
    }
  }

  private describeError(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return 'Error desconocido';
    }
  }

  private async notifyLowStockAdmins(alerts: LowStockAlert[], source: string) {
    try {
      await this.emailService.sendLowStockAlertToAdmins(alerts, source);
    } catch (error) {
      this.logger.warn(`No se pudo enviar correo de stock bajo: ${this.describeError(error)}`);
    }
  }
}
