import { plainToInstance } from 'class-transformer'
import { validateOrReject, ValidationError } from 'class-validator'
import { AppError, ErrorCode } from 'src/common/exceptions/app-error'

export const parseAndValidateDto = async <T extends object>(
  DtoClass: new () => T,
  raw: string | undefined,
): Promise<T> => {
  const parsed = raw ? JSON.parse(raw) : {}
  const instance = plainToInstance(DtoClass, parsed, {
    enableImplicitConversion: false,
  })
  try {
    await validateOrReject(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  } catch (errors) {
    const first = (errors as ValidationError[])[0]
    throw new AppError(ErrorCode.VALIDATION_ERROR, Object.values(first.constraints!)[0])
  }
  Object.keys(instance).forEach((key) => {
    if (instance[key as keyof T] === undefined) {
      delete instance[key as keyof T]
    }
  })
  return instance
}
