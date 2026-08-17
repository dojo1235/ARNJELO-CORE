import { ApiProperty } from '@nestjs/swagger'
import { User } from '../entities/user.entity'
import { MetaResponseDto } from 'src/common/dto/meta-response.dto'

export class UsersListResponseDto {
  @ApiProperty({
    description: 'Array of user entities with their full details',
    type: () => [User],
  })
  users: User[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: MetaResponseDto,
  })
  meta: MetaResponseDto
}
