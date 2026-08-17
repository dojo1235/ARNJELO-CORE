import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataSourceOptions } from './config/orm.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { StoresModule } from './stores/stores.module'
import { StorageModule } from './storage/storage.module'
import { FeedbackModule } from './feedback/feedback.module'
import { EmailModule } from './email/email.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync(dataSourceOptions),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300,
      },
    ]),
    AuthModule,
    UsersModule,
    StoresModule,
    StorageModule,
    FeedbackModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
