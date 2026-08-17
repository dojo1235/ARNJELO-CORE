import { Transform } from 'class-transformer'

export const ToNumber = () =>
  Transform(({ value }) => {
    if (value === null || value === undefined) return value
    const num = Number(value)
    return Number.isNaN(num) ? value : num
  })
