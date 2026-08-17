import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/users/entities/user.entity'
import { TokensDataDto } from './tokens-response.dto'

export class AuthResponseDto {
  @ApiProperty({ description: 'Registered user details', type: () => User, nullable: true })
  user: User | null

  @ApiProperty({ description: 'Authentication tokens', type: () => TokensDataDto })
  tokens: TokensDataDto
}
