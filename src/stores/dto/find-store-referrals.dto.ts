import { IsInt, Min, IsOptional, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortOrder } from 'src/common/enums/sort-order.enum'
import { StoreReferralsSortBy } from 'src/common/enums/store-referrals-sort-by.enum'

export class FindStoreReferralsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Page number for pagination' })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Page size for pagination' })
  limit?: number

  @IsOptional()
  @IsEnum(StoreReferralsSortBy)
  @ApiPropertyOptional({ description: 'Sort by field', enum: StoreReferralsSortBy })
  sortBy?: StoreReferralsSortBy

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder })
  orderBy?: SortOrder
}
