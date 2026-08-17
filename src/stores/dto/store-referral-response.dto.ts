import { ApiProperty } from '@nestjs/swagger'
import { StoreReferral } from '../entities/store-referral.entity'

export class StoreReferralResponseDto {
  @ApiProperty({ description: 'Referred store details', type: () => StoreReferral, nullable: true })
  storeReferral: StoreReferral | null
}
