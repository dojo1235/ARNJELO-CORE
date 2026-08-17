import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ProductImageIdParamDto {
  @ApiProperty({ description: 'ID of the product image' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productImageId: number
}
