import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class StoreProductParamsDto {
  @ApiProperty({ description: 'ID of the store' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  storeId: number

  @ApiProperty({ description: 'ID of the product' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number
}
