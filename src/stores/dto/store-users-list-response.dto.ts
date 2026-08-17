import { ApiProperty } from '@nestjs/swagger'
import { StoreUser } from '../entities/store-user.entity'
import { MetaResponseDto } from 'src/common/dto/meta-response.dto'

export class StoreUsersListResponseDto {
  @ApiProperty({ description: 'List of store users', type: () => [StoreUser] })
  storeUsers: StoreUser[]

  @ApiProperty({ description: 'Pagination metadata', type: MetaResponseDto })
  meta: MetaResponseDto
}
