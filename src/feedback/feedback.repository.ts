import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Feedback } from './entities/feedback.entity'

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(Feedback)
    private readonly repository: Repository<Feedback>,
  ) {}

  async createFeedback(data: Partial<Feedback>) {
    const entity = this.repository.create(data)
    return await this.repository.save(entity)
  }
}
