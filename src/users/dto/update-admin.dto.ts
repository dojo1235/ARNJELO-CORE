import { PartialType } from '@nestjs/swagger'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { RegisterDto } from 'src/auth/dto/register.dto'

export class UpdateAdminDto extends PartialType(RegisterDto) {
  @ApiPropertyOptional({ description: 'Full name of the admin' })
  name?: string

  @ApiPropertyOptional({ description: 'Email address of the admin' })
  email?: string

  @ApiPropertyOptional({ description: 'Password of the admin' })
  password?: string
}
