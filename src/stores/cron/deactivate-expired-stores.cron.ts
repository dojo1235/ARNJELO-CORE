import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { StoresService } from '../stores.service'

@Injectable()
export class DeactivateExpiredStoresCron {
  private readonly logger = new Logger(DeactivateExpiredStoresCron.name)

  constructor(private readonly storesService: StoresService) {}

  //@Cron('*/10 * * * * *') // every 10 seconds
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    try {
      const { deactivatedStoresCount } =
        await this.storesService.deactivateAllExpiredStoresAndRelatedData()
      this.logger.log(`Deactivated ${deactivatedStoresCount} expired stores.`)
    } catch (err: unknown) {
      this.logger.error(
        'Failed to deactivate expired stores',
        err instanceof Error ? err.stack : String(err),
      )
    }
  }
}
