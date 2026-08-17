import { ApiProperty } from '@nestjs/swagger'

export class StoreUserStateDto {
  @ApiProperty({ description: 'Indicates if the user is inactive for this store' })
  isDeleted: boolean

  @ApiProperty({ description: 'Indicates if the user is banned from this store' })
  isBanned: boolean
}

export class StoreUserStateResponseDto {
  @ApiProperty({ description: 'State of the store user', type: () => StoreUserStateDto })
  storeUserState: StoreUserStateDto
}
