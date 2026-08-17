import { IsOptional, IsString, Length } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters long' })
  @ApiPropertyOptional({ description: 'Full name of the user', minLength: 3, maxLength: 50 })
  name?: string
}

export class UpdateUserFormDto {
  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'User avatar image to upload (one file allowed 1MB max), multipart/form-data',
  })
  avatar?: any

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'JSON string: used when removing avatar. Example: "true"',
    example: 'true',
  })
  removeAvatar?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'JSON string: User update data (all optional)',
    example: JSON.stringify({
      name: 'John Doe',
    }),
  })
  userUpdateData?: string
}
