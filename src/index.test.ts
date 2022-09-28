import { anyChar, char, choice, eof } from './index'

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
