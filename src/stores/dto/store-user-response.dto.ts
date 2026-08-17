import { ApiProperty } from '@nestjs/swagger'
import { StoreUser } from '../entities/store-user.entity'

export class StoreUserResponseDto {
  @ApiProperty({ description: 'Store user details', type: () => StoreUser, nullable: true })
  storeUser: StoreUser | null
}
