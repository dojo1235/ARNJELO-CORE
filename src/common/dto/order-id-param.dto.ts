import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class OrderIdParamDto {
  @ApiProperty({ description: 'ID of the order' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderId: number
}
