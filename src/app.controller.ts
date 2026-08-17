import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('random-number')
  getRandom() {
    console.log('Random endpoint hit')
    return Math.round(Math.random() * 100)
  }
}
