import { ApiProperty } from '@nestjs/swagger'

export class StoreConfigResponseDto {
  @ApiProperty({ description: 'Brand name of the store' })
  name: string

  @ApiProperty({ description: 'Currency symbol for the store products' })
  currencySymbol: string

  @ApiProperty({ description: 'Store brand logo', type: String, nullable: true })
  logoUrl: string | null
}
