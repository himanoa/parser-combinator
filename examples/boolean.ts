import { choice, createParser, map, str } from "../mod.ts";

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
