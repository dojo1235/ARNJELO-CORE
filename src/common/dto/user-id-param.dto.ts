import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class UserIdParamDto {
  @ApiProperty({ description: 'ID of the user' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number
}
