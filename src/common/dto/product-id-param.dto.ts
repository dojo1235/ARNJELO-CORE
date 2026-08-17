import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ProductIdParamDto {
  @ApiProperty({ description: 'ID of the product' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number
}
