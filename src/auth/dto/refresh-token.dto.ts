import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Refresh tokens issued during register, login or token refresh' })
  refreshToken: string
}
