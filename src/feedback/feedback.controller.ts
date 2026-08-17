import { Controller, Post, Body, HttpStatus } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator'
import { Auth } from 'src/common/decorators/auth.decorator'
import { CurrentUser, type CurrentUserPayload } from 'src/common/decorators/current-user.decorator'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'

@Auth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Post()
  @ApiOperation({ summary: 'Submit feedback (bug, feature request, confusion)' })
  @ApiSuccessResponse({
    description: 'Thanks for your feedback',
    status: HttpStatus.CREATED,
  })
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.feedbackService.createFeedback(user.id, createFeedbackDto)
  }
}
