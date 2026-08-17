import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class StoreIdParamDto {
  @ApiProperty({ description: 'ID of the store' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  storeId: number
}
