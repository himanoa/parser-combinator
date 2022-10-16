export type Parser<T> = (ctx: Context) => Result<T>;

export type Result<T> = Success<T> | Failure;

export type Success<T> = {
  kind: "success";
  value: T;
  context: Context;
};

type ResultOfParser<P> = P extends Parser<infer R> ? R : never;

type ResultsOfParserTuple<Tuple extends readonly unknown[]> = {
  [Index in keyof Tuple]: ResultOfParser<Tuple[Index]>;
};

type ValidateParser<P> = P extends Parser<infer R> ? R : never;

type TupleDoesNotContainNever<T extends readonly unknown[]> = // never if T contains never, otherwise unknown
  T extends [infer H, ...infer R] ? H extends never ? never
    : TupleDoesNotContainNever<R>
    : unknown;

type ValidateParserTuple<Tuple extends readonly unknown[]> = // unknown if Tuple is a parser tuple, never otherwise
  TupleDoesNotContainNever<
    {
      [Index in keyof Tuple]: ValidateParser<Tuple[Index]>;
    }
  >;

export type Failure = {
  kind: "error";
  expected: string;
  context: Context;
};

export type Context = {
  text: string;
  rest: string;
  position: number;
};

const success = <T>(
  ctx: Context,
  value: T,
  consumeCount: number,
): Success<T> => {
  return {
    value,
    kind: "success",
    context: {
      text: ctx.text,
      rest: ctx.rest.slice(consumeCount),
      position: ctx.position + consumeCount,
    },
  };
};

const failure = (ctx: Context, expected: string): Failure => {
  return {
    expected,
    kind: "error",
    context: ctx,
  };
};

export const anyChar: Parser<string> = (ctx) => {
  const [char] = ctx.rest;
  return char != null ? success(ctx, char, 1) : failure(ctx, "empty character");
};

export const eof: Parser<null> = (ctx) => {
  if (ctx.text.length === ctx.position) {
    return success(ctx, null, 0);
  }
  return failure(ctx, "not EOF");
};

export const char: <T extends string[0]>(c: T) => Parser<T> = (c) => (ctx) => {
  const [char] = ctx.rest;
  return char === c
    ? success(ctx, c, 1)
    : failure(ctx, `${char != null ? char : ""} is not ${c}`);
};

export const choice: <Tuple extends readonly unknown[]>(parsers: Tuple & ValidateParserTuple<Tuple>) => Tuple[number] =
  (parsers: readonly unknown[]) => (ctx: Context) => {
    for (const parser of parsers) {
      // deno-lint-ignore no-explicit-any
      const result = (parser as any as Parser<unknown>)(ctx);
      if (result.kind === "success") return result;
    }
    return failure(ctx, "");
  };

export const count: <T>(count: number, parser: Parser<T>) => Parser<T[]> =
  <T>(count: number, parser: Parser<T>) => (ctx) => {
    const results: T[] = [];
    let currentCtx = ctx;

    for (let i = 0; i < count; i++) {
      const result = parser(currentCtx);
      if (result.kind === "error") {
        return failure(currentCtx, `expected count ${count} actual ${i}`);
      }

      results.push(result.value);
      currentCtx = result.context;
    }

    return success(currentCtx, results, 0);
  };

export function and<Tuple extends readonly unknown[]>(
  parsers: Tuple & ValidateParserTuple<Tuple>,
): Parser<ResultsOfParserTuple<Tuple>> {
  return (ctx) => {
    const results = [];
    let currentCtx = ctx;
    for (const parser of parsers) {
      // deno-lint-ignore no-explicit-any
      const result = (parser as any)(currentCtx);
      if (result.kind === "error") {
        return result;
      }
      currentCtx = result.context;
      results.push(result.value);
    }

    return success(currentCtx, results, 0);
  };
}

export const many: <T>(parser: Parser<T>) => Parser<T[]> =
  <T>(parser: Parser<T>) => (ctx) => {
    const results: T[] = [];
    let currentCtx = ctx;

    while (currentCtx.rest.length != 0) {
      const result = parser(currentCtx);
      currentCtx = result.context;
      if (result.kind === "error") {
        return success(currentCtx, results, 0);
      }
      results.push(result.value);
    }
    return success(currentCtx, results, 0);
  };

export const many1: <T>(parser: Parser<T>) => Parser<T[]> =
  <T>(parser: Parser<T>) => (ctx) => {
    const headResult = parser(ctx);
    if (headResult.kind === "error") return headResult;

    const manyResult = many(parser)(headResult.context);

    if (manyResult.kind === "success") {
      return success(manyResult.context, [
        headResult.value,
        ...manyResult.value,
      ], 0);
    }

    throw new Error("unreachable");
  };

export const str: (value: string) => Parser<string[]> = (value) =>
  and(([...value]).map(char));

export const satisfy: (predicate: (c: string) => boolean) => Parser<string> =
  (predicate) => (ctx) => {
    const [head, _] = ctx.rest;
    const isMatched = predicate(head);
    return isMatched
      ? success(ctx, head, 1)
      : failure(ctx, "no match predicate");
  };

export const not: <T>(parser: Parser<T>) => Parser<never> =
  (parser) => (ctx) => {
    const headResult = parser(ctx);
    if (headResult.kind === "error") {
      return success(ctx, null as never, 1);
    }
    return failure(ctx, "matched");
  };

export const skip: <T>(parser: Parser<T>) => Parser<never> =
  (parser) => (ctx) => {
    const headResult = parser(ctx);
    if (headResult.kind === "success") {
      return success(headResult.context, null as never, 0);
    }
    return failure(ctx, headResult.expected);
  };

export const countMinMax: <T>(
  min: number,
  max: number,
  parser: Parser<T>,
) => Parser<T[]> =
  <T>(min: number, max: number, parser: Parser<T>) => (ctx) => {
    const results = many(parser)(ctx);

    if (results.kind === "success") {
      if (results.value.length < min) {
        return failure(results.context, `match count < ${min}`);
      }
      if (max < results.value.length) {
        return failure(results.context, `${max} < match count`);
      }
      return success(results.context, results.value, 0);
    }

    throw new Error("unreachable");
  };

export const map: <T, U>(parser: Parser<T>, fn: (v: T) => U) => Parser<U> =
  (parser, fn) => (ctx) => {
    const result = parser(ctx);
    return result.kind === "success"
      ? success(result.context, fn(result.value), 0)
      : result;
  };

export const mapErr: <T>(
  parser: Parser<T>,
  fn: (v: string) => string,
) => Parser<T> = (parser, fn) => (ctx) => {
  const result = parser(ctx);
  return result.kind === "error"
    ? failure(result.context, fn(result.expected))
    : result;
};

export const surround: <T>(
  openChar: string,
  closeChar: string,
  parser: Parser<T>,
) => Parser<T> =
  <T>(openChar: string, closeChar: string, parser: Parser<T>) => (ctx) => {
    return map(
      and(
        [skip(char(openChar)), parser, skip(char(closeChar))],
      ),
      ([_, value]) => {
        return value;
      },
    )(ctx);
  };

export const optional: <T>(parser: Parser<T>) => Parser<T | null> = (parser) => (ctx) => {
  const result = parser(ctx)
  if(result.kind === 'error') {
    return success(ctx, null, 0)
  }
  return success(result.context, result.value, 0)
}

export const createParser: <T>(
  parser: Parser<T>,
) => (target: string) => Result<T> = (parser) => (target) => {
  const ctx: Context = {
    text: target,
    rest: target,
    position: 0,
  };

  return parser(ctx);
};
