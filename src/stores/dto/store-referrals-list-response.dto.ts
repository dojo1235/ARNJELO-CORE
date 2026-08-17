import { ApiProperty } from '@nestjs/swagger'
import { MetaResponseDto } from 'src/common/dto/meta-response.dto'
import { StoreReferral } from '../entities/store-referral.entity'

export class StoreReferralsListResponseDto {
  @ApiProperty({ description: 'List of referred stores', type: [StoreReferral] })
  storeReferrals: StoreReferral[]

  @ApiProperty({ description: 'Pagination metadata', type: MetaResponseDto })
  meta: MetaResponseDto
}
