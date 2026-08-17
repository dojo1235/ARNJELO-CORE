import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Feedback message' })
  @IsString()
  @MinLength(3)
  message: string
}
