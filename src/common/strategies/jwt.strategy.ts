import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.accessSecret')!,
    })
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      storeId: payload.storeId,
      isStoreActive: payload.isStoreActive,
      isBannedFromStore: payload.isBannedFromStore,
      role: payload.role,
    }
  }
}
