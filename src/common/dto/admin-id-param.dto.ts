import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class AdminIdParamDto {
  @ApiProperty({ description: 'ID of the admin' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adminId: number
}
