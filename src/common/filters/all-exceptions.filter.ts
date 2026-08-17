import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { AppError } from '../exceptions/app-error'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private getExceptionInfo(exception: unknown): { status: number; message: string } {
    if (exception instanceof AppError) {
      return { status: exception.toHttpCode(), message: exception.message }
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      return {
        status: exception.getStatus(),
        message:
          typeof response === 'string' ? response : (response as any)?.message || exception.message,
      }
    }
    if (exception instanceof Error) {
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: exception.message }
    }
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' }
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest()

    const { status, message } = this.getExceptionInfo(exception)

    const responseBody = {
      success: false,
      message,
      data: null,
      statusCode: status,
      path: request?.url,
      timestamp: new Date().toISOString(),
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, status)
  }
}
