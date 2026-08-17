import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ReviewIdParamDto {
  @ApiProperty({ description: 'ID of the review' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reviewId: number
}
