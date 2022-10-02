import { and, anyChar, char, choice, Context, count, countMinMax, eof, many, many1, map, mapErr, str, surround } from './index'

const createCtx = (txt: string): Context => {
  return {
    text: txt, rest: txt, position: 0
  }
}


describe("anyChar", () => {
  test("success", () => {
    const text = 'abc'
    expect(anyChar({ text, rest: text, position: 0 })).toStrictEqual({
      kind: 'success',
      value: 'a',
      context: {
        text,
        rest: 'bc',
        position: 1
      }
    })
  })

  test("failed", () => {
    const text = ''
    expect(anyChar({ text, rest: text, position: 0 })).toStrictEqual({
      kind: 'error',
      expected: 'empty character',
      context: {
        text,
        rest: '',
        position: 0
      }
    })
  })
})

describe("eof", () => {
  test("success", () => {
    const text = ""
    expect(eof({ text, rest: text, position: 0 })).toStrictEqual({
      kind: 'success',
      value: null,
      context: {
        text,
        rest: text,
        position: 0
      }
    })
  })

  test("failed", () => {
    const text = "a"
    expect(eof({ text, rest: text, position: 0 })).toStrictEqual({
      kind: 'error',
      expected: 'not EOF',
      context: {
        text,
        rest: text,
        position: 0
      }
    })
  })
})

describe("char", () => {
  test("success", () => {
    const text = 'a'
    expect(char('a')(createCtx(text))).toStrictEqual({
      kind: 'success',
      value: 'a',
      context: {
        text,
        rest: '',
        position: 1
      }
    })
  })

  test("failed", () => {
    const text = 'b'
    expect(char('a')(createCtx(text))).toStrictEqual({
      kind: 'error',
      expected: 'b is not a',
      context: {
        text,
        rest: 'b',
        position: 0
      }
    })
    expect(char('a')(createCtx(''))).toStrictEqual({
      kind: 'error',
      expected: ' is not a',
      context: {
        text: '',
        rest: '',
        position: 0
      }
    })
  })
})

describe("choice", () => {
  test("success", () => {
    const txtA = 'a'
    const txtB = 'b'
    expect(choice([char('a'), char('b')])({ text: txtA, rest: txtA, position: 0 })).toStrictEqual({
      kind: 'success',
      value: 'a',
      context: {
        text: txtA, rest: '', position: 1
      }
    })
    expect(choice([char('a'), char('b')])({ text: txtB, rest: txtB, position: 0 })).toStrictEqual({
      kind: 'success',
      value: 'b',
      context: {
        text: txtB, rest: '', position: 1
      }
    })
  })
  test("failed", () => {
    const txt = 'c'
    expect(choice([char('a'), char('b')])({ text: txt, rest: txt, position: 0 })).toStrictEqual({
      kind: 'error',
      expected: '',
      context: {
        text: txt, rest: txt, position: 0
      }
    })
  })
})

describe("count", () => {
  test("success", () => {
    const txt = 'aaaa'
    expect(count(4, char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: ['a','a', 'a', 'a'],
      context: {
        text: txt, rest: '', position: 4
      }
    })
    expect(count(2, char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: ['a','a'],
      context: {
        text: txt, rest: 'aa', position: 2
      }
    })
  })

  test("failed", () => {
    const txt = 'a'
    expect(count(2, char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: 'expected count 2 actual 1',
      context: {
        text: txt, rest: '', position: 1
      }
    })
    expect(count(1, char('b'))(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: 'expected count 1 actual 0',
      context: {
        text: txt, rest: 'a', position: 0
      }
    })
  })
})

describe("and", () => {
  test("success", () => {
    const txt = 'true'
    expect(and(Array.from(txt).map(c => char(c)))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [...txt],
      context: {
        text: txt,
        rest: '',
        position: 4
      }
    })
  })

  test("failed", () => {
    const txt = 'tru e'
    expect(and(Array.from('true').map(c => char(c)))(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: '  is not e',
      context: {
        text: txt,
        rest: ' e',
        position: 3
      }
    })
  })
})

describe("many", () => {
  test("success: empty", () => {
    const txt = ''
    expect(many(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [],
      context: {
        text: txt,
        rest: '',
        position: 0
      }
    })
  })
  test("success: not match", () => {
    const txt = 'bbbb'
    expect(many(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [],
      context: {
        text: txt,
        rest: 'bbbb',
        position: 0
      }
    })
  })
  test("success: not exist rest", () => {
    const txt = 'aaaa'
    expect(many(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [...'aaaa'],
      context: {
        text: txt,
        rest: '',
        position: 4
      }
    })
  })
  test("success: exist rest", () => {
    const txt = 'aaaab'
    expect(many(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [...'aaaa'],
      context: {
        text: txt,
        rest: 'b',
        position: 4
      }
    })
  })
})

describe("many1", () => {
  test("success: not exist rest", () => {
    const txt = 'aaaa'
    expect(many1(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [...'aaaa'],
      context: {
        text: txt,
        rest: '',
        position: 4
      }
    })
  })
  test("success: exist rest", () => {
    const txt = 'aaaab'
    expect(many(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [...'aaaa'],
      context: {
        text: txt,
        rest: 'b',
        position: 4
      }
    })
  })

  test("failed: empty", () => {
    const txt = ''
    expect(many1(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: ' is not a',
      context: {
        text: txt,
        rest: '',
        position: 0
      }
    })
  })

  test("failed: not match", () => {
    const txt = 'bbbb'
    expect(many1(char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: 'b is not a',
      context: {
        text: txt,
        rest: 'bbbb',
        position: 0
      }
    })
  })
})

describe("str", () => {
  test('success', ()  => {
    const txt = 'ab'
    expect(str('ab')(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: ['a', 'b'],
      context: {
        text: txt,
        rest: '',
        position: 2
      }
    })
  })
  test('failed', ()  => {
    const txt = 'ad'
    expect(str('ab')(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: 'd is not b',
      context: {
        text: txt,
        rest: 'd',
        position: 1
      }
    })
  })
})

describe("countMinMax", () => {
  test("success", () => {
    const txt = 'aaaaa'
    expect(countMinMax(1,5, char('a'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [...txt],
      context: {
        text: txt,
        rest: '',
        position: 5
      }
    })
  })

  test("failed", () => {
    const txt = 'aaa'
    const result = countMinMax(4,5, char('a'))(createCtx(txt))
    expect(result).toStrictEqual({
      kind: 'error',
      expected: 'match count < 4',
      context: {
        text: txt,
        rest: '',
        position: 3
      }
    })
  })
})

describe("map", () => {
  test("success", () => {
    const txt = 'adf'
    expect(map(char('a'), () => 'b')(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: 'b',
      context: {
        text: txt,
        rest: 'df',
        position: 1
      }
    })
  })
})

describe("mapErr", () => {
  test("success", () => {
    const txt = ''
    expect(mapErr(char('a'), () => 'b')(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: 'b',
      context: {
        text: txt,
        rest: '',
        position: 0
      }
    })
  })
})

describe("surround", () => {
  test("success", () => {
    const txt = "(abc)"
    expect(surround('(', ')', str('abc'))(createCtx(txt))).toStrictEqual({
      kind: 'success',
      value: [...'abc'],
      context: {
        text: txt,
        rest: '',
        position: 5
      }
    })
  })
  test("failed", () => {
    const txt = "(abc"
    expect(surround('(', ')', str('abc'))(createCtx(txt))).toStrictEqual({
      kind: 'error',
      expected: ' is not )',
      context: {
        text: txt,
        rest: '',
        position: 4
      }
    })
  })
})
