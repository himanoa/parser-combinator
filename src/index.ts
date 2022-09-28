type Parser<T> = (ctx: Context) => Result<T>

type Result<T> = Success<T> | Failure

type Success<T> = {
  kind: 'success',
  value: T,
  context: Context
}

type Failure = {
  kind: 'error',
  expected: string,
  context: Context
}

type Context = {
  text: string,
  rest: string
  position: number
}

const success = <T>(ctx: Context, value: T, rest: string, consumeCount: number): Success<T> => {
  return {
    value,
    kind: 'success',
    context: {
      text: ctx.text,
      rest: rest,
      position: ctx.position + consumeCount
    }
  }
}

const failure = (ctx: Context, expected: string): Failure => {
  return {
    expected,
    kind: 'error',
    context: ctx
  }
}

export const anyChar: Parser<string> = (ctx) => {
  const [char, ...rest] = ctx.rest
  return char != null ? success(ctx, char, rest.join(""), 1) : failure(ctx, "empty character")
}

export const eof: Parser<null> = (ctx) => {
  if(ctx.text.length === ctx.position) {
    return success(ctx, null, ctx.rest, 0)
  }
  return failure(ctx, "not EOF")
}

export const char: <T extends string[0]>(c: T) => Parser<T> = (c) => (ctx) => {
  const [char, ...rest] = ctx.rest
  return char === c ? success(ctx, c, rest.join(""), 1) : failure(ctx, `${char} is not ${c}`)
}


export const choice:<T>(parsers: ReadonlyArray<Parser<T>>) => Parser<T> =  <T>(parsers: ReadonlyArray<Parser<T>>) => (ctx: Context) => {
  for(const parser of parsers) {
    const result = parser(ctx)
    if(result.kind === 'success') return result
  }
  return failure(ctx, '')
}

