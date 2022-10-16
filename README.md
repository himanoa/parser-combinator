# @himanoa/parser-combinator

parser-combinator library for typescript

## Install

### npm

`npm i @himanoa/parser-combinator`

## Example

```typescript
import { choice, createParser, map, str } from "@himanoa/parser-combinator";

const booleanSymbol = choice([
  map(str("true"), () => true),
  map(str("false"), () => false),
]);

const parser = createParser(booleanSymbol);

const trueResult = parser("true");

console.log(trueResult.kind === "success" ? trueResult.value : "failed parse");
console.log(trueResult.kind === "success" ? trueResult.value : "failed parse");

const falseResult = parser("false");

console.log(
  falseResult.kind === "success" ? falseResult.value : "failed parse",
);
console.log(
  falseResult.kind === "success" ? falseResult.value : "failed parse",
);

const failedResult = parser("asdfasdf");

console.log(
  failedResult.kind === "success" ? failedResult.value : "failed parse",
);
console.log(
  failedResult.kind === "success" ? failedResult.value : "failed parse",
);
```

## API

- anyChar: Parse any token
- eof: Parse eof token
- char: Parse `c` token
- choice: Parse any one matching token from multiple parsers
- count: Parse parser from zero up to count times
- and: Parse all parsers
- many: Parse parser from zero or more tiems returning a Array with the values
  from p
- many1: Parse parser from one or more tiems returning a Array with the values
  from p
- str: Parse many char token
- countMinMax: Parse parser from min to max times
- map: convert `value` when parse success
- mapErr: convert `expected` when parse failed
- surround: Parse open followed by parser followed by close
- not: Reverse parser result
- skip: Crush parse results with never
- satisfy: Parses a token and succeeds depending on the result of predicate
- optional: Parse a token and return a or null. Return null when failed parse.
