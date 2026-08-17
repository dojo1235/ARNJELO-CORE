import { ApiProperty } from '@nestjs/swagger'
import { PaginationMetaDto } from './pagination-meta.dto'

export class MetaResponseDto {
  @ApiProperty({ description: 'Pagination details', type: PaginationMetaDto })
  pagination: PaginationMetaDto
}
