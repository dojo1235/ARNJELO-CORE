import { ApiProperty } from '@nestjs/swagger'
import { Store } from '../entities/store.entity'

export class StoreResponseDto {
  @ApiProperty({ description: 'Store details', type: () => Store, nullable: true })
  store: Store | null
}
