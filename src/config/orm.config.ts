import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'
import { join } from 'node:path'
import { addTransactionalDataSource } from 'typeorm-transactional'
import { NamingStrategy } from '../database/naming.strategy'

export const dataSourceOptions: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.name'),
    entities: [join(__dirname, '..', '/**/*.entity{.ts,.js}')],
    synchronize: true,
    logging: false,
    namingStrategy: new NamingStrategy(),
  }),
  dataSourceFactory: async (options) => {
    if (!options) throw new Error('Invalid TypeORM options')
    const dataSource = new DataSource(options)
    return Promise.resolve(addTransactionalDataSource(dataSource))
  },
}
