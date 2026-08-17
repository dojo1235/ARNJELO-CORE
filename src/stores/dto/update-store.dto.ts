import { IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Name of the store' })
  name?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Description of the store' })
  description?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Currency symbol used by the store' })
  currencySymbol?: string
}

export class UpdateStoreFormDto {
  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Store logo image to upload (one file allowed 1MB max), multipart/form-data',
  })
  logo?: any

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'JSON string: used when removing logo. Example: "true"',
    example: 'true',
  })
  removeLogo?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'JSON string: Store update data (all optional)',
    example: JSON.stringify({
      name: 'New Store Name',
      description: 'Premium store',
      currencySymbol: '$',
    }),
  })
  storeUpdateData?: string
}
