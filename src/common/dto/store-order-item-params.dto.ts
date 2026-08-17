import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class StoreOrderItemParamsDto {
  @ApiProperty({ description: 'ID of the store' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  storeId: number

  @ApiProperty({ description: 'ID of the order item' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderItemId: number
}
