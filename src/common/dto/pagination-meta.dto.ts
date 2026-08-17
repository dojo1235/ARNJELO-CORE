import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  page: number

  @ApiProperty({ description: 'Number of items per page' })
  limit: number

  @ApiProperty({ description: 'Number of items in current page' })
  count: number

  @ApiProperty({ description: 'Total number of items' })
  total: number

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number
}
