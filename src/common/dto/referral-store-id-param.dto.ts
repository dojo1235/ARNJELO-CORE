import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ReferralStoreIdParamDto {
  @ApiProperty({ description: 'ID of the referred store' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  referredStoreId: number
}
