import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthGuardGuard } from './common/guard/auth-guard/auth-guard.guard';
import { JwtService } from '@nestjs/jwt';
import { HttpResponseInterceptor } from './common/interceptor/httpresponse/httpresponse.interceptor';
import { HttpErrorFilterFilter } from './common/filter/http-error-filter/http-error-filter.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalGuards(new AuthGuardGuard(reflector, jwtService));
  app.useGlobalFilters(new HttpErrorFilterFilter());
  app.useGlobalInterceptors(new HttpResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Hotel Booking API')
    .setDescription(
      'This app enables hotel owners to register their hotel and makes it easy to find and book hotels with ease',
    )
    .setVersion('1.0')
    // .addTag('Auth')
    // .addTag('Hotel')
    // .addTag('Booking')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
