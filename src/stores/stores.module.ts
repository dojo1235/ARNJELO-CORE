import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from 'src/users/users.module'
import { StorageModule } from 'src/storage/storage.module'
import { StoresRepository } from './stores.repository'
import { StoresService } from './stores.service'
import { DeactivateExpiredStoresCron } from './cron/deactivate-expired-stores.cron'
import { StoreOwnersAdminsController } from './store-owners-admins.controller'
import { StoresAdminsUsersController } from './stores-admins-users.controller'
import { StoresController } from './stores.controller'
import { Store } from './entities/store.entity'
import { StoreReferral } from './entities/store-referral.entity'
import { StoreUser } from './entities/store-user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, StoreReferral, StoreUser]),
    UsersModule,
    StorageModule,
  ],
  controllers: [StoreOwnersAdminsController, StoresAdminsUsersController, StoresController],
  providers: [StoresRepository, StoresService, DeactivateExpiredStoresCron],
  exports: [StoresRepository, StoresService],
})
export class StoresModule {}
