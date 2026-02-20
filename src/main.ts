import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Transform interceptor global
  app.useGlobalInterceptors(new TransformInterceptor());

  // Exception filter global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Winona Backend Assessment Test API')
    .setDescription(
      'RESTful API for managing patients, medications and medical prescriptions. ' +
        'All successful responses follow the format: `{ status: "success", data: T }`.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Health check and service status')
    .addTag('Patients', 'Patient CRUD')
    .addTag('Medications', 'Medication CRUD')
    .addTag('Prescriptions', 'Medical prescriptions associated with patients')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

void bootstrap();
