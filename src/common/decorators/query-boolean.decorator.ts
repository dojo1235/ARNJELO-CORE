import { Transform } from 'class-transformer'

export const QueryBoolean = () =>
  Transform(({ value }) => (value === undefined ? undefined : value === 'true'))
