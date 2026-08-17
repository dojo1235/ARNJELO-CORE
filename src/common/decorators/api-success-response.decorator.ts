import {
  applyDecorators,
  HttpStatus,
  type Type,
  UseInterceptors,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import {
  ApiExtraModels,
  ApiResponse as OriginalApiResponse,
  getSchemaPath,
  ApiProperty,
} from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { map } from 'rxjs/operators'

class SuccessResponse<T = unknown> {
  @ApiProperty({
    description: 'The actual response payload. Will be null if no data is returned.',
  })
  data: T

  @ApiProperty({
    description: 'Message describing the result of the operation.',
  })
  message: string
}

@Injectable()
class ResponseInterceptor<T> implements NestInterceptor {
  constructor(
    private readonly type: Type<T>,
    private readonly description: string,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        if (!this.type || !data) {
          return { message: this.description, data: null }
        }
        const dataInstance = plainToInstance(this.type, data)
        return { message: this.description, data: dataInstance }
      }),
    )
  }
}

class EmptyResponseDto {}

export const ApiSuccessResponse = <T extends Type<unknown>>(options: {
  description: string
  type?: T
  status?: number
}) => {
  const { description, type = EmptyResponseDto, status = HttpStatus.OK } = options

  return applyDecorators(
    UseInterceptors(new ResponseInterceptor(type, description)),
    ApiExtraModels(SuccessResponse, type),
    OriginalApiResponse({
      status,
      description: description ?? 'Successful response',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: getSchemaPath(type) },
        },
      },
    }),
  )
}
