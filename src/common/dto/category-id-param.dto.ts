import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CategoryIdParamDto {
  @ApiProperty({ description: 'ID of the category' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number
}
