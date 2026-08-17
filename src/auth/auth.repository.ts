import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from './entities/token.entity'
import { TokenType } from './entities/token.entity'

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Token)
    private readonly repository: Repository<Token>,
  ) {}

  async createToken(data: Partial<Token>) {
    const entity = this.repository.create(data)
    return await this.repository.save(entity)
  }

  async findActiveUserTokens(userId: number, type: TokenType) {
    return await this.repository.find({ where: { userId, type, revoked: false } })
  }

  async revokeToken(refreshTokenId: number, data: Partial<Token>) {
    return await this.repository.update({ id: refreshTokenId, revoked: false }, data)
  }

  async revokeAllTokensForUser(userId: number, type: TokenType, data: Partial<Token>) {
    return await this.repository.update({ userId, type, revoked: false }, data)
  }

  async deleteTokensByUserId(userId: number) {
    return await this.repository.delete({ userId })
  }
}
