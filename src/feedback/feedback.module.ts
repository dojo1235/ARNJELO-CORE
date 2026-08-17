import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeedbackRepository } from './feedback.repository'
import { FeedbackService } from './feedback.service'
import { FeedbackController } from './feedback.controller'
import { Feedback } from './entities/feedback.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [FeedbackRepository, FeedbackService],
})
export class FeedbackModule {}
