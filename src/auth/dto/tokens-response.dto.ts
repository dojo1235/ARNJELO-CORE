import { ApiProperty } from '@nestjs/swagger'

export class TokensDataDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string
}

export class TokensResponseDto {
  @ApiProperty({
    description: 'Authentication tokens',
    type: () => TokensDataDto,
  })
  tokens: TokensDataDto
}
