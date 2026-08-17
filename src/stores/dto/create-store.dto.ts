import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Name of the store' })
  name: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Description of the store' })
  description?: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Currency symbol used by the store' })
  currencySymbol: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Referral code of the referring store' })
  referralCode?: string
}
