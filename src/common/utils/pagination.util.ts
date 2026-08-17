import { FindManyOptions, Repository, ObjectLiteral, FindOptionsOrder } from 'typeorm'

interface PaginationQuery {
  page?: number
  limit?: number
  sortBy?: string
  orderBy?: 'asc' | 'desc'
}

interface PaginateOptions<Entity extends ObjectLiteral> {
  where?: FindManyOptions<Entity>['where']
  select?: FindManyOptions<Entity>['select']
  relations?: FindManyOptions<Entity>['relations']
}

export const paginate = async <Entity extends ObjectLiteral>(
  modelQuery: Repository<Entity>,
  query: PaginationQuery,
  options?: PaginateOptions<Entity>,
) => {
  const page = query.page || 1
  const limit = Math.min(query.limit ?? 10, 20)
  const offset = (page - 1) * limit
  const sortColumn = query.sortBy || 'createdAt'
  const sortOrder: FindOptionsOrder<Entity> = {
    [sortColumn]: query.orderBy === 'asc' ? 'ASC' : 'DESC',
  } as FindOptionsOrder<Entity>

  const [items, totalCount] = await Promise.all([
    modelQuery.find({
      where: options?.where || {},
      select: options?.select || [],
      relations: options?.relations || [],
      take: limit,
      skip: offset,
      order: sortOrder,
    }),
    modelQuery.count({ where: options?.where || {} }),
  ])

  const count = items.length
  const total = totalCount
  const totalPages = Math.ceil(total / limit)

  return {
    items,
    meta: {
      pagination: { page, limit, count, total, totalPages },
    },
  }
}
