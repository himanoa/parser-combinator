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

export type Context = {
  text: string,
  rest: string
  position: number
}

const success = <T>(ctx: Context, value: T, consumeCount: number): Success<T> => {
  return {
    value,
    kind: 'success',
    context: {
      text: ctx.text,
      rest: ctx.rest.slice(consumeCount),
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
  const [char] = ctx.rest
  return char != null ? success(ctx, char, 1) : failure(ctx, "empty character")
}

export const eof: Parser<null> = (ctx) => {
  if(ctx.text.length === ctx.position) {
    return success(ctx, null, 0)
  }
  return failure(ctx, "not EOF")
}

export const char: <T extends string[0]>(c: T) => Parser<T> = (c) => (ctx) => {
  const [char] = ctx.rest
  return char === c ? success(ctx, c, 1) : failure(ctx, `${char} is not ${c}`)
}


export const choice:<T>(parsers: ReadonlyArray<Parser<T>>) => Parser<T> =  <T>(parsers: ReadonlyArray<Parser<T>>) => (ctx: Context) => {
  for(const parser of parsers) {
    const result = parser(ctx)
    if(result.kind === 'success') return result
  }
  return failure(ctx, '')
}


export const count: <T>(count: number, parser: Parser<T>) => Parser<T[]> = <T>(count: number, parser: Parser<T>) => (ctx) => {
  let results: T[] = []
  let currentCtx = ctx;

  for(let i = 0; i < count; i++) {
    const result = parser(currentCtx)
    if(result.kind === 'error') return failure(currentCtx, `expected count ${count} actual ${i}`)

    results.push(result.value)
    currentCtx = result.context
  }

  return success(currentCtx, results, 0)
}
