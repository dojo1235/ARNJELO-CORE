import { Injectable } from '@nestjs/common'
import { FeedbackRepository } from './feedback.repository'
import { CreateFeedbackDto } from './dto/create-feedback.dto'

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  async createFeedback(userId: number, data: CreateFeedbackDto) {
    await this.feedbackRepository.createFeedback({ userId, ...data })
  }
}
