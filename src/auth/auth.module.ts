import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmailModule } from 'src/email/email.module'
import { JwtStrategy } from '../common/strategies/jwt.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from 'src/users/users.module'
import { StoresModule } from 'src/stores/stores.module'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { Token } from './entities/token.entity'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get('jwt.accessExpiresIn') },
      }),
    }),
    TypeOrmModule.forFeature([Token]),
    forwardRef(() => UsersModule),
    StoresModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, AuthRepository],
  exports: [JwtStrategy, AuthRepository],
})
export class AuthModule {}
