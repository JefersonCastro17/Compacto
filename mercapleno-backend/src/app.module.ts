import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MysqlModule } from './common/database/mysql.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { EmailModule } from './email/email.module';
import { UsersAdminModule } from './users-admin/users-admin.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    MysqlModule,
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersAdminModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
