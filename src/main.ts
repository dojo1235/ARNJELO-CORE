import 'reflect-metadata'
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional'
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'
import { NestFactory, Reflector, HttpAdapterHost } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO })

  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  // enable global validation/transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in DTOs
      forbidNonWhitelisted: true, // throws if extra props are sent
      transform: true, // converts payloads to DTO class types
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Multi-tenant E-commerce API')
    .setDescription("API documentation for Dojo's multi store e-commerce platform")
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
