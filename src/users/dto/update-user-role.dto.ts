import { ApiProperty } from '@nestjs/swagger'
import { Role } from 'src/users/entities/user.entity'
import { IsEnum } from 'class-validator'

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'New role to assign to the user', enum: Role })
  @IsEnum(Role)
  role: Role
}
