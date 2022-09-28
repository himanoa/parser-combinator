import { anyChar, eof } from './index'

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
