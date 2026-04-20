import { NestFactory, Reflector } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import 'reflect-metadata';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nest API Docs')
    .setDescription('API stories from @mahmudulmurad')
    .setVersion('1.0')
    .addTag('san-Ti')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT);
  const logger = new Logger('🔥');
  logger.log(`V8 is running in port:${process.env.PORT} 🔥🚀🚀🚀🔥`);
}

bootstrap();
