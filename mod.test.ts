import {
  and,
  anyChar,
  char,
  choice,
  Context,
  count,
  countMinMax,
  eof,
  many,
  many1,
  map,
  mapErr,
  not,
  satisfy,
  skip,
  str,
  surround,
} from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";

const createCtx = (txt: string): Context => {
  return {
    text: txt,
    rest: txt,
    position: 0,
  };
};

Deno.test("anyChar:success", () => {
  const text = "abc";
  assertEquals(anyChar({ text, rest: text, position: 0 }), {
    kind: "success",
    value: "a",
    context: {
      text,
      rest: "bc",
      position: 1,
    },
  });
});

Deno.test("anyChar:failed", () => {
  const text = "";
  assertEquals(anyChar({ text, rest: text, position: 0 }), {
    kind: "error",
    expected: "empty character",
    context: {
      text,
      rest: "",
      position: 0,
    },
  });
});

Deno.test("eof:success", () => {
  const text = "";
  assertEquals(eof({ text, rest: text, position: 0 }), {
    kind: "success",
    value: null,
    context: {
      text,
      rest: text,
      position: 0,
    },
  });
});

Deno.test("eof:failed", () => {
  const text = "a";
  assertEquals(eof({ text, rest: text, position: 0 }), {
    kind: "error",
    expected: "not EOF",
    context: {
      text,
      rest: text,
      position: 0,
    },
  });
});

Deno.test("char:success", () => {
  const text = "a";
  assertEquals(char("a")(createCtx(text)), {
    kind: "success",
    value: "a",
    context: {
      text,
      rest: "",
      position: 1,
    },
  });
});

Deno.test("char:failed", () => {
  const text = "b";
  assertEquals(char("a")(createCtx(text)), {
    kind: "error",
    expected: "b is not a",
    context: {
      text,
      rest: "b",
      position: 0,
    },
  });
  assertEquals(char("a")(createCtx("")), {
    kind: "error",
    expected: " is not a",
    context: {
      text: "",
      rest: "",
      position: 0,
    },
  });
});

Deno.test("choice:success", () => {
  const txtA = "a";
  const txtB = "b";
  assertEquals(
    choice([char("a"), char("b")])({ text: txtA, rest: txtA, position: 0 }),
    {
      kind: "success",
      value: "a",
      context: {
        text: txtA,
        rest: "",
        position: 1,
      },
    },
  );
  assertEquals(
    choice([char("a"), char("b")])({ text: txtB, rest: txtB, position: 0 }),
    {
      kind: "success",
      value: "b",
      context: {
        text: txtB,
        rest: "",
        position: 1,
      },
    },
  );
});
Deno.test("choice:failed", () => {
  const txt = "c";
  assertEquals(
    choice([char("a"), char("b")])({ text: txt, rest: txt, position: 0 }),
    {
      kind: "error",
      expected: "",
      context: {
        text: txt,
        rest: txt,
        position: 0,
      },
    },
  );
});

Deno.test("count:success", () => {
  const txt = "aaaa";
  assertEquals(count(4, char("a"))(createCtx(txt)), {
    kind: "success",
    value: ["a", "a", "a", "a"],
    context: {
      text: txt,
      rest: "",
      position: 4,
    },
  });
  assertEquals(count(2, char("a"))(createCtx(txt)), {
    kind: "success",
    value: ["a", "a"],
    context: {
      text: txt,
      rest: "aa",
      position: 2,
    },
  });
});

Deno.test("count:failed", () => {
  const txt = "a";
  assertEquals(count(2, char("a"))(createCtx(txt)), {
    kind: "error",
    expected: "expected count 2 actual 1",
    context: {
      text: txt,
      rest: "",
      position: 1,
    },
  });
  assertEquals(count(1, char("b"))(createCtx(txt)), {
    kind: "error",
    expected: "expected count 1 actual 0",
    context: {
      text: txt,
      rest: "a",
      position: 0,
    },
  });
});

Deno.test("and:success", () => {
  const txt = "true";
  assertEquals(
    and([char("t"), char("r"), char("u"), char("e")])(createCtx(txt)),
    {
      kind: "success",
      value: ["t", "r", "u", "e"],
      context: {
        text: txt,
        rest: "",
        position: 4,
      },
    },
  );
});

Deno.test("and:failed", () => {
  const txt = "tru e";
  assertEquals(
    and([char("t"), char("r"), char("u"), char("e")])(createCtx(txt)),
    {
      kind: "error",
      expected: "  is not e",
      context: {
        text: txt,
        rest: " e",
        position: 3,
      },
    },
  );
});

Deno.test("many:success:empty", () => {
  const txt = "";
  assertEquals(many(char("a"))(createCtx(txt)), {
    kind: "success",
    value: [],
    context: {
      text: txt,
      rest: "",
      position: 0,
    },
  });
});
Deno.test("many:success:not match", () => {
  const txt = "bbbb";
  assertEquals(many(char("a"))(createCtx(txt)), {
    kind: "success",
    value: [],
    context: {
      text: txt,
      rest: "bbbb",
      position: 0,
    },
  });
});
Deno.test("many:success: not exist rest", () => {
  const txt = "aaaa";
  assertEquals(many(char("a"))(createCtx(txt)), {
    kind: "success",
    value: [..."aaaa"] as "a"[],
    context: {
      text: txt,
      rest: "",
      position: 4,
    },
  });
});
Deno.test("many:success: exist rest", () => {
  const txt = "aaaab";
  assertEquals(many(char("a"))(createCtx(txt)), {
    kind: "success",
    value: [..."aaaa"] as "a"[],
    context: {
      text: txt,
      rest: "b",
      position: 4,
    },
  });
});

Deno.test("many1:success: not exist rest", () => {
  const txt = "aaaa";
  assertEquals(many1(char("a"))(createCtx(txt)), {
    kind: "success",
    value: [..."aaaa"] as "a"[],
    context: {
      text: txt,
      rest: "",
      position: 4,
    },
  });
});
Deno.test("many:success: exist rest", () => {
  const txt = "aaaab";
  assertEquals(many(char("a"))(createCtx(txt)), {
    kind: "success",
    value: [..."aaaa"] as "a"[],
    context: {
      text: txt,
      rest: "b",
      position: 4,
    },
  });
});

Deno.test("many1:failed: empty", () => {
  const txt = "";
  assertEquals(many1(char("a"))(createCtx(txt)), {
    kind: "error",
    expected: " is not a",
    context: {
      text: txt,
      rest: "",
      position: 0,
    },
  });
});

Deno.test("many1:failed: not match", () => {
  const txt = "bbbb";
  assertEquals(many1(char("a"))(createCtx(txt)), {
    kind: "error",
    expected: "b is not a",
    context: {
      text: txt,
      rest: "bbbb",
      position: 0,
    },
  });
});

Deno.test("str:success", () => {
  const txt = "ab";
  assertEquals(str("ab")(createCtx(txt)), {
    kind: "success",
    value: ["a", "b"],
    context: {
      text: txt,
      rest: "",
      position: 2,
    },
  });
});
Deno.test("str:failed", () => {
  const txt = "ad";
  assertEquals(str("ab")(createCtx(txt)), {
    kind: "error",
    expected: "d is not b",
    context: {
      text: txt,
      rest: "d",
      position: 1,
    },
  });
});

Deno.test("countMinMax:success", () => {
  const txt = "aaaaa";
  assertEquals(countMinMax(1, 5, char("a"))(createCtx(txt)), {
    kind: "success",
    value: [...txt] as "a"[],
    context: {
      text: txt,
      rest: "",
      position: 5,
    },
  });
});

Deno.test("countMinMax:failed", () => {
  const txt = "aaa";
  const result = countMinMax(4, 5, char("a"))(createCtx(txt));
  assertEquals(result, {
    kind: "error",
    expected: "match count < 4",
    context: {
      text: txt,
      rest: "",
      position: 3,
    },
  });
});

Deno.test("map:success", () => {
  const txt = "adf";
  assertEquals(map(char("a"), () => "b")(createCtx(txt)), {
    kind: "success",
    value: "b",
    context: {
      text: txt,
      rest: "df",
      position: 1,
    },
  });
});

Deno.test("mapErr;success", () => {
  const txt = "";
  assertEquals(mapErr(char("a"), () => "b")(createCtx(txt)), {
    kind: "error",
    expected: "b",
    context: {
      text: txt,
      rest: "",
      position: 0,
    },
  });
});

Deno.test("surround:success", () => {
  const txt = "(abc)";
  assertEquals(surround("(", ")", str("abc"))(createCtx(txt)), {
    kind: "success",
    value: [..."abc"],
    context: {
      text: txt,
      rest: "",
      position: 5,
    },
  });
});
Deno.test("surround:failed", () => {
  const txt = "(abc";
  assertEquals(surround("(", ")", str("abc"))(createCtx(txt)), {
    kind: "error",
    expected: " is not )",
    context: {
      text: txt,
      rest: "",
      position: 4,
    },
  });
});

Deno.test("satisfy: success", () => {
  const txt = "ab";
  assertEquals(satisfy((c) => c != "d")(createCtx(txt)), {
    kind: "success",
    value: "a",
    context: {
      text: txt,
      rest: "b",
      position: 1,
    },
  });
});

Deno.test("satisfy: failure", () => {
  const txt = "ab";
  assertEquals<ReturnType<ReturnType<typeof satisfy>>>(
    satisfy((c) => c != "a")(createCtx(txt)),
    {
      kind: "error",
      expected: "no match predicate",
      context: {
        text: txt,
        rest: "ab",
        position: 0,
      },
    },
  );
});

Deno.test("not:success", () => {
  const txt = "ab";
  assertEquals(not(satisfy((c) => c == "d"))(createCtx(txt)), {
    kind: "success",
    value: null as never,
    context: {
      text: txt,
      rest: "b",
      position: 1,
    },
  });
});

Deno.test("not:failure", () => {
  const txt = "ab";
  assertEquals(not(satisfy((c) => c == "a"))(createCtx(txt)), {
    kind: "error",
    expected: "matched",
    context: {
      text: txt,
      rest: "ab",
      position: 0,
    },
  });
});

Deno.test("skip:success", () => {
  const txt = "ab";
  assertEquals(skip(char("a"))(createCtx(txt)), {
    kind: "success",
    value: null as never,
    context: {
      text: txt,
      rest: "b",
      position: 1,
    },
  });
});

Deno.test("skip:success:many", () => {
  const txt = "aab";
  assertEquals(skip(count(2, char("a")))(createCtx(txt)), {
    kind: "success",
    value: null as never,
    context: {
      text: txt,
      rest: "b",
      position: 2,
    },
  });
});

Deno.test("skip:error", () => {
  const txt = "ab";
  assertEquals(skip(char("d"))(createCtx(txt)), {
    kind: "error",
    expected: "a is not d",
    context: {
      text: txt,
      rest: "ab",
      position: 0,
    },
  });
});
