import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class StoreProductImageParamDto {
  @ApiProperty({ description: 'ID of the store' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  storeId: number

  @ApiProperty({ description: 'ID of the product image' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productImageId: number
}
