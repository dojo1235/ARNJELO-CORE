import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class TokenQueryDto {
  @ApiProperty({ description: 'Email change, magic login, password reset token etc' })
  @IsString()
  @IsNotEmpty()
  token: string
}
