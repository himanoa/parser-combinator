type Parser<T> = (ctx: Context) => Result<T>;

type Result<T> = Success<T> | Failure;

type Success<T> = {
  kind: "success";
  value: T;
  context: Context;
};

type Failure = {
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

export const choice: <T>(parsers: ReadonlyArray<Parser<T>>) => Parser<T> =
  <T>(parsers: ReadonlyArray<Parser<T>>) => (ctx: Context) => {
    for (const parser of parsers) {
      const result = parser(ctx);
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


export function and<
T0,
>(parsers: [Parser<T0>]): Parser<[T0]>;
export function and<
T0,
T1,
>(parsers: [Parser<T0>,Parser<T1>]): Parser<[T0,T1]>;
export function and<
T0,
T1,
T2,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>]): Parser<[T0,T1,T2]>;
export function and<
T0,
T1,
T2,
T3,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>]): Parser<[T0,T1,T2,T3]>;
export function and<
T0,
T1,
T2,
T3,
T4,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>]): Parser<[T0,T1,T2,T3,T4]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>]): Parser<[T0,T1,T2,T3,T4,T5]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>]): Parser<[T0,T1,T2,T3,T4,T5,T6]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
T14,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>,Parser<T14>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
T14,
T15,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>,Parser<T14>,Parser<T15>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
T14,
T15,
T16,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>,Parser<T14>,Parser<T15>,Parser<T16>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15,T16]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
T14,
T15,
T16,
T17,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>,Parser<T14>,Parser<T15>,Parser<T16>,Parser<T17>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15,T16,T17]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
T14,
T15,
T16,
T17,
T18,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>,Parser<T14>,Parser<T15>,Parser<T16>,Parser<T17>,Parser<T18>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15,T16,T17,T18]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
T14,
T15,
T16,
T17,
T18,
T19,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>,Parser<T14>,Parser<T15>,Parser<T16>,Parser<T17>,Parser<T18>,Parser<T19>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15,T16,T17,T18,T19]>;
export function and<
T0,
T1,
T2,
T3,
T4,
T5,
T6,
T7,
T8,
T9,
T10,
T11,
T12,
T13,
T14,
T15,
T16,
T17,
T18,
T19,
T20,
>(parsers: [Parser<T0>,Parser<T1>,Parser<T2>,Parser<T3>,Parser<T4>,Parser<T5>,Parser<T6>,Parser<T7>,Parser<T8>,Parser<T9>,Parser<T10>,Parser<T11>,Parser<T12>,Parser<T13>,Parser<T14>,Parser<T15>,Parser<T16>,Parser<T17>,Parser<T18>,Parser<T19>,Parser<T20>]): Parser<[T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15,T16,T17,T18,T19,T20]>;
export function and(parsers: ReadonlyArray<Parser<any>>): Parser<any[]> {
  return (ctx) => {
    const results: any[] = [];
    let currentCtx = ctx;

    for (const parser of parsers) {
      const result = parser(currentCtx);
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
  and(([...value] as any).map(char));

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
