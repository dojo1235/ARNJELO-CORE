import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ReferralEarningIdParamDto {
  @ApiProperty({ description: 'ID of referral earning' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  referralEarningId: number
}
