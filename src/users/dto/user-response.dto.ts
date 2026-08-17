import { ApiProperty } from '@nestjs/swagger'
import { User } from '../entities/user.entity'

export class UserResponseDto {
  @ApiProperty({
    description: 'User details',
    type: () => User,
    nullable: true,
  })
  user: User | null
}
