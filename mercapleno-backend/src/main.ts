import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mercapleno API')
    .setDescription('Lo más fino del pedazo')
    .setVersion('2.0.0')
    .addBearerAuth()
    .addSecurity( 'x-api-key', {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
      description: 'Clave API para acceso a rutas protegidas',
    }
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(envs.port);
  // eslint-disable-next-line no-console
  console.log(`Mercapleno backend corriendo en http://localhost:${envs.port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger: http://localhost:${envs.port}/api/docs`);
}

bootstrap();
