import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class TxRefParamDto {
  @ApiProperty({ description: 'Transaction reference' })
  @IsString()
  @MinLength(1)
  txRef: string
}
