import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class OrderItemIdParamDto {
  @ApiProperty({ description: 'ID of the order item' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderItemId: number
}
